const API_URL = "https://api.github.com/graphql";
const MAX_PAGES = 5;

export const PROJECT_QUERY = String.raw`
  query LynxBoardProject($owner: String!, $number: Int!, $cursor: String) {
    user(login: $owner) {
      projectV2(number: $number) {
        title
        url
        shortDescription
        updatedAt
        items(first: 100, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            fieldValues(first: 20) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field { ... on ProjectV2FieldCommon { name } }
                }
                ... on ProjectV2ItemFieldDateValue {
                  date
                  field { ... on ProjectV2FieldCommon { name } }
                }
                ... on ProjectV2ItemFieldIterationValue {
                  title
                  startDate
                  duration
                  field { ... on ProjectV2FieldCommon { name } }
                }
              }
            }
            content {
              __typename
              ... on Issue {
                title
                url
                number
                updatedAt
                repository { nameWithOwner url }
                assignees(first: 20) { nodes { login } }
              }
              ... on PullRequest {
                title
                url
                number
                updatedAt
                repository { nameWithOwner url }
                assignees(first: 20) { nodes { login } }
              }
            }
          }
        }
      }
    }
  }
`;

function fieldMap(nodes) {
  const fields = new Map();
  for (const value of Array.isArray(nodes) ? nodes : []) {
    const fieldName = value?.field?.name;
    if (typeof fieldName !== "string") continue;
    if (typeof value.name === "string") fields.set(fieldName, value.name);
    if (typeof value.date === "string") fields.set(fieldName, value.date);
    if (typeof value.title === "string") fields.set(fieldName, value.title);
  }
  return fields;
}

function redactedItem(id) {
  return {
    id: typeof id === "string" ? id : "redacted",
    type: "Redacted",
    title: "",
    url: "",
    number: null,
    repository: "",
    repositoryUrl: "",
    status: "",
    area: "",
    priority: "",
    effort: "",
    targetDate: null,
    updatedAt: null,
    assignees: [],
    redacted: true,
  };
}

function sourceItem(node) {
  const content = node?.content;
  if (!content || !["Issue", "PullRequest"].includes(content.__typename)) {
    return redactedItem(node?.id);
  }

  const fields = fieldMap(node?.fieldValues?.nodes);
  const repository = content.repository;
  if (!repository?.nameWithOwner || !repository?.url || !content.url) {
    return redactedItem(node?.id);
  }

  return {
    id: node.id,
    type: content.__typename,
    title: content.title,
    url: content.url,
    number: content.number,
    repository: repository.nameWithOwner,
    repositoryUrl: repository.url,
    status: fields.get("Status") ?? "Unspecified",
    area: fields.get("Area") ?? "Unassigned",
    priority: fields.get("Priority") ?? "Unspecified",
    effort: fields.get("Effort") ?? "Unspecified",
    targetDate: fields.get("Target Date") ?? null,
    updatedAt: content.updatedAt ?? null,
    assignees: Array.isArray(content.assignees?.nodes)
      ? content.assignees.nodes.map((assignee) => assignee?.login).filter(Boolean)
      : [],
    redacted: false,
  };
}

export function projectSourceFromGraphql(pages) {
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new TypeError("at least one GraphQL project page is required");
  }

  const first = pages[0];
  return {
    project: {
      title: first.title,
      url: first.url,
      shortDescription: first.shortDescription ?? "",
      updatedAt: first.updatedAt ?? null,
    },
    items: pages.flatMap((page) => (
      Array.isArray(page?.items?.nodes) ? page.items.nodes.map(sourceItem) : []
    )),
  };
}

export async function fetchProjectPages({ token, owner, number, fetchImpl = fetch }) {
  if (typeof token !== "string" || token.length < 8) {
    throw new TypeError("GH_PROJECT_TOKEN is required");
  }
  if (!/^[A-Za-z0-9-]{1,39}$/.test(owner)) {
    throw new TypeError("project owner is invalid");
  }
  if (!Number.isInteger(number) || number < 1) {
    throw new TypeError("project number must be a positive integer");
  }

  const pages = [];
  let cursor = null;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const response = await fetchImpl(API_URL, {
      method: "POST",
      redirect: "error",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "lynxboard/0.1",
      },
      body: JSON.stringify({
        query: PROJECT_QUERY,
        variables: { owner, number, cursor },
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      throw new Error(`GitHub GraphQL request failed with HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      throw new Error(`GitHub GraphQL request failed: ${String(payload.errors[0]?.type ?? "unknown")}`);
    }

    const project = payload?.data?.user?.projectV2;
    if (!project) throw new Error("GitHub Project was not found or is not readable");
    pages.push(project);

    if (!project.items?.pageInfo?.hasNextPage) return pages;
    cursor = project.items.pageInfo.endCursor;
    if (typeof cursor !== "string" || cursor.length === 0) {
      throw new Error("GitHub returned an invalid pagination cursor");
    }
  }

  throw new Error(`Project exceeds the public limit of ${MAX_PAGES * 100} items`);
}

