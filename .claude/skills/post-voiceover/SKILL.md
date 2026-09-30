---
name: post-voiceover
description: Narrate blog posts in Igor's cloned voice with ElevenLabs and publish the read-along player (word highlight and auto-scroll). Use when the user asks to generate, regenerate or re-time post audio, voiceover, narration or "listen" buttons, or asks what ElevenLabs narration costs.
---

# Post voiceover

Posts in `content/posts/` can have narration in Igor's cloned voice. A post with `static/audio/posts/<slug>.mp3` gets a Listen button in the hero. A post that also has `<slug>.json` gets the read-along: the spoken word is highlighted and the page scrolls to follow it.

## Parts

| File | Job |
|---|---|
| `scripts/generate-post-audio.mjs` | Markdown to narration text, ElevenLabs speech, forced-alignment word timings |
| `layouts/posts/single.html` | Renders the player when the MP3 exists; adds `data-listen-words` when the JSON exists |
| `assets/js/article-listen.js` | Play, pause, seek, speed (1× to 2×, saved in `localStorage` as `listen-rate`), docked player, word highlight (CSS Custom Highlight API), auto-scroll |
| `assets/css/pages/posts.css` | `.article-listen*` styles and `::highlight(listen-word)` |
| `static/audio/posts/<slug>.mp3` / `.json` | Audio and `[[word, start, end], ...]` timings in seconds |

Settings in the script: voice `Hoda3ttvceqnSzH0cHhZ` ("Me - fresh"), model `eleven_v4`, `mp3_44100_128`, 9,000-character chunks (the model limit is 10,000).

## API key

The key is `ELEVENLABS_KEY` in `/home/igor/Projects/sirv-showreel/.env.local`. Never copy it into this repo. Pass it only through the environment:

```bash
ELEVENLABS_KEY=$(grep '^ELEVENLABS_KEY' /home/igor/Projects/sirv-showreel/.env.local | cut -d= -f2- | tr -d '"'"'")
```

## Cost and quota

- `eleven_v4` speech costs 0.11 credits per character. Forced alignment costs about 18 credits per minute of audio. Together this is about 117 credits per minute of narration.
- The Starter plan ($6 per month) has about 32,000 credits. Other projects (sirv-showreel music and TTS) use the same quota.
- Check the balance before a batch. Estimate the batch as `chars × 0.11 + minutes × 18`; narration runs at about 16 characters per second.

```bash
curl -s https://api.elevenlabs.io/v1/user/subscription -H "xi-api-key: $ELEVENLABS_KEY" | jq '{left: (.character_limit - .character_count), reset: (.next_character_count_reset_unix | todate)}'
curl -s "https://api.elevenlabs.io/v1/history?page_size=20" -H "xi-api-key: $ELEVENLABS_KEY" | jq -r '.history[] | "\(.date_unix|todate) \(.model_id) \((.character_count_change_to//0) - (.character_count_change_from//0))"'
```

## Procedure

1. Find posts without audio. The shell is zsh, so do not rely on word splitting of an unquoted variable:
   ```bash
   for f in content/posts/*.md; do s=$(basename $f .md); [ "$s" = _index ] && continue; [ -f static/audio/posts/$s.mp3 ] || echo $s; done
   ```
2. Read the narration text before you spend credits. Look for leftover markup, URLs, code or table noise:
   ```bash
   DRY=1 node scripts/generate-post-audio.mjs <slug>... > /tmp/narration.txt
   grep -nE '`|<|>|\{|\}|https?://|&[a-z#0-9]+;' /tmp/narration.txt
   ```
   Fix the `narration()` function if a new markup pattern gets through. It removes front matter, fenced code, `<pre>`/`<code>`/`<figure>`/`<script>` blocks, shortcodes, images, HTML comments, italic caption lines, link-only footer lines and URLs. It reads each heading, list item and table row as one sentence.
3. Generate. The script writes the MP3, then calls forced alignment and writes the JSON:
   ```bash
   ELEVENLABS_KEY=... node scripts/generate-post-audio.mjs <slug>...
   ```
   Put multi-chunk posts (more than 9,000 characters of narration) last. A failed request stops the loop.
4. To re-time existing audio with no new speech (for example after the article text changes a little), use `--align`:
   ```bash
   ELEVENLABS_KEY=... node scripts/generate-post-audio.mjs --align <slug>...
   ```
5. Check the coverage. The last word in the JSON must end within about a second of the MP3 duration:
   ```bash
   ffprobe -v error -show_entries format=duration -of csv=p=0 static/audio/posts/<slug>.mp3; jq -c '.[-1]' static/audio/posts/<slug>.json
   ```
6. Restart `hugo server`. It does not re-render pages when new files appear in `static/`, and after many fast rebuilds it can drop fingerprinted CSS (pages with no styles).
7. Run the read-along check. See `check-readalong.mjs` in this skill directory. It seeks to 60 points per post and compares the highlighted word with the JSON word. Expect 60 of 60. A miss on a token without letters (an emoji, a lone `)`) is correct behaviour.
8. Land it when the user asks: run the CI gates (`hugo --gc --minify`, `python3 scripts/sync-literata-italics.py --check`, `node scripts/validate-projects.mjs`, htmltest with `.htmltest.yml`, `node scripts/test-agent-readiness.mjs`), commit `static/audio/posts`, push `main`, watch the "Deploy Hugo Site" run, then curl a production page for `data-listen-words` and the MP3 for `200 audio/mpeg`.

## Gotchas

- Some posts set a custom `url` in front matter. `expets-sirv-optimization` lives at `/experts-nuxt-Sirv/`. Audio files always use the content file name, not the URL.
- The read-along matcher is greedy with a 40-word lookahead. Text that the narration skips (captions, code) stays unhighlighted and does not break the sync.
- Auto-scroll uses `scrollTo` with an absolute target. `scrollBy` accumulates during smooth scrolling and overshoots.
- Chunk joins use `previous_text` and `next_text`. `image-personalization` is the first post with two chunks; listen to the join after you make a new multi-chunk post.
