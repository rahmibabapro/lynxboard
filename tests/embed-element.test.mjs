import test from "node:test";
import assert from "node:assert/strict";

import {
  buildWidgetUrl,
  normalizeEmbedHeight,
} from "../app/embed-config.mjs";

test("derives the iframe URL from the installed module location", () => {
  assert.equal(
    buildWidgetUrl(
      "https://cdn.example.com/lynxboard/embed.mjs",
      { lang: "tr", refresh: "45" },
    ),
    "https://cdn.example.com/lynxboard/widget/?lang=tr&refresh=45",
  );
});

test("allowlists widget options and clamps refresh timing", () => {
  assert.equal(
    buildWidgetUrl(
      "https://rahmibabapro.github.io/lynxboard/embed.mjs",
      { lang: "<script>", refresh: "1" },
    ),
    "https://rahmibabapro.github.io/lynxboard/widget/?lang=en&refresh=15",
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
