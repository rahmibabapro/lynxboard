import {
  formatCompactDate,
  formatRelativeSync,
  safeGitHubUrl,
} from "./view-model.mjs";

const byId = (id) => document.getElementById(id);

function setText(id, value) {
  const element = byId(id);
  if (element) element.textContent = String(value);
}

function setProgress(id, value) {
  const element = byId(id);
  const percent = Number.isFinite(Number(value))
    ? Math.min(100, Math.max(0, Number(value)))
    : 0;
  element?.style.setProperty("--progress", `${percent}%`);
}

function groupRow(group) {
  const row = document.createElement("div");
  row.className = "group-row";
  const color = /^#[0-9a-f]{6}$/i.test(group.color) ? group.color : "#667085";
  row.style.setProperty("--group-color", color);
  row.setAttribute(
    "aria-label",
    `${group.name}: ${group.counts.done} of ${group.counts.total} complete, ${group.percent}%`,
  );

  const fill = document.createElement("span");
  fill.className = "group-fill";
  fill.style.setProperty("--progress", `${Math.min(100, Math.max(0, group.percent))}%`);
  fill.setAttribute("aria-hidden", "true");

  const copy = document.createElement("span");
  copy.className = "group-copy";
  const name = document.createElement("span");
  name.textContent = group.name;
  const count = document.createElement("span");
  count.textContent = `[${group.counts.done}/${group.counts.total}] ${group.percent}%`;
  copy.append(name, count);
  row.append(fill, copy);
  return row;
}

function emptyGroups() {
  const message = document.createElement("p");
  message.className = "empty-list";
  message.textContent = "No public work areas are available yet.";
  return message;
}

function workItem(item, index) {
  const listItem = document.createElement("li");
  listItem.className = "work-item";

  const link = document.createElement("a");
  const url = safeGitHubUrl(item.url);
  if (url) link.href = url;

  const rank = document.createElement("span");
  rank.className = "work-rank";
  rank.textContent = String(index + 1).padStart(2, "0");

  const copy = document.createElement("span");
  copy.className = "work-copy";
  const title = document.createElement("span");
  title.className = "work-title";
  title.textContent = item.title;
  const meta = document.createElement("span");
  meta.className = "work-meta";
  meta.textContent = `${item.repository} · ${item.area} · ${item.effort}`;
  copy.append(title, meta);

  const status = document.createElement("span");
  status.className = "work-status";
  status.textContent = item.priority.split(" ")[0] || item.status;
  link.append(rank, copy, status);
  listItem.append(link);
  return listItem;
}

function render(snapshot) {
  setText("project-title", snapshot.project.title);
  setText("project-description", snapshot.project.shortDescription || "Public project signal from GitHub.");
  setText("project-updated", formatRelativeSync(snapshot.project.updatedAt, snapshot.generatedAt));
  setText("sync-time", formatRelativeSync(snapshot.generatedAt));

  const projectUrl = safeGitHubUrl(snapshot.project.url);
  if (projectUrl) byId("project-link").href = projectUrl;

  if (snapshot.milestone) {
    setText("milestone-days", snapshot.milestone.daysRemaining);
    setText("milestone-label", snapshot.milestone.label);
    setText("milestone-date", formatCompactDate(snapshot.milestone.date));
    byId("milestone-date").dateTime = snapshot.milestone.date;
    setProgress("milestone-progress", 100 - Math.min(100, (snapshot.milestone.daysRemaining / 90) * 100));
  } else {
    setText("milestone-days", "—");
    setText("milestone-label", "next public target");
    setText("milestone-date", "Unscheduled");
    setProgress("milestone-progress", 0);
  }

  setText("overall-percent", `${snapshot.totals.percent}%`);
  setText("overall-count", `${snapshot.totals.done}/${snapshot.totals.total} tasks`);
  setProgress("overall-progress", snapshot.totals.percent);
  setText("todo-count", snapshot.totals.todo);
  setText("active-count", snapshot.totals.inProgress);
  setText("done-count", snapshot.totals.done);
  setText("changes-count", snapshot.changesLast24h);

  const groups = byId("group-list");
  groups.replaceChildren(...(
    snapshot.groups.length > 0 ? snapshot.groups.map(groupRow) : [emptyGroups()]
  ));

  const visibleItems = snapshot.items
    .filter((item) => item.bucket !== "done")
    .slice(0, 5);
  const fallbackItems = visibleItems.length > 0 ? visibleItems : snapshot.items.slice(0, 5);
  const workList = byId("work-list");
  if (fallbackItems.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-list";
    empty.textContent = "The public queue is clear.";
    workList.replaceChildren(empty);
  } else {
    workList.replaceChildren(...fallbackItems.map(workItem));
  }

  const liveState = byId("live-state");
  liveState.lastElementChild.textContent = "Live snapshot";
  document.title = `${snapshot.project.title} — LynxBoard`;
}

async function loadSnapshot() {
  const response = await fetch("./data/project.json", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Snapshot request failed with HTTP ${response.status}`);
  const snapshot = await response.json();
  if (snapshot?.schemaVersion !== 1 || !snapshot?.project || !snapshot?.totals) {
    throw new Error("Snapshot schema is not supported");
  }
  render(snapshot);
}

loadSnapshot().catch(() => {
  byId("error-state").hidden = false;
  const liveState = byId("live-state");
  liveState.lastElementChild.textContent = "Snapshot offline";
  liveState.classList.add("is-offline");
  document.querySelectorAll(".group-skeleton, .work-skeleton").forEach((item) => item.remove());
});

