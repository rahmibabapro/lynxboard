const MIN_REFRESH_SECONDS = 15;
const MAX_REFRESH_SECONDS = 3600;

export const EMBED_SANDBOX = [
  "allow-scripts",
  "allow-popups",
  "allow-popups-to-escape-sandbox",
].join(" ");

function clampInteger(value, minimum, maximum, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.round(number)));
}

export function normalizeEmbedHeight(value) {
  return clampInteger(value, 520, 1200, 661);
}

export function normalizeRefreshSeconds(value) {
  return clampInteger(value, MIN_REFRESH_SECONDS, MAX_REFRESH_SECONDS, 30);
}

export function buildWidgetUrl(moduleUrl, options = {}) {
  const source = new URL(moduleUrl);
  const isLoopback = source.protocol === "http:"
    && ["127.0.0.1", "localhost", "[::1]"].includes(source.hostname);
  if (source.protocol !== "https:" && !isLoopback) {
    throw new TypeError("Expected an HTTPS module URL");
  }

  const widget = new URL("./widget/index.html", source);
  widget.searchParams.set("lang", options.lang === "tr" ? "tr" : "en");
  widget.searchParams.set(
    "refresh",
    String(normalizeRefreshSeconds(options.refresh)),
  );
  return widget.toString();
}
