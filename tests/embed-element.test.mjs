import test from "node:test";
import assert from "node:assert/strict";

import {
  buildWidgetUrl,
  EMBED_SANDBOX,
  normalizeEmbedHeight,
  normalizeRefreshSeconds,
} from "../app/embed-config.mjs";

test("derives the iframe URL from the installed module location", () => {
  assert.equal(
    buildWidgetUrl(
      "https://cdn.example.com/lynxboard/embed.mjs",
      { lang: "tr", refresh: "45" },
    ),
    "https://cdn.example.com/lynxboard/widget/index.html?lang=tr&refresh=45",
  );
});

test("allowlists widget options and clamps refresh timing", () => {
  assert.equal(
    buildWidgetUrl(
      "https://rahmibabapro.github.io/lynxboard/embed.mjs",
      { lang: "<script>", refresh: "1" },
    ),
    "https://rahmibabapro.github.io/lynxboard/widget/index.html?lang=en&refresh=15",
  );
  assert.equal(normalizeEmbedHeight("200"), 520);
  assert.equal(normalizeEmbedHeight("900"), 900);
  assert.equal(normalizeEmbedHeight("9999"), 1200);
});

test("rejects non-HTTPS module origins", () => {
  assert.throws(
    () => buildWidgetUrl("javascript:alert(1)", {}),
    /HTTPS module URL/,
  );
});

test("allows loopback HTTP only for local widget development", () => {
  assert.equal(
    buildWidgetUrl("http://127.0.0.1:4173/embed.mjs", {}),
    "http://127.0.0.1:4173/widget/index.html?lang=en&refresh=30",
  );
  assert.throws(
    () => buildWidgetUrl("http://example.com/embed.mjs", {}),
    /HTTPS module URL/,
  );
});

test("keeps direct iframe polling inside a safe interval", () => {
  assert.equal(normalizeRefreshSeconds("1"), 15);
  assert.equal(normalizeRefreshSeconds("30"), 30);
  assert.equal(normalizeRefreshSeconds("99999"), 3600);
  assert.equal(normalizeRefreshSeconds("invalid"), 30);
});

test("keeps embedded content on an opaque origin with a constrained sandbox", () => {
  assert.match(EMBED_SANDBOX, /\ballow-scripts\b/);
  assert.doesNotMatch(EMBED_SANDBOX, /\ballow-same-origin\b/);
  assert.doesNotMatch(EMBED_SANDBOX, /\ballow-forms\b/);
  assert.doesNotMatch(EMBED_SANDBOX, /\ballow-top-navigation\b/);
});
