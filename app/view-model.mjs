const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function safeGitHubUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function formatCompactDate(value, locale = "en-US") {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Unscheduled";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return "Unscheduled";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatRelativeSync(value, now = new Date().toISOString()) {
  const timestamp = Date.parse(value);
  const current = Date.parse(now);
  if (!Number.isFinite(timestamp) || !Number.isFinite(current)) return "sync unavailable";

  const elapsed = Math.max(0, current - timestamp);
  if (elapsed < MINUTE_MS) return "just now";
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)} min ago`;
  if (elapsed < DAY_MS) {
    const hours = Math.floor(elapsed / HOUR_MS);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  const days = Math.floor(elapsed / DAY_MS);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

