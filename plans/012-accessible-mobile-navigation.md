# Plan 012: Make the mobile menu natively focusable and stateful

> **Executor instructions**: Execute each step and verification exactly. Stop and report on a STOP condition. The reviewer maintains `plans/README.md`; do not edit the index.
>
> **Execution precondition and drift check (run first)**: Run `test "$(git branch --show-current)" = "improve/012-accessible-mobile-navigation" && test "$(git rev-parse HEAD)" = "756cff0b45e6b896ceba2572db1cf4cb00142ac5" && test -z "$(git status --porcelain)"` in the isolated worktree. STOP unless the branch, baseline, and completely clean state all match.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `756cff0`, 2026-07-18 (scoped files unchanged from audited `a450b29`)

## Why this matters

The mobile menu places keyboard focus on a fully transparent checkbox with pointer events disabled while showing a separate `<label>` as the control. The global focus ring is therefore invisible, and the visible control has no native expanded/collapsed semantics. A native `<details>/<summary>` disclosure preserves no-JavaScript operation, keyboard activation, focus visibility, and state announcement without creating another script-owned state machine.

## Current state

- `layouts/partials/header.html:9-19` contains:
  ```html
  <input class="menu-toggle" type="checkbox" id="menu-toggle">
  <label class="menu-button" for="menu-toggle" aria-controls="primary-navigation">…</label>
  <nav class="primary-navigation" id="primary-navigation" …>…</nav>
  ```
- `assets/css/custom.css:268` hides both `.menu-toggle` and `.menu-button` on desktop.
- `assets/css/custom.css:1807-1815` makes the checkbox transparent/non-pointer and uses sibling selectors to show the mobile nav.
- `assets/css/custom.css:1771` already provides a global `*:focus-visible` outline. The real visible summary should receive it.
- Preserve the existing identity link, nav labels/order, active `aria-current` state, header surfaces, 680px breakpoint, and plus-to-close rotation.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Build and HTML gate | `make quality-gate` | exit 0; htmltest passes |
| Confirm old control removed | `rg -n "menu-toggle|type=\"checkbox\"|<label class=\"menu-button\"" layouts/partials/header.html assets/css/custom.css` | no matches |
| Confirm native disclosure | `rg -n "<details|<summary|\[open\]" layouts/partials/header.html assets/css/custom.css` | details, summary, and open-state rules present |
| Inspect committed scope | `git diff --name-only 756cff0b45e6b896ceba2572db1cf4cb00142ac5...HEAD` | exactly the header partial and custom CSS |

## Scope

**In scope**:
- `layouts/partials/header.html`
- `assets/css/custom.css`

**Out of scope**:
- `assets/js/theme.js` or any new JavaScript
- Navigation labels, order, URLs, identity, active state logic
- Header colors, page-specific surfaces, breakpoint changes
- Desktop navigation redesign

## Git workflow

- Branch: `improve/012-accessible-mobile-navigation`
- One commit after verification: `Make the mobile menu natively accessible`
- Do not push or open a PR.

## Steps

### Step 1: Replace checkbox/label with native disclosure markup

Wrap the existing mobile control and `<nav>` in exactly `<details class="site-navigation">`. Replace the label with `<summary class="menu-button">` containing the unchanged visible `Menu` and `+` spans. Keep `id="primary-navigation"`, `aria-label="Main navigation"`, the identity anchor, all links, their order, and Hugo `aria-current` expressions byte-for-byte unchanged; do not re-indent the identity or nav blocks.

Do not add redundant `role`, `tabindex`, or manually maintained `aria-expanded`; native details/summary semantics own that state.

**Verify**: `node -e 'const fs=require("fs");const h=fs.readFileSync("layouts/partials/header.html","utf8");const d=[...h.matchAll(/<details class="site-navigation">([\s\S]*?)<\/details>/g)];if(d.length!==1)throw new Error("expected one site-navigation details");if(!/^\s*<summary class="menu-button">[\s\S]*?<\/summary>\s*<nav class="primary-navigation" id="primary-navigation"[\s\S]*?<\/nav>\s*$/.test(d[0][1]))throw new Error("summary and primary nav must be ordered children inside details")'` → exactly one disclosure contains the summary followed by `nav#primary-navigation` before closing.

Also run `node -e 'const fs=require("fs"),{execFileSync}=require("child_process");const live=fs.readFileSync("layouts/partials/header.html","utf8"),base=execFileSync("git",["show","756cff0b45e6b896ceba2572db1cf4cb00142ac5:layouts/partials/header.html"],{encoding:"utf8"});for(const [name,re] of [["identity",/<a class="site-identity"[\s\S]*?<\/a>/],["navigation",/<nav class="primary-navigation"[\s\S]*?<\/nav>/]]){const a=base.match(re),b=live.match(re);if(!a||!b||a[0]!==b[0])throw new Error(name+" block changed")}'` → identity and complete nav block remain byte-for-byte equal to baseline.

### Step 2: Make disclosure styling desktop-transparent and mobile-native

Replace `.menu-toggle` styles and checked-sibling selectors. On desktop, set `.site-navigation { display: contents; }`, add `.site-navigation::details-content { display: contents; content-visibility: visible; }`, keep `.site-navigation > .menu-button` hidden, and explicitly keep `.site-navigation > .primary-navigation` flex-visible even when `<details>` lacks `open`. The `::details-content` override is required because current browsers hide the internal closed-details content slot independently of the child nav's `display`; current Chrome/Safari/Firefox support is an acceptance requirement. This must preserve the existing two-column header grid.

