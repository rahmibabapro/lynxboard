import { readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { fetchProjectPages, projectSourceFromGraphql } from "../lib/github-project.mjs";
import { normalizeProjectSnapshot } from "../lib/project-data.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(await readFile(resolve(root, "lynxboard.config.json"), "utf8"));
const token = process.env.GH_PROJECT_TOKEN ?? process.env.GH_TOKEN;

const pages = await fetchProjectPages({
  token,
  owner: config.owner,
  number: config.projectNumber,
});
const source = projectSourceFromGraphql(pages);
const snapshot = normalizeProjectSnapshot(source, config);

const outputPath = resolve(root, "app", "data", "project.json");
const temporaryPath = `${outputPath}.tmp`;
await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
await rename(temporaryPath, outputPath);

process.stdout.write(
  `Synced ${snapshot.items.length} public items from ${snapshot.project.title}.\n`,
);

