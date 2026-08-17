const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_ITEMS = 500;

const GROUP_COLORS = new Map([
  ["frontend", "#d08b52"],
  ["backend", "#d85f48"],
  ["minecraft", "#82934a"],
  ["infrastructure", "#69a7c1"],
  ["design", "#b8729e"],
  ["documentation", "#e0c93a"],
  ["unassigned", "#667085"],
]);

const FALLBACK_COLORS = [
  "#79a8d8",
  "#6da88b",
  "#c78355",
  "#9989c7",
  "#ba7386",
];

function asText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const normalized = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  return normalized.slice(0, 500);
}

function asIsoDate(value, fallback = null) {
  if (typeof value !== "string") return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function isGitHubUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com";
  } catch {
    return false;
  }
}

function normalizeStatus(value) {
  const status = asText(value, "Unspecified");
  return status || "Unspecified";
}

function statusBucket(status) {
  const key = status.toLowerCase();
  if (["done", "closed", "complete", "completed", "merged"].includes(key)) {
    return "done";
  }
  if (
    key.includes("progress")
    || key.includes("review")
    || key.includes("blocked")
    || key.includes("active")
  ) {
    return "inProgress";
  }
  return "todo";
}

function percent(done, total) {
  if (!Number.isFinite(done) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
}

function colorForGroup(name) {
  const key = name.toLowerCase();
  if (GROUP_COLORS.has(key)) return GROUP_COLORS.get(key);

  let hash = 0;
  for (const character of key) {
    hash = ((hash * 31) + character.codePointAt(0)) >>> 0;
  }
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

function priorityRank(priority) {
  const match = /^P([0-9])/i.exec(priority);
  return match ? Number(match[1]) : 99;
}

function normalizeItem(item) {
  if (!item || typeof item !== "object" || item.redacted === true) return null;
  if (!isGitHubUrl(item.url) || !isGitHubUrl(item.repositoryUrl)) return null;

  const id = asText(item.id);
  const title = asText(item.title);
  const repository = asText(item.repository);
  if (!id || !title || !repository) return null;

  const status = normalizeStatus(item.status);
  const area = asText(item.area, "Unassigned") || "Unassigned";
  const priority = asText(item.priority, "Unspecified") || "Unspecified";
  const effort = asText(item.effort, "Unspecified") || "Unspecified";
  const updatedAt = asIsoDate(item.updatedAt);

  return {
    id,
    type: asText(item.type, "Issue") || "Issue",
    title,
    url: item.url,
    number: Number.isInteger(item.number) && item.number > 0 ? item.number : null,
    repository,
    repositoryUrl: item.repositoryUrl,
    status,
    bucket: statusBucket(status),
    area,
    priority,
    effort,
    targetDate: asText(item.targetDate) || null,
    updatedAt,
    assignees: Array.isArray(item.assignees)
      ? item.assignees.map((login) => asText(login)).filter(Boolean).slice(0, 20)
      : [],
  };
}

function buildGroups(items) {
  const groups = new Map();

  for (const item of items) {
    const group = groups.get(item.area) ?? {
      name: item.area,
      counts: { done: 0, total: 0 },
    };
    group.counts.total += 1;
    if (item.bucket === "done") group.counts.done += 1;
    groups.set(item.area, group);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      percent: percent(group.counts.done, group.counts.total),
      color: colorForGroup(group.name),
    }))
    .sort((left, right) => (
      right.counts.total - left.counts.total
      || left.name.localeCompare(right.name)
    ));
}

function buildMilestone(config, generatedAt) {
  const label = asText(config?.nextMilestone?.label);
  const rawDate = config?.nextMilestone?.date;
  if (!label || typeof rawDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return null;
  }

  const target = new Date(`${rawDate}T00:00:00.000Z`);
  const generated = new Date(generatedAt);
  if (Number.isNaN(target.getTime()) || Number.isNaN(generated.getTime())) return null;

  const generatedDay = Date.UTC(
    generated.getUTCFullYear(),
    generated.getUTCMonth(),
    generated.getUTCDate(),
  );

  return {
    label,
    date: rawDate,
    daysRemaining: Math.max(0, Math.ceil((target.getTime() - generatedDay) / DAY_MS)),
  };
}