At `max-width: 680px`, switch `.site-navigation` to `display: block` in the header's second grid cell and restore the details slot's native state with `.site-navigation::details-content { display: block; }`, `.site-navigation:not([open])::details-content { content-visibility: hidden; }`, and `.site-navigation[open]::details-content { content-visibility: visible; }`. Show the summary with the exact selector `.site-navigation > .menu-button { display: flex; ... }` so it has equal selector specificity and later source order than the desktop hide rule. Use `.site-navigation:not([open]) > .primary-navigation { display: none; }`, and restore the dropdown with the exact open-state declaration `.site-navigation[open] > .primary-navigation { display: flex; }`. Rotate the plus glyph from `.site-navigation[open]`. Ensure the summary has no default list marker (`list-style: none` and the WebKit marker override), inherits the existing button appearance, and receives the existing `:focus-visible` outline without clipping.

Do not use `!important` unless the browser's native closed-details rule cannot be beaten by a specific author selector; first prefer a sufficiently specific desktop `.site-navigation > .primary-navigation` rule.

**Verify**: use a brace-aware split so desktop and mobile declarations cannot be reversed: `node -e 'const fs=require("fs");const css=fs.readFileSync("assets/css/custom.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");function blocks(label){const out=[];let from=0;while((from=css.indexOf(label,from))!==-1){const open=css.indexOf("{",from);let depth=1,end=open+1;for(;end<css.length&&depth;end++){if(css[end]==="{")depth++;else if(css[end]==="}")depth--}out.push(css.slice(open+1,end-1));from=end}return out.join("\n")}const desktop=css.slice(0,css.indexOf("@media")),mobile=blocks("@media (max-width: 680px)");const parse=s=>[...s.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m=>({selectors:m[1].split(",").map(x=>x.trim()),body:m[2]}));const owns=(rules,s,d)=>rules.some(r=>r.selectors.includes(s)&&new RegExp("(?:^|;)\\s*"+d.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\s*(?:;|$)").test(r.body));const checks=[[desktop,".site-navigation","display: contents"],[desktop,".site-navigation::details-content","display: contents"],[desktop,".site-navigation::details-content","content-visibility: visible"],[desktop,".site-navigation > .menu-button","display: none"],[desktop,".site-navigation > .primary-navigation","display: flex"],[mobile,".site-navigation","display: block"],[mobile,".site-navigation::details-content","display: block"],[mobile,".site-navigation:not([open])::details-content","content-visibility: hidden"],[mobile,".site-navigation[open]::details-content","content-visibility: visible"],[mobile,".site-navigation:not([open]) > .primary-navigation","display: none"],[mobile,".site-navigation[open] > .primary-navigation","display: flex"],[mobile,".site-navigation > .menu-button","display: flex"],[mobile,".site-navigation > .menu-button","list-style: none"],[mobile,".menu-button::-webkit-details-marker","display: none"]];for(const [scope,s,d] of checks)if(!owns(parse(scope),s,d))throw new Error(s+" lacks "+d+" in correct scope");if(!owns(parse(mobile),".site-navigation[open] .menu-button span:last-child","transform: rotate(45deg)"))throw new Error("open icon rotation missing")'` → exact top-level desktop and 680px mobile ownership passes, including a mobile summary selector that beats the desktop hide rule.

### Step 3: Build and inspect scope

Run the full gate. Confirm no menu JavaScript, text, or URL changed.

Commit the verified implementation, then run: `make quality-gate && git diff --check 756cff0b45e6b896ceba2572db1cf4cb00142ac5...HEAD && test "$(git diff --name-only 756cff0b45e6b896ceba2572db1cf4cb00142ac5...HEAD | sort | tr '\n' ' ')" = "assets/css/custom.css layouts/partials/header.html " && test -z "$(git status --porcelain)"` → passes; the committed range contains exactly the header partial and custom CSS, with no residual worktree changes.

## Test plan

- Static rendered HTML: inspect `public/index.html` after the build and confirm one `<details>`, one `<summary>`, one `nav#primary-navigation`, and no `input#menu-toggle`.
- Command: `node -e 'const fs=require("fs");const h=fs.readFileSync("public/index.html","utf8");for(const [name,re,count] of [["details",/<details(?:\s|>)/g,1],["summary",/<summary(?:\s|>)/g,1],["primary navigation id",/id=primary-navigation/g,1],["old menu id",/id=menu-toggle/g,0]]){const actual=(h.match(re)||[]).length;if(actual!==count)throw new Error(name+": expected "+count+", got "+actual)}'` → exact cardinalities pass.
- Reviewer-only browser checks at 390×844: Tab visibly focuses Menu; Enter/Space opens it; native state changes; links are reachable; plus rotates; desktop 1440×900 nav remains visible without opening details; no header reflow in either theme.

## Done criteria

- [ ] `make quality-gate` passes.
- [ ] Checkbox/label control and all `.menu-toggle` CSS are removed.
- [ ] Native details/summary owns disclosure state with no JavaScript.
- [ ] Desktop nav remains visible when details is closed.
- [ ] Mobile summary receives a visible focus outline and opens the same dropdown.
- [ ] Navigation content/order/URLs and active-state logic are unchanged.
- [ ] Only the two in-scope files are modified.

## STOP conditions

- The current header no longer matches the excerpt.
- Desktop visibility requires JavaScript or duplicate navigation markup.
- Native disclosure cannot preserve the existing desktop grid after two reasonable CSS attempts.
- The quality gate fails twice.

## Maintenance notes

Keep disclosure state native. If future menu behavior needs Escape/outside-click handling, justify JavaScript as progressive enhancement rather than replacing the working details/summary baseline.
