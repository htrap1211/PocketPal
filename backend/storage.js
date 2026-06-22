// Simple local JSON storage. Single user for the demo — no auth.
// Each check-in: { id, date (ISO), mood (1-5), sentiment, note, acknowledgment, tip }
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");
const DB_PATH = join(DATA_DIR, "checkins.json");

async function readAll() {
  try {
    const raw = await readFile(DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll(list) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(list, null, 2), "utf8");
}

export async function getCheckins() {
  const list = await readAll();
  // Newest first.
  return list.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function addCheckin(entry) {
  const list = await readAll();
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    ...entry,
  };
  list.push(record);
  await writeAll(list);
  return record;
}
