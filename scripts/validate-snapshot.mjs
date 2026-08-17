import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { assertValidSnapshot } from "../lib/project-data.mjs";

const input = process.argv[2];
if (!input) throw new TypeError("Usage: node scripts/validate-snapshot.mjs <snapshot.json>");

const path = resolve(process.cwd(), input);
const snapshot = JSON.parse(await readFile(path, "utf8"));
assertValidSnapshot(snapshot);
process.stdout.write(`Valid snapshot: ${snapshot.items.length} public items.\n`);

