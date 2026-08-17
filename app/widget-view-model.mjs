import { safeGitHubUrl } from "./view-model.mjs";

const FALLBACK_COLOR = "#59637d";
const TIMELINE_STATES = {
  active: { label: "Active", mark: "●" },
  complete: { label: "Complete", mark: "✓" },
  queued: { label: "Queued", mark: "○" },
};
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function clamp(value, minimum = 0, maximum = 100) {
  const number = Number(value);
  if (!Number.isFinite(number)) return minimum;
  return Math.min(maximum, Math.max(minimum, Math.round(number)));
}

function text(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function ordinal(day) {
  const remainder100 = day % 100;
  if (remainder100 >= 11 && remainder100 <= 13) return "th";
  if (day % 10 === 1) return "st";
  if (day % 10 === 2) return "nd";
  if (day % 10 === 3) return "rd";
  return "th";
}

export function formatOrdinalDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = date.getUTCDate();
  return `${MONTHS[date.getUTCMonth()]} ${day}${ordinal(day)}`;
}

function milestoneModel(milestone) {
  if (!milestone) {
    return { label: "Next build is not scheduled", date: "—", progress: 0 };
  }

  const days = clamp(milestone.daysRemaining, 0, 3650);
  return {
    label: `${days} days until ${text(milestone.label, "next build")}`,
    date: formatOrdinalDate(`${milestone.date}T00:00:00.000Z`),
    progress: clamp(100 - ((days / 90) * 100)),
  };
}

function groupModel(group) {
  return {
    name: text(group?.name, "Unassigned"),
    done: clamp(group?.counts?.done, 0, 1_000_000),
    total: clamp(group?.counts?.total, 0, 1_000_000),
    percent: clamp(group?.percent),
    color: /^#[0-9a-f]{6}$/i.test(group?.color) ? group.color.toLowerCase() : FALLBACK_COLOR,
  };
}

function timelineModel(items) {
  const visible = (Array.isArray(items) ? items : []).slice(0, 4);
  const activeIndex = visible.findIndex((item) => item?.bucket !== "done");

  return visible.map((item, index) => {
    const tone = item?.bucket === "done"
      ? "complete"
      : index === activeIndex
        ? "active"
        : "queued";
    const state = TIMELINE_STATES[tone];

    return {
      title: text(item?.title, "Untitled task"),
      area: text(item?.area, "Unassigned"),
      url: safeGitHubUrl(item?.url),
      tone,
      statusLabel: state.label,
      statusMark: state.mark,
    };
  });
}

export function toWidgetModel(snapshot) {
  const title = text(snapshot?.project?.title, "Development Board");
  const total = clamp(snapshot?.totals?.total, 0, 1_000_000);
  const percent = clamp(snapshot?.totals?.percent);
  const changes = clamp(snapshot?.changesLast24h, 0, 1_000_000);

  return {
    milestone: milestoneModel(snapshot?.milestone),
    lastBuild: formatOrdinalDate(snapshot?.generatedAt),
    overall: {
      label: `${title} - ${percent}%`,
      tasks: `${total} ${total === 1 ? "Task" : "Tasks"}`,
      percent,
    },
    changes: `${changes} ${changes === 1 ? "Change" : "Changes"} in last 24hrs`,
    groups: (Array.isArray(snapshot?.groups) ? snapshot.groups : []).slice(0, 5).map(groupModel),
    timeline: timelineModel(snapshot?.items),
    projectUrl: safeGitHubUrl(snapshot?.project?.url),
    generatedAt: text(snapshot?.generatedAt),
  };
}
