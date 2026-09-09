#!/usr/bin/env python3
"""Browser regression checks against a running Hugo site, not source regexes.

Setup (development only):
  python3 -m pip install playwright==1.57.0
  python3 -m playwright install chromium
  hugo server --disableLiveReload
  python3 scripts/check-typography.py

Use --browser webkit after installing that Playwright browser for a WebKit pass.
Use --executable /usr/bin/chromium for an existing Chromium installation.
This is not a substitute for reviewing the actual fonts over the day/night scene.
"""
from __future__ import annotations

import argparse
import sys
from urllib.parse import urljoin, urlparse

from playwright.sync_api import Error, Page, sync_playwright

VIEWPORTS = ((320, 568), (390, 844), (768, 1024), (1280, 800))


def check_type(page: Page, selector: str, minimum: float, family: str | None = None,
               sentence_case: bool = False) -> None:
    elements = page.locator(selector)
    assert elements.count(), f"Missing required element: {selector}"
    for element in elements.all():
        style = element.evaluate("""el => {
            const s = getComputedStyle(el);
            return {size: parseFloat(s.fontSize), family: s.fontFamily,
                    transform: s.textTransform};
        }""")
        assert style['size'] >= minimum - 0.1, f"{selector}: {style}"
        if family:
            assert family.lower() in style['family'].lower(), f"{selector}: {style}"
        if sentence_case:
            assert style['transform'] == 'none', f"{selector}: {style}"


def check_bounds(page: Page, selector: str) -> None:
    """Check text boxes too: overflow-x:clip can hide page-level overflow."""
    elements = page.locator(selector)
    assert elements.count(), f"Missing bounds target: {selector}"
    width = page.evaluate('document.documentElement.clientWidth')
    for element in elements.all():
        if not element.is_visible():
            continue
        box = element.bounding_box()
        assert box is not None
        assert box['x'] >= -1 and box['x'] + box['width'] <= width + 1, (
            f"Clipped {selector}: {box}, viewport={width}")
        # Measure text, excluding decorative pseudo-elements such as the scene glow.
        assert element.evaluate("""el => {
            const decorated = ['::before', '::after'].some(p =>
                !['none', 'normal'].includes(getComputedStyle(el, p).content));
            if (!decorated) return el.scrollWidth <= el.clientWidth + 1;
            const box = el.getBoundingClientRect();
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            for (let node; (node = walker.nextNode());) {
                if (!node.textContent.trim()) continue;
                const range = document.createRange();
                range.selectNodeContents(node);
                for (const rect of range.getClientRects()) {
                    if (rect.left < box.left - 1 || rect.right > box.right + 1) return false;
                }
            }
            return true;
        }"""), f"Text exceeds its box: {selector}"


def check_home(page: Page) -> None:
    check_type(page, '.scene-intro', 17, 'Literata')
    check_type(page, '.scene-personality', 13, 'Geologica', True)
    check_type(page, '.scene-corner', 13, 'Geologica', True)
    check_type(page, '.scene-corner--latest', 14)
    check_type(page, '.build-role', 14, 'Geologica', True)
    check_type(page, '.build-summary > div:first-child > p:first-child', 18, 'Literata')
    check_type(page, '.career-strip p', 16, 'Geologica')
    check_type(page, '.start-here-grid span', 16)
    check_bounds(page, '.scene-sentence, .scene-intro, .scene-personality, .scene-corner')
    boxes = [page.locator(s).bounding_box() for s in
             ('.scene-sentence', '.scene-intro', '.scene-personality')]
    assert all(boxes), 'Missing hero geometry'
    for first, second in zip(boxes, boxes[1:]):
        assert first['y'] + first['height'] <= second['y'] + 1, 'Hero text overlaps'
    if page.viewport_size['width'] <= 680:
        message = page.locator('.scene-message').bounding_box()
        origin = page.locator('.scene-corner--origin').bounding_box()
        latest = page.locator('.scene-corner--latest').bounding_box()
        assert message['y'] + message['height'] <= origin['y'] + 1, 'Hero collides with origin'
        assert origin['y'] + origin['height'] <= latest['y'] + 1, 'Hero footer labels overlap'


