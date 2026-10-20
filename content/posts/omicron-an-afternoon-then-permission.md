---
title: "Omicron: built in an afternoon, then taught to ask"
date: 2026-10-20
draft: false
content_type: "Build record"
description: "Tap the Watch, speak, stop. Omicron's first version took one afternoon. Getting it to ask before my voice leaves the phone took two more passes."
featuredImage: "/images/posts/omicron-an-afternoon-then-permission.webp"
image_alt: "A glowing amber watch dial on wet rocks at dusk, a thin ribbon of light crossing misty water to a half-open lit doorway."
ogImage: "https://www.varyvoda.com/images/posts/omicron-an-afternoon-then-permission.jpg"
---

Omicron is the smallest thing I could build for catching ideas before they vanish. Tap a complication on the Apple Watch, talk, tap stop. Soon after, the iPhone has a cleaned-up note with a title, and a Markdown file has appeared in iCloud Drive.

## One afternoon

On 27 August at 17:25 the repo got a README with one line in it. Fourteen minutes later it had a 144-line plan. At 18:12 the whole first version landed in one commit: 48 files and about 4,500 lines, 815 of them Xcode project boilerplate. The icons were in by 19:49.

Most of the plan is about what the app won't do:

> No backend, accounts, billing, public API keys, standalone Watch networking, live streaming, always-listening mode, speaker diarization, Watch inbox, rich Markdown editor, arbitrary export folders, two-way file sync, model browser, automatic model fallback, tags, or task extraction in personal v1.

That list is why it fit in an afternoon. The app uses Apple's own frameworks for everything: audio, Watch transfer, storage, Keychain, notifications, background tasks and the complication. The only extra tool is XcodeGen, and that's for development.

## How a thought gets to a file

The complication opens `omicron://record`, and the Watch starts recording straight away with a haptic tap. It records 16 kHz mono AAC at 48 kbps, which is plenty for a voice and small enough to move to the phone quickly. A red ring follows your voice level. Lowering your wrist doesn't stop it. Stop is a button you press, with a 10-minute cap in case you forget. Silence detection exists but is off by default, because an app that stops when you pause to think is no good for thinking.

The Watch has no network of its own in this version. Each recording is saved with a small JSON sidecar and sent to the phone through WatchConnectivity. The Watch deletes its copy only after the phone confirms receipt. If the app dies mid-transfer, the next launch finds the orphaned audio and queues it again. On the phone, each recording is keyed by its ID, so a file delivered twice produces one note.

Then the phone does the work, through Groq:

- **Transcription** with `whisper-large-v3-turbo`, with no language set, so it hears whatever language you spoke.
- **Cleanup** with a Qwen model at temperature 0, forced into a strict JSON shape with a title and a body.

This is the whole cleanup prompt:

> Clean up a spoken note faithfully. Preserve the language used by the speaker. Remove filler, fix punctuation, and add useful paragraphs. Do not add facts, change intent, summarize away details, or translate. Return only the requested structured output with a concise title and Markdown body.

The prompt is the only thing holding the model to "faithfully." Nothing checks it afterwards. So every exported file keeps the raw transcript under the cleaned text:

```markdown
# Title

Cleaned note

## Transcript

Exactly what Whisper heard
```

If the cleanup ever drifts, the original is right there. The model is also fixed. If Groq retires it, Omicron shows the error and doesn't quietly switch to a different model.

## Personal until it isn't

The plan said "personal use first; public App Store distribution later." Later came on 16 September, when the first build went to App Review and came back rejected.

The reason was the Watch icon. It reused the iPhone artwork on a near-black background, and watchOS masks icons into circles. On a black watch face, a near-black circle doesn't read as a circle. Apple filed it under Guideline 4, Design. The fix was a white mark on a purple-to-blue gradient and a new build.

The bigger change that day was consent. Until then, having a Groq API key counted as permission to use it. The commit that changed this explains why:

> Audio and transcripts leave the device for a US third party that may retain them for up to 30 days, so consent is now required before any request is made rather than implied by the presence of an API key.

The first attempt was clumsy. It showed a permission sheet you couldn't dismiss, and recordings made without permission were marked as failed. A week later I redid it:

- "Not now" works. You can record without allowing anything.
- Recordings made before you allow processing wait as "Waiting for Groq permission" instead of failing. They're sent once you say yes.
- The Groq client checks consent before it even reads the audio file, and a test covers that.
- Removing your API key also withdraws permission.
- Settings has a "Stop sending data to Groq" switch.

It's my key and usually my voice, so this can look like overkill. But a voice note picks up whoever's in the room. The permission screen says it plainly: speech "may contain personal information about you or others." That's true even for a single user.

## What it doesn't keep

There's no Omicron server and no analytics. The API key lives in the iPhone Keychain, stays on that device and never goes to the Watch. Audio from finished notes is deleted after seven days. Audio from failed or paused notes stays, because a failure must never cost you a recording.

When a note is ready, you can hand it off: Omicron copies it to the clipboard for ten minutes and opens Claude, ChatGPT or Zeron. A share sheet covers everything else.

The plan for a public version says it should add only "the distribution, privacy, deletion, support, and account machinery proven necessary by use of the personal app." That's the rule I keep coming back to. Build the version for one person first. Add the rest once that person has shown what it needs.

[Privacy policy](/omicron/privacy/)
