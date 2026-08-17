import test from "node:test";
import assert from "node:assert/strict";

import {
  formatCompactDate,
  formatRelativeSync,
  safeGitHubUrl,
} from "../app/view-model.mjs";

test("formats milestone dates without a timezone-day shift", () => {
  assert.equal(formatCompactDate("2026-09-30", "en-US"), "Sep 30");
});

test("formats recent sync timestamps for public status copy", () => {
  assert.equal(
    formatRelativeSync("2026-08-17T11:57:00.000Z", "2026-08-17T12:00:00.000Z"),
    "3 min ago",
  );
  assert.equal(
    formatRelativeSync("2026-08-15T12:00:00.000Z", "2026-08-17T12:00:00.000Z"),
    "2 days ago",
  );
});

test("allows only HTTPS github.com links", () => {
  assert.equal(
    safeGitHubUrl("https://github.com/rahmibabapro/atrium"),
    "https://github.com/rahmibabapro/atrium",
  );
  assert.equal(safeGitHubUrl("javascript:alert(1)"), null);
  assert.equal(safeGitHubUrl("https://example.com/redirect"), null);
});

