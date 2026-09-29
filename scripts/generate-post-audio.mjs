// Narrate posts with ElevenLabs: node scripts/generate-post-audio.mjs <slug>...
// Needs ELEVENLABS_KEY. DRY=1 prints the narration text instead of calling the API.
import { readFile, writeFile, mkdir } from "node:fs/promises";

const VOICE = "Hoda3ttvceqnSzH0cHhZ"; // Me - fresh
const MODEL = "eleven_v4";
const CHUNK = 9000; // eleven_v4 accepts 10,000 characters per request

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };
const sentence = (s) => (/[.!?:;]$/.test(s) ? s : `${s}.`);

export function narration(md) {
  const [, fm, body] = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const title = fm.match(/^title:\s*"?(.*?)"?\s*$/m)[1];
  const text = body
    .replace(/^\s*(```|~~~)[\s\S]*?^\s*\1\s*$/gm, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|figure|picture|pre|code)\b[\s\S]*?<\/\1>/g, "")
    .replace(/\{\{[<%][\s\S]*?[>%]\}\}/g, "")
    .replace(/^\s*\[[^\]]+\]\([^)]+\)\s*·.*$/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`[^`\n]*`|<[^>]+>/g, (m) => (m[0] === "`" ? m : ""))
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e) => ENTITIES[e])
    .replace(/`/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .split("\n")
    .filter((l) => !/^\s*\*[^*].*\*\s*$/.test(l) &&!/^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(l))
    .map((l) => {
      const t = l.trim();
      if (/^([-*_]\s*){3,}$/.test(t)) return "";
      if (/^#+\s/.test(t)) return sentence(t.replace(/^#+\s*/, ""));
      if (t.startsWith("|")) return sentence(t.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()).filter(Boolean).join(": "));
      if (/^([-*+]|\d+\.)\s/.test(t)) return sentence(t.replace(/^([-*+]|\d+\.)\s+/, ""));
      return t;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return `${sentence(title)}\n\n${text}`;
}

// Split on paragraph breaks so each request stays under the model limit.
export function chunks(text, max = CHUNK) {
  const out = [""];
  for (const p of text.split("\n\n")) {
    if (out.at(-1) && out.at(-1).length + p.length + 2 > max) out.push("");
    out[out.length - 1] += (out.at(-1) ? "\n\n" : "") + p;
  }
  return out;
}

async function speak(text, previous_text, next_text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_KEY, "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: MODEL, previous_text, next_text }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

// Word timings for the read-along highlight: [[word, start, end], ...] in seconds.
async function align(mp3, text) {
  const form = new FormData();
  form.append("file", new Blob([mp3], { type: "audio/mpeg" }), "audio.mp3");
  form.append("text", text);
  const res = await fetch("https://api.elevenlabs.io/v1/forced-alignment", {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_KEY },
    body: form,
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const { words } = await res.json();
  return words.filter((w) => w.text.trim()).map((w) => [w.text.trim(), +w.start.toFixed(2), +w.end.toFixed(2)]);
}

// --align re-times existing MP3s without generating new speech.
const alignOnly = process.argv.includes("--align");
for (const slug of process.argv.slice(2).filter((a) => a !== "--align")) {
  const text = narration(await readFile(`content/posts/${slug}.md`, "utf8"));
  if (process.env.DRY) { console.log(`=== ${slug} (${text.length} chars)\n${text}\n`); continue; }
  const file = `static/audio/posts/${slug}`;
  let mp3;
  if (alignOnly) {
    mp3 = await readFile(`${file}.mp3`);
  } else {
    const parts = chunks(text);
    const audio = [];
    for (const [i, part] of parts.entries()) audio.push(await speak(part, parts[i - 1]?.slice(-500), parts[i + 1]?.slice(0, 500)));
    mp3 = Buffer.concat(audio);
    await mkdir("static/audio/posts", { recursive: true });
    await writeFile(`${file}.mp3`, mp3);
  }
  const words = await align(mp3, text);
  await writeFile(`${file}.json`, JSON.stringify(words));
  console.log(`${slug}: ${text.length} chars, ${words.length} timed words -> ${file}.mp3/.json`);
}
