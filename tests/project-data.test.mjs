import test from "node:test";
import assert from "node:assert/strict";

import {
  assertValidSnapshot,
  normalizeProjectSnapshot,
} from "../lib/project-data.mjs";

const generatedAt = "2026-08-17T12:00:00.000Z";

function sourceItem(overrides = {}) {
  return {
    id: "item-1",
    type: "Issue",
    title: "Ship public preview",
    url: "https://github.com/rahmibabapro/atrium/issues/4",
    number: 4,
    repository: "rahmibabapro/atrium",
    repositoryUrl: "https://github.com/rahmibabapro/atrium",
    status: "Done",
    area: "Infrastructure",
    priority: "P1 - High",
    effort: "M",
    targetDate: "2026-09-30",
    updatedAt: "2026-08-17T10:30:00.000Z",
    assignees: ["rahmibabapro"],
    ...overrides,
  };
}

function sourceProject(items) {
  return {
    project: {
      title: "Development Board",
      url: "https://github.com/users/rahmibabapro/projects/1",
      shortDescription: "Shared engineering backlog and delivery board.",
      updatedAt: "2026-08-17T11:00:00.000Z",
    },
    items,
  };
}

test("normalizes totals, progress groups, and the next milestone", () => {
  const source = sourceProject([
    sourceItem(),
    sourceItem({
      id: "item-2",
      title: "Review release",
      url: "https://github.com/rahmibabapro/atrium/issues/5",
      number: 5,
      status: "In Progress",
      area: "Infrastructure",
    }),
    sourceItem({
      id: "item-3",
      title: "Write migration guide",
      url: "https://github.com/rahmibabapro/atrium/issues/6",
      number: 6,
      status: "Todo",
      area: "Documentation",
    }),
  ]);

  const snapshot = normalizeProjectSnapshot(source, {
    owner: "rahmibabapro",
    projectNumber: 1,
    nextMilestone: {
      label: "next public preview",
      date: "2026-09-30",
    },
  }, generatedAt);

  assert.deepEqual(snapshot.totals, {
    total: 3,
    done: 1,
    inProgress: 1,
    todo: 1,
    percent: 33,
  });
  assert.equal(snapshot.groups[0].name, "Infrastructure");
  assert.deepEqual(snapshot.groups[0].counts, { done: 1, total: 2 });
  assert.equal(snapshot.groups[0].percent, 50);
  assert.equal(snapshot.milestone.daysRemaining, 44);
  assert.equal(snapshot.changesLast24h, 3);
  assert.doesNotThrow(() => assertValidSnapshot(snapshot));
});

test("handles an empty board without NaN or fabricated progress", () => {
  const snapshot = normalizeProjectSnapshot(sourceProject([]), {
    owner: "rahmibabapro",
    projectNumber: 1,
  }, generatedAt);

  assert.equal(snapshot.totals.total, 0);
  assert.equal(snapshot.totals.percent, 0);
  assert.deepEqual(snapshot.groups, []);
  assert.equal(snapshot.milestone, null);
});

test("drops redacted items and rejects non-GitHub item URLs", () => {
  const source = sourceProject([
    sourceItem({ id: "redacted", redacted: true }),
    sourceItem({ id: "unsafe", url: "https://example.com/phishing" }),
    sourceItem({ id: "safe" }),
  ]);

  const snapshot = normalizeProjectSnapshot(source, {
    owner: "rahmibabapro",
    projectNumber: 1,
  }, generatedAt);

  assert.equal(snapshot.items.length, 1);
  assert.equal(snapshot.items[0].id, "safe");
});

test("normalizes missing optional fields to explicit public values", () => {
  const snapshot = normalizeProjectSnapshot(sourceProject([
    sourceItem({
      area: "",
      priority: null,
      effort: undefined,
      targetDate: null,
      assignees: [],
    }),
  ]), {
    owner: "rahmibabapro",
    projectNumber: 1,
  }, generatedAt);

  assert.equal(snapshot.items[0].area, "Unassigned");
  assert.equal(snapshot.items[0].priority, "Unspecified");
  assert.equal(snapshot.items[0].effort, "Unspecified");
  assert.deepEqual(snapshot.items[0].assignees, []);
});

test("schema validation fails closed on unsafe links", () => {
  const snapshot = normalizeProjectSnapshot(sourceProject([sourceItem()]), {
    owner: "rahmibabapro",
    projectNumber: 1,
  }, generatedAt);
  snapshot.project.url = "javascript:alert(1)";

  assert.throws(
    () => assertValidSnapshot(snapshot),
    /project\.url must be a GitHub URL/,
  );
});

