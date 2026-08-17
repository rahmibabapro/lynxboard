import test from "node:test";
import assert from "node:assert/strict";

import {
  formatOrdinalDate,
  toWidgetModel,
} from "../app/widget-view-model.mjs";

const snapshot = {
  generatedAt: "2026-08-17T19:30:00.000Z",
  project: {
    title: "Development Board",
    url: "https://github.com/users/rahmibabapro/projects/1",
  },
  milestone: {
    label: "next preview build",
    date: "2026-09-30",
    daysRemaining: 44,
  },
  totals: { total: 4, done: 2, inProgress: 1, todo: 1, percent: 50 },
  changesLast24h: 3,
  groups: [
    { name: "Code", counts: { done: 2, total: 3 }, percent: 67, color: "#66a9c1" },
    { name: "Writing", counts: { done: 0, total: 1 }, percent: 0, color: "not-a-color" },
  ],
  items: [
    {
      title: "Ship the live widget",
      url: "https://github.com/rahmibabapro/lynxboard/issues/1",
      bucket: "inProgress",
      area: "Code",
    },
    {
      title: "Reject unsafe links",
      url: "javascript:alert(1)",
      bucket: "todo",
      area: "Security",
    },
    {
      title: "Publish docs",
      url: "https://github.com/rahmibabapro/lynxboard/issues/2",
      bucket: "done",
      area: "Writing",
    },
  ],
};

test("derives reference-style labels from a truthful Project snapshot", () => {
  const model = toWidgetModel(snapshot);

  assert.equal(model.milestone.label, "44 days until next preview build");
  assert.equal(model.milestone.date, "Sep 30th");
  assert.equal(model.milestone.progress, 51);
  assert.equal(model.lastBuild, "Aug 17th");
  assert.equal(model.overall.label, "Development Board - 50%");
  assert.equal(model.overall.tasks, "4 Tasks");
  assert.equal(model.changes, "3 Changes in last 24hrs");
  assert.deepEqual(model.groups[0], {
    name: "Code",
    done: 2,
    total: 3,
    percent: 67,
    color: "#66a9c1",
  });
});

test("fails safe on invalid colors, links, percentages, and optional data", () => {
  const hostile = structuredClone(snapshot);
  hostile.groups[0].percent = 900;
  hostile.items[0].url = "https://example.com/not-github";
  hostile.milestone = null;

  const model = toWidgetModel(hostile);

  assert.equal(model.groups[0].percent, 100);
  assert.equal(model.groups[1].color, "#59637d");
  assert.equal(model.timeline[0].url, null);
  assert.equal(model.milestone.label, "Next build is not scheduled");
  assert.equal(model.milestone.date, "—");
});

test("selects the first unfinished item as the active timeline node", () => {
  const reordered = structuredClone(snapshot);
  reordered.items[0].bucket = "done";
  reordered.items[1].bucket = "todo";

  const model = toWidgetModel(reordered);

  assert.equal(model.timeline[0].tone, "complete");
  assert.equal(model.timeline[1].tone, "active");
  assert.equal(model.timeline[2].tone, "complete");
});

test("formats UTC dates with English ordinals", () => {
  assert.equal(formatOrdinalDate("2026-08-01T23:00:00.000Z"), "Aug 1st");
  assert.equal(formatOrdinalDate("2026-08-02T23:00:00.000Z"), "Aug 2nd");
  assert.equal(formatOrdinalDate("2026-08-03T23:00:00.000Z"), "Aug 3rd");
  assert.equal(formatOrdinalDate("2026-08-11T23:00:00.000Z"), "Aug 11th");
  assert.equal(formatOrdinalDate("invalid"), "—");
});
