import test from "node:test";
import assert from "node:assert/strict";

import { createStatusCard } from "../lib/status-card.mjs";

const snapshot = {
  generatedAt: "2026-08-18T08:30:00.000Z",
  project: {
    title: "Development Board",
    url: "https://github.com/users/rahmibabapro/projects/1",
  },
  milestone: {
    label: "next public preview",
    date: "2026-09-30",
    daysRemaining: 43,
  },
  totals: { total: 5, done: 2, inProgress: 1, todo: 2, percent: 40 },
  changesLast24h: 3,
  groups: [
    { name: "Infrastructure", counts: { done: 1, total: 2 }, percent: 50, color: "#69a7c1" },
    { name: "Documentation", counts: { done: 1, total: 1 }, percent: 100, color: "#e0c93a" },
  ],
  items: [],
};

test("creates an accessible GitHub-ready status card from the public snapshot", () => {
  const svg = createStatusCard(snapshot, { theme: "dark" });

  assert.match(svg, /^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /role="img" aria-labelledby="status-title status-description"/);
  assert.match(svg, /data-theme="dark"/);
  assert.match(svg, /<title id="status-title">Development Board project status<\/title>/);
  assert.match(svg, /40%/);
  assert.match(svg, /5 Tasks/);
  assert.match(svg, /43 days until next public preview/);
  assert.match(svg, /Synced Aug 18th · 08:30 UTC/);
  assert.match(svg, /Infrastructure/);
  assert.match(svg, /1 \/ 2/);
  assert.doesNotMatch(svg, /<(?:script|image)|\s(?:href|xlink:href)=/i);
});

test("escapes untrusted labels before placing them in SVG", () => {
  const hostile = structuredClone(snapshot);
  hostile.project.title = "Roadmap <script>alert(1)</script> & future";
  hostile.groups[0].name = "Code & Ops <unsafe>";

  const svg = createStatusCard(hostile, { theme: "light" });

  assert.match(svg, /data-theme="light"/);
  assert.match(svg, /Roadmap &lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; future/);
  assert.match(svg, /Code &amp; Ops &lt;unsafe&gt;/);
  assert.doesNotMatch(svg, /<script>/i);
});

test("rejects unknown themes instead of accepting arbitrary presentation input", () => {
  assert.throws(
    () => createStatusCard(snapshot, { theme: "javascript:alert(1)" }),
    /Unsupported status card theme/,
  );
});
