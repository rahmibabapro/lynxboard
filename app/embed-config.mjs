const MIN_REFRESH_SECONDS = 15;
const MAX_REFRESH_SECONDS = 3600;

function clampInteger(value, minimum, maximum, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.round(number)));
}

export function normalizeEmbedHeight(value) {
  return clampInteger(value, 520, 1200, 661);
}

export function buildWidgetUrl(moduleUrl, options = {}) {
  const source = new URL(moduleUrl);
  if (source.protocol !== "https:") throw new TypeError("Expected an HTTPS module URL");

  const widget = new URL("./widget/", source);
  widget.searchParams.set("lang", options.lang === "tr" ? "tr" : "en");
  widget.searchParams.set(
    "refresh",
    String(clampInteger(options.refresh, MIN_REFRESH_SECONDS, MAX_REFRESH_SECONDS, 30)),
  );
  return widget.toString();
}
