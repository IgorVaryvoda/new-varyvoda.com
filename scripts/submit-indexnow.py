#!/usr/bin/env python3
"""Submit changed Hugo URLs to IndexNow after a successful deployment."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path


DEFAULT_BASE_URL = "https://www.varyvoda.com"
DEFAULT_ENDPOINT = "https://api.indexnow.org/indexnow"
ZERO_SHA = "0" * 40


def git(*args: str) -> bytes:
    return subprocess.check_output(["git", *args], stderr=subprocess.PIPE)


def resolve_before(before: str, after: str) -> str:
    if before != ZERO_SHA:
        try:
            git("cat-file", "-e", f"{before}^{{commit}}")
            return before
        except subprocess.CalledProcessError:
            pass

    try:
        git("cat-file", "-e", f"{after}^{{commit}}")
        return f"{after}^"
    except subprocess.CalledProcessError as error:
        raise RuntimeError(f"Cannot resolve the commit before {after}") from error


def changed_paths(before: str, after: str) -> list[tuple[str, str | None, str | None]]:
    fields = git(
        "diff", "--name-status", "--find-renames", "-z", before, after, "--"
    ).decode("utf-8").split("\0")
    if fields and not fields[-1]:
        fields.pop()

    changes: list[tuple[str, str | None, str | None]] = []
    index = 0
    while index < len(fields):
        status = fields[index]
        index += 1
        if status.startswith(("R", "C")):
            old_path, new_path = fields[index : index + 2]
            index += 2
        else:
            path = fields[index]
            index += 1
            old_path = None if status == "A" else path
            new_path = None if status == "D" else path
        changes.append((status[0], old_path, new_path))
    return changes


def file_at(revision: str, path: str | None) -> str | None:
    if not path:
        return None
    try:
        return git("show", f"{revision}:{path}").decode("utf-8")
    except (subprocess.CalledProcessError, UnicodeDecodeError):
        return None


def front_matter(document: str | None) -> dict[str, str]:
    if not document or not document.startswith("---"):
        return {}

    lines = document.splitlines()
    values: dict[str, str] = {}
    for line in lines[1:]:
        if line.strip() == "---":
            break
        key, separator, value = line.partition(":")
        if separator and key.strip() in {"draft", "slug", "url"}:
            values[key.strip()] = value.split("#", 1)[0].strip().strip("\"'")
    return values


def is_published(document: str | None) -> bool:
    if document is None:
        return False
    return front_matter(document).get("draft", "false").lower() not in {
        "true",
        "yes",
        "1",
    }


def absolute_url(base_url: str, path: str) -> str:
    return urllib.parse.urljoin(f"{base_url.rstrip('/')}/", path)


def content_url(base_url: str, path: str, document: str | None) -> str:
    metadata = front_matter(document)
    if metadata.get("url"):
        return absolute_url(base_url, metadata["url"])

    relative = Path(path).relative_to("content")
    if relative.name == "_index.md":
        parts = relative.parts[:-1]
    else:
        stem = metadata.get("slug") or relative.stem
        parts = (*relative.parts[:-1], stem)

    route = "/".join(parts)
    return absolute_url(base_url, f"/{route}/" if route else "/")


def static_html_url(base_url: str, path: str | None) -> str | None:
    if not path or not path.startswith("static/") or not path.endswith(".html"):
        return None
    relative = path.removeprefix("static/")
    route = (
        relative.removesuffix("index.html")
        if relative.endswith("index.html")
        else relative
    )
    return absolute_url(base_url, f"/{route}")


def sitemap_urls(path: Path) -> set[str]:
    root = ET.parse(path).getroot()
    return {
        element.text.strip()
        for element in root.iter()
        if element.tag.endswith("loc") and element.text
    }


def related_listing_urls(base_url: str, path: str) -> set[str]:
    relative = Path(path).relative_to("content")
    if len(relative.parts) < 2 or relative.parts[0] not in {"posts", "projects"}:
        return set()
    return {
        absolute_url(base_url, "/"),
        absolute_url(base_url, f"/{relative.parts[0]}/"),
    }


def affected_urls(
    before: str, after: str, base_url: str, current_sitemap: set[str]
) -> list[str]:
    urls: set[str] = set()
    rebuilds_every_page = False

    for _status, old_path, new_path in changed_paths(before, after):
        paths = {path for path in (old_path, new_path) if path}
        if any(
            path == "config.toml"
            or path.startswith(("layouts/", "data/", "i18n/"))
            or (path.startswith("themes/") and "/layouts/" in path)
            for path in paths
        ):
            rebuilds_every_page = True

        for path in (old_path, new_path):
            static_url = static_html_url(base_url, path)
            if static_url:
                urls.add(static_url)

        content_paths = {
            path
            for path in (old_path, new_path)
            if path and path.startswith("content/") and path.endswith(".md")
        }
        for path in content_paths:
            old_document = file_at(before, path) if path == old_path else None
            new_document = file_at(after, path) if path == new_path else None
            old_live = is_published(old_document)
            new_url = (
                content_url(base_url, path, new_document) if new_document else None
            )
            new_live = (
                is_published(new_document)
                and new_url is not None
                and new_url in current_sitemap
            )

            if old_live and old_document:
                urls.add(content_url(base_url, path, old_document))
            if new_live and new_url:
                urls.add(new_url)
            if old_live or new_live:
                urls.update(related_listing_urls(base_url, path))

    if rebuilds_every_page:
        urls.update(current_sitemap)

    host = urllib.parse.urlsplit(base_url).netloc
    return sorted(url for url in urls if urllib.parse.urlsplit(url).netloc == host)


def request_with_retries(
    request: urllib.request.Request, accepted: set[int]
) -> int:
    last_error: Exception | None = None
    for attempt, delay in enumerate((0, 2, 5), start=1):
        if delay:
            time.sleep(delay)
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                if response.status in accepted:
                    return response.status
                last_error = RuntimeError(f"Unexpected HTTP {response.status}")
        except urllib.error.HTTPError as error:
            last_error = error
            if error.code < 500 and error.code != 429:
                break
        except urllib.error.URLError as error:
            last_error = error
        print(f"Request attempt {attempt} failed; retrying", file=sys.stderr)
    raise RuntimeError(f"Request failed: {last_error}")


def verify_key(key: str, key_location: str) -> None:
    request = urllib.request.Request(
        key_location,
        headers={"User-Agent": "varyvoda.com IndexNow deployment"},
    )
    for attempt, delay in enumerate((0, 2, 5), start=1):
        if delay:
            time.sleep(delay)
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                if response.read().decode("utf-8").strip() == key:
                    return
        except (urllib.error.URLError, UnicodeDecodeError):
            pass
        print(f"Key verification attempt {attempt} failed; retrying", file=sys.stderr)
    raise RuntimeError(f"IndexNow key is not available at {key_location}")


def submit(
    urls: list[str], base_url: str, key_file: Path, endpoint: str
) -> int:
    key = key_file.read_text(encoding="utf-8").strip()
    valid_characters = all(
        character.isascii() and (character.isalnum() or character == "-")
        for character in key
    )
    if not 8 <= len(key) <= 128 or not valid_characters:
        raise ValueError("IndexNow key must be 8-128 letters, numbers, or dashes")

    key_location = absolute_url(base_url, f"/{key_file.name}")
    verify_key(key, key_location)
    payload = json.dumps(
        {
            "host": urllib.parse.urlsplit(base_url).netloc,
            "key": key,
            "keyLocation": key_location,
            "urlList": urls,
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        endpoint,
        data=payload,
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "varyvoda.com IndexNow deployment",
        },
        method="POST",
    )
    return request_with_retries(request, {200, 202})


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--before", required=True)
    parser.add_argument("--after", default="HEAD")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--sitemap", type=Path, default=Path("public/sitemap.xml"))
    parser.add_argument("--key-file", type=Path, required=True)
    parser.add_argument("--endpoint", default=DEFAULT_ENDPOINT)
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        before = resolve_before(args.before, args.after)
        urls = affected_urls(
            before, args.after, args.base_url, sitemap_urls(args.sitemap)
        )
        if not urls:
            print("No indexable URL changes detected; skipping IndexNow")
            return 0
        if args.dry_run:
            print("\n".join(urls))
            return 0

        status = submit(urls, args.base_url, args.key_file, args.endpoint)
        print(f"IndexNow accepted {len(urls)} changed URL(s) (HTTP {status})")
        return 0
    except (OSError, RuntimeError, ValueError, ET.ParseError) as error:
        print(f"IndexNow submission failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