def check_article(page: Page) -> None:
    check_type(page, '.article-prose', 18, 'Literata')
    check_bounds(page, '.article-prose')
    measure = page.locator('.article-prose').evaluate("""el => {
        const s = getComputedStyle(el);
        const probe = document.createElement('span');
        probe.style.cssText = 'display:block;width:65ch';
        el.append(probe);
        const limit = probe.getBoundingClientRect().width;
        probe.remove();
        return {width: el.getBoundingClientRect().width, max: limit,
                leading: parseFloat(s.lineHeight) / parseFloat(s.fontSize)};
    }""")
    assert measure['width'] <= measure['max'] + 1, f"Reading measure exceeded: {measure}"
    assert 1.65 <= measure['leading'] <= 1.75, f"Reading leading: {measure}"
    if page.locator('.article-rail a').count():
        check_type(page, '.article-rail a', 14, 'Geologica', True)
        for link in page.locator('.article-rail a').all():
            if link.is_visible():
                assert link.bounding_box()['height'] >= 44, 'Article contents target below 44px'


def go(page: Page, url: str) -> None:
    response = page.goto(url, wait_until='load')
    assert response is not None and response.ok, f"Failed to load {url}"
    page.evaluate('document.fonts.ready')


def discover_detail(page: Page, base: str, section: str) -> str:
    go(page, urljoin(base, section + '/'))
    for href in page.locator('a[href]').evaluate_all('(links) => links.map(a => a.href)'):
        parsed = urlparse(href)
        parts = parsed.path.strip('/').split('/')
        if parsed.netloc == urlparse(base).netloc and len(parts) == 2 and parts[0] == section:
            return parsed.path
    raise AssertionError(f'No {section} detail page found in its index')


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://127.0.0.1:1313/')
    parser.add_argument('--article-path', help='Optional specific article instead of first index entry')
    parser.add_argument('--project-path', help='Optional specific project instead of first index entry')
    parser.add_argument('--browser', choices=('chromium', 'webkit'), default='chromium')
    parser.add_argument('--executable', help='Optional local browser executable')
    args = parser.parse_args()
    base = args.base_url.rstrip('/') + '/'
    failures = []
    passed = 0
    with sync_playwright() as p:
        launch = {'headless': True}
        if args.executable:
            launch['executable_path'] = args.executable
        browser = getattr(p, args.browser).launch(**launch)
        try:
            probe = browser.new_page()
            article = args.article_path or discover_detail(probe, base, 'posts')
            project = args.project_path or discover_detail(probe, base, 'projects')
            probe.close()
            routes = ('/', '/projects/', project, '/posts/', article, '/about/', '/contact/')
            for width, height in VIEWPORTS:
                for theme in ('dark', 'light'):
                    context = browser.new_context(viewport={'width': width, 'height': height},
                                                  reduced_motion='reduce')
                    page = context.new_page()
                    page.set_default_timeout(15000)
                    for route in routes:
                        label = f'{args.browser} {width}x{height} {theme} {route}'
                        try:
                            go(page, urljoin(base, route))
                            page.evaluate('(theme) => document.documentElement.dataset.theme = theme', theme)
                            assert page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), 'Page overflows horizontally'
                            check_type(page, '.theme-toggle', 14, 'Geologica', True)
                            if route == '/':
                                check_home(page)
                                loaded = page.evaluate("[...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replaceAll('\"', ''))")
                                assert all(font in [family.lower() for family in loaded] for font in ('geologica', 'literata')), f'Webfonts did not load: {loaded}'
                                if width <= 680:
                                    page.locator('.menu-button').click()
                                    check_type(page, '.primary-navigation a', 22, 'Geologica')
                                    check_bounds(page, '.primary-navigation a')
                                else:
                                    check_type(page, '.primary-navigation a', 14, 'Geologica')
                            if route == article:
                                check_article(page)
                            passed += 1
                            print(f'PASS {label}')
                        except (AssertionError, Error) as error:
                            failures.append(f'{label}: {error}')
                            print(f'FAIL {failures[-1]}', file=sys.stderr)
                    context.close()
        finally:
            browser.close()
    print(f'{passed} page/viewport/theme checks passed; {len(failures)} failed')
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