export function normalizeProjectSnapshot(source, config = {}, generatedAt = new Date().toISOString()) {
  if (!source?.project || !Array.isArray(source.items)) {
    throw new TypeError("source must include project metadata and an items array");
  }
  if (!isGitHubUrl(source.project.url)) {
    throw new TypeError("source project URL must be a GitHub URL");
  }

  const safeGeneratedAt = asIsoDate(generatedAt);
  if (!safeGeneratedAt) throw new TypeError("generatedAt must be a valid date");

  const items = source.items
    .slice(0, MAX_ITEMS)
    .map(normalizeItem)
    .filter(Boolean)
    .sort((left, right) => (
      priorityRank(left.priority) - priorityRank(right.priority)
      || (Date.parse(right.updatedAt ?? 0) - Date.parse(left.updatedAt ?? 0))
      || left.title.localeCompare(right.title)
    ));

  const totals = { total: items.length, done: 0, inProgress: 0, todo: 0, percent: 0 };
  for (const item of items) totals[item.bucket] += 1;
  totals.percent = percent(totals.done, totals.total);

  const recentCutoff = Date.parse(safeGeneratedAt) - DAY_MS;
  const snapshot = {
    schemaVersion: 1,
    generatedAt: safeGeneratedAt,
    source: {
      owner: asText(config.owner),
      projectNumber: Number(config.projectNumber) || null,
    },
    project: {
      title: asText(source.project.title, "GitHub Project") || "GitHub Project",
      url: source.project.url,
      shortDescription: asText(source.project.shortDescription),
      updatedAt: asIsoDate(source.project.updatedAt),
    },
    milestone: buildMilestone(config, safeGeneratedAt),
    totals,
    groups: buildGroups(items),
    changesLast24h: items.filter((item) => (
      item.updatedAt && Date.parse(item.updatedAt) >= recentCutoff
    )).length,
    items,
  };

  assertValidSnapshot(snapshot);
  return snapshot;
}

export function assertValidSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") throw new TypeError("snapshot must be an object");
  if (snapshot.schemaVersion !== 1) throw new TypeError("schemaVersion must be 1");
  if (!asIsoDate(snapshot.generatedAt)) throw new TypeError("generatedAt must be an ISO date");
  if (!isGitHubUrl(snapshot.project?.url)) {
    throw new TypeError("project.url must be a GitHub URL");
  }
  if (!Array.isArray(snapshot.items) || snapshot.items.length > MAX_ITEMS) {
    throw new TypeError(`items must be an array with at most ${MAX_ITEMS} entries`);
  }
  if (!Array.isArray(snapshot.groups)) throw new TypeError("groups must be an array");

  for (const item of snapshot.items) {
    if (!isGitHubUrl(item.url)) throw new TypeError("item.url must be a GitHub URL");
    if (!isGitHubUrl(item.repositoryUrl)) {
      throw new TypeError("item.repositoryUrl must be a GitHub URL");
    }
    if (!asText(item.title)) throw new TypeError("item.title must not be empty");
  }

  const totals = snapshot.totals;
  for (const key of ["total", "done", "inProgress", "todo", "percent"]) {
    if (!Number.isFinite(totals?.[key]) || totals[key] < 0) {
      throw new TypeError(`totals.${key} must be a non-negative number`);
    }
  }
  if (totals.percent > 100) throw new TypeError("totals.percent must not exceed 100");

  for (const group of snapshot.groups) {
    if (!/^#[0-9a-f]{6}$/i.test(group.color)) throw new TypeError("group.color must be hex");
    if (group.percent < 0 || group.percent > 100) {
      throw new TypeError("group.percent must be between 0 and 100");
    }
  }

  return snapshot;
}

