import { normalizeRefreshSeconds } from "../embed-config.mjs";
import { toWidgetModel } from "../widget-view-model.mjs";

const byId = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const refreshSeconds = normalizeRefreshSeconds(params.get("refresh"));
let currentGeneration = null;
let refreshTimer = null;

function setText(id, value) {
  const element = byId(id);
  if (element) element.textContent = String(value);
}

function setProgress(element, percent) {
  element.style.setProperty("--progress", `${percent}%`);
  element.setAttribute("aria-valuenow", String(percent));
}

function createPaw() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 40 40");
  svg.setAttribute("aria-hidden", "true");

  const shapes = [
    ["ellipse", { cx: 20, cy: 25, rx: 8.4, ry: 7.3 }],
    ["ellipse", { cx: 10.5, cy: 18, rx: 3.6, ry: 4.8 }],
    ["ellipse", { cx: 17.1, cy: 12.5, rx: 3.7, ry: 5 }],
    ["ellipse", { cx: 24.9, cy: 12.5, rx: 3.7, ry: 5 }],
    ["ellipse", { cx: 31.5, cy: 18, rx: 3.6, ry: 4.8 }],
  ];
  for (const [name, attributes] of shapes) {
    const shape = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (const [key, value] of Object.entries(attributes)) shape.setAttribute(key, value);
    svg.append(shape);
  }
  return svg;
}

function groupRow(group) {
  const row = document.createElement("div");
  row.className = "group-row";
  row.style.setProperty("--group-color", group.color);
  row.style.setProperty("--progress", `${group.percent}%`);
  row.setAttribute("role", "progressbar");
  row.setAttribute("aria-label", `${group.name}: ${group.done} of ${group.total} complete`);
  row.setAttribute("aria-valuemin", "0");
  row.setAttribute("aria-valuemax", "100");
  row.setAttribute("aria-valuenow", String(group.percent));

  const fill = document.createElement("span");
  fill.className = "group-fill";
  fill.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "group-label";
  const name = document.createElement("span");
  name.textContent = group.name;
  const count = document.createElement("span");
  count.textContent = `[${group.done}/${group.total}] ${group.percent}%`;
  label.append(name, count);
  row.append(fill, label);
  return row;
}

function timelineNode(item) {
  const entry = document.createElement("li");
  entry.className = `timeline-entry is-${item.tone}`;

  const node = document.createElement("span");
  node.className = "paw-node";
  node.append(createPaw());
  node.setAttribute("aria-hidden", "true");

  const label = item.url ? document.createElement("a") : document.createElement("span");
  label.className = "task-bubble";
  label.title = `${item.title} · ${item.area}`;
  const copy = document.createElement("span");
  copy.className = "task-label";
  copy.textContent = item.title;
  label.append(copy);
  if (item.url) {
    label.href = item.url;
    label.target = "_blank";
    label.rel = "noopener noreferrer";
  }

  entry.append(node, label);
  return entry;
}

function render(model) {
  setText("milestone-label", model.milestone.label);
  setText("milestone-date", model.milestone.date);
  setText("last-build", model.lastBuild);
  setProgress(byId("milestone-rail"), model.milestone.progress);
  setText("overall-label", model.overall.label);
  setText("task-count", model.overall.tasks);
  setText("changes", model.changes);

  const groups = model.groups.length > 0
    ? model.groups.map(groupRow)
    : [groupRow({ name: "Unassigned", done: 0, total: 0, percent: 0, color: "#59637d" })];
  byId("group-list").replaceChildren(...groups);

  if (model.timeline.length > 0) {
    byId("timeline").replaceChildren(...model.timeline.map(timelineNode));
  } else {
    const empty = document.createElement("li");
    empty.className = "empty-timeline";
    empty.textContent = "The public queue is clear.";
    byId("timeline").replaceChildren(empty);
  }

  if (model.projectUrl) byId("project-link").href = model.projectUrl;
  setText("sync-state", `Live snapshot · refreshes every ${refreshSeconds}s`);
  currentGeneration = model.generatedAt;
  document.title = `${model.overall.label} widget`;
}

async function refresh() {
  if (document.visibilityState === "hidden") return;
  const source = new URL("../data/project.json", import.meta.url);
  source.searchParams.set("v", String(Date.now()));
  const response = await fetch(source, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Snapshot request failed with HTTP ${response.status}`);
  const snapshot = await response.json();
  if (snapshot?.schemaVersion !== 1) throw new TypeError("Unsupported snapshot schema");
  if (snapshot.generatedAt !== currentGeneration) render(toWidgetModel(snapshot));
}

async function tick() {
  try {
    await refresh();
  } catch {
    setText("sync-state", "Snapshot unavailable · retrying");
  } finally {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(tick, refreshSeconds * 1000);
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") tick();
});

tick();
