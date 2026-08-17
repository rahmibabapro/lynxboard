import test from "node:test";
import assert from "node:assert/strict";

import { projectSourceFromGraphql } from "../lib/github-project.mjs";

function fieldValue(field, name, extra = {}) {
  return {
    name,
    field: { name: field },
    ...extra,
  };
}

test("converts paginated GraphQL project data into the stable source contract", () => {
  const pages = [{
    title: "Development Board",
    url: "https://github.com/users/rahmibabapro/projects/1",
    shortDescription: "Shared engineering backlog.",
    updatedAt: "2026-08-17T11:00:00Z",
    items: {
      nodes: [{
        id: "item-1",
        fieldValues: {
          nodes: [
            fieldValue("Status", "In Progress"),
            fieldValue("Area", "Infrastructure"),
            fieldValue("Priority", "P1 - High"),
            fieldValue("Effort", "M"),
            { date: "2026-09-30", field: { name: "Target Date" } },
          ],
        },
        content: {
          __typename: "Issue",
          title: "Ship the preview",
          url: "https://github.com/rahmibabapro/atrium/issues/4",
          number: 4,
          updatedAt: "2026-08-17T10:30:00Z",
          repository: {
            nameWithOwner: "rahmibabapro/atrium",
            url: "https://github.com/rahmibabapro/atrium",
          },
          assignees: { nodes: [{ login: "rahmibabapro" }] },
        },
      }],
    },
  }];

  const source = projectSourceFromGraphql(pages);

  assert.equal(source.project.title, "Development Board");
  assert.equal(source.items.length, 1);
  assert.deepEqual(source.items[0], {
    id: "item-1",
    type: "Issue",
    title: "Ship the preview",
    url: "https://github.com/rahmibabapro/atrium/issues/4",
    number: 4,
    repository: "rahmibabapro/atrium",
    repositoryUrl: "https://github.com/rahmibabapro/atrium",
    status: "In Progress",
    area: "Infrastructure",
    priority: "P1 - High",
    effort: "M",
    targetDate: "2026-09-30",
    updatedAt: "2026-08-17T10:30:00Z",
    assignees: ["rahmibabapro"],
    redacted: false,
  });
});

test("marks redacted and unsupported project content instead of leaking it", () => {
  const pages = [{
    title: "Development Board",
    url: "https://github.com/users/rahmibabapro/projects/1",
    items: {
      nodes: [
        { id: "private", content: { __typename: "Redacted" }, fieldValues: { nodes: [] } },
        { id: "draft", content: { __typename: "DraftIssue", title: "Secret plan" }, fieldValues: { nodes: [] } },
      ],
    },
  }];

  const source = projectSourceFromGraphql(pages);

  assert.equal(source.items.length, 2);
  assert.equal(source.items[0].redacted, true);
  assert.equal(source.items[1].redacted, true);
  assert.equal(source.items[1].title, "");
});

