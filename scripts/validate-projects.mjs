import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const required = ["role", "stewardship", "last_tended", "description", "image_alt", "feedback_url", "proof", "imperfect"];
const states = new Set(["primary-focus", "evolving", "maintained", "long-running", "formative"]);
const directory = join(process.cwd(), "content", "projects");

function parseFrontMatter(source, file) {
  if (!source.startsWith("---\n")) throw new Error(`${file}: missing YAML front matter`);
  const end = source.indexOf("\n---", 4);
  if (end < 0) throw new Error(`${file}: unclosed YAML front matter`);

  const fields = new Map();
  let current;
  for (const line of source.slice(4, end).split("\n")) {
    const topLevel = line.match(/^([A-Za-z][\w-]*):(?:\s*(.*))?$/);
    if (topLevel) {
      current = topLevel[1];
      fields.set(current, { value: topLevel[2] ?? "", block: [] });
    } else if (current && /^\s+/.test(line)) {
      fields.get(current).block.push(line);
    }
  }
  return fields;
}

function scalar(field) {
  return field?.value.trim().replace(/^(["'])(.*)\1$/, "$2") ?? "";
}

const files = (await readdir(directory)).filter((file) => file.endsWith(".md") && file !== "_index.md").sort();
if (!files.length) throw new Error("No project records found");

const failures = [];
let checked = 0;
for (const file of files) {
  const fields = parseFrontMatter(await readFile(join(directory, file), "utf8"), file);
  if (scalar(fields.get("draft")) === "true") continue;
  checked += 1;

  for (const key of required) {
    const field = fields.get(key);
    if (!field || (!scalar(field) && !field.block.some((line) => line.trim()))) {
      failures.push(`${file}: missing ${key}`);
    }
  }

  const stewardship = fields.get("stewardship")?.block.join("\n") ?? "";
  const state = stewardship.match(/^\s+state:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1].trim();
  if (!states.has(state)) failures.push(`${file}: invalid stewardship state ${state || "<missing>"}`);

  const lastTended = scalar(fields.get("last_tended"));
  if (state !== "formative" && !/^\d{4}-\d{2}-\d{2}$/.test(lastTended)) {
    failures.push(`${file}: last_tended must use YYYY-MM-DD`);
  }

  const proof = fields.get("proof")?.block.join("\n") ?? "";
  const values = (proof.match(/^\s+-\s+value:/gm) ?? []).length;
  const labels = (proof.match(/^\s+label:/gm) ?? []).length;
  if (!values || values !== labels) failures.push(`${file}: proof needs matched value and label entries`);
}

if (failures.length) {
  console.error(`PROJECT SCHEMA FAILED\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`PROJECT SCHEMA OK (${checked} public projects)`);
