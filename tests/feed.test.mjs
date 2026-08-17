import test from "node:test";
import assert from "node:assert/strict";

import { createAtomFeed } from "../lib/feed.mjs";

test("creates a valid Atom feed with escaped GitHub content", () => {
  const feed = createAtomFeed({
    schemaVersion: 1,
    generatedAt: "2026-08-17T12:00:00.000Z",
    project: {
      title: "Development & Delivery",
      url: "https://github.com/users/rahmibabapro/projects/1",
    },
    items: [{
      id: "item-1",
      title: "Fix <script>alert(1)</script>",
      url: "https://github.com/rahmibabapro/atrium/issues/1",
      repository: "rahmibabapro/atrium",
      status: "In Progress",
      area: "Frontend",
      updatedAt: "2026-08-17T11:00:00.000Z",
    }],
  }, {
    siteUrl: "https://rahmibabapro.github.io/lynxboard/",
  });

  assert.match(feed, /^<\?xml version="1\.0" encoding="utf-8"\?>/);
  assert.match(feed, /Development &amp; Delivery/);
  assert.match(feed, /Fix &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(feed, /<script>/);
  assert.match(feed, /<link rel="self" href="https:\/\/rahmibabapro\.github\.io\/lynxboard\/feed\.xml"\/>/);
});

test("omits entries without a public GitHub URL or update timestamp", () => {
  const feed = createAtomFeed({
    schemaVersion: 1,
    generatedAt: "2026-08-17T12:00:00.000Z",
    project: {
      title: "Development Board",
      url: "https://github.com/users/rahmibabapro/projects/1",
    },
    items: [
      { id: "unsafe", title: "Unsafe", url: "https://example.com", updatedAt: "2026-08-17T11:00:00Z" },
      { id: "undated", title: "Undated", url: "https://github.com/example/repo/issues/1", updatedAt: null },
    ],
  }, {
    siteUrl: "https://rahmibabapro.github.io/lynxboard/",
  });

  assert.doesNotMatch(feed, /<entry>/);
});

