import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

import { createAtomFeed } from "../lib/feed.mjs";
import { assertValidSnapshot } from "../lib/project-data.mjs";

const root = resolve(import.meta.dirname, "..");
const app = resolve(root, "app");
const dist = resolve(root, "dist");

if (dist === root || !dist.startsWith(`${root}${sep}`)) {
  throw new Error("Refusing to build outside the repository");
}

const [config, snapshot] = await Promise.all([
  readFile(resolve(root, "lynxboard.config.json"), "utf8").then(JSON.parse),
  readFile(resolve(app, "data", "project.json"), "utf8").then(JSON.parse),
]);

assertValidSnapshot(snapshot);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(app, dist, { recursive: true });
await Promise.all([
  writeFile(resolve(dist, "feed.xml"), createAtomFeed(snapshot, config), "utf8"),
  writeFile(resolve(dist, ".nojekyll"), "", "utf8"),
  writeFile(
    resolve(dist, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${new URL("sitemap.xml", config.siteUrl)}\n`,
    "utf8",
  ),
  writeFile(
    resolve(dist, "sitemap.xml"),
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      `  <url><loc>${config.siteUrl}</loc><lastmod>${snapshot.generatedAt}</lastmod></url>`,
      "</urlset>",
      "",
    ].join("\n"),
    "utf8",
  ),
]);

process.stdout.write(`Built LynxBoard from ${snapshot.items.length} public Project items.\n`);
