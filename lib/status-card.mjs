import { toWidgetModel } from "../app/widget-view-model.mjs";

const CARD_WIDTH = 760;
const THEMES = {
  dark: {
    canvas: "#111318",
    surface: "#181b21",
    border: "#2a3038",
    text: "#eef1f4",
    textSoft: "#cbd1d7",
    muted: "#969faa",
    track: "#242a31",
    accent: "#9ab4c5",
    success: "#8fa99a",
  },
  light: {
    canvas: "#f7f8fa",
    surface: "#ffffff",
    border: "#d8dde3",
    text: "#20242a",
    textSoft: "#424a53",
    muted: "#68717c",
    track: "#e7eaee",
    accent: "#617f94",
    success: "#668274",
  },
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function truncate(value, maximum) {
  const characters = [...String(value)];
  if (characters.length <= maximum) return value;
  return `${characters.slice(0, Math.max(0, maximum - 1)).join("")}…`;
}

function groupRows(groups, theme) {
  if (groups.length === 0) {
    return [
      `<text x="48" y="226" fill="${theme.muted}" font-size="12">No public areas yet</text>`,
    ];
  }

  return groups.flatMap((group, index) => {
    const centerY = 209 + (index * 32);
    const barWidth = Math.round(280 * (group.percent / 100));
    return [
      `<circle cx="48" cy="${centerY}" r="3" fill="${group.color}" fill-opacity="0.72"/>`,
      `<text x="61" y="${centerY + 4}" fill="${theme.textSoft}" font-size="12" font-weight="560">${escapeXml(truncate(group.name, 30))}</text>`,
      `<rect x="332" y="${centerY - 3}" width="280" height="6" rx="3" fill="${theme.track}"/>`,
      `<rect x="332" y="${centerY - 3}" width="${barWidth}" height="6" rx="3" fill="${theme.accent}" fill-opacity="0.82"/>`,
      `<text x="712" y="${centerY + 4}" fill="${theme.muted}" font-family="ui-monospace, SFMono-Regular, Consolas, monospace" font-size="10" text-anchor="end">${group.done} / ${group.total} · ${group.percent}%</text>`,
    ];
  });
}

export function createStatusCard(snapshot, { theme: themeName = "dark" } = {}) {
  const theme = THEMES[themeName];
  if (!theme) throw new TypeError(`Unsupported status card theme: ${themeName}`);

  const model = toWidgetModel(snapshot);
  const groups = model.groups.slice(0, 5);
  const rowCount = Math.max(groups.length, 1);
  const surfaceHeight = 16 + (rowCount * 32);
  const height = 178 + surfaceHeight + 24;
  const overallWidth = Math.round(704 * (model.overall.percent / 100));
  const title = escapeXml(truncate(model.overall.title, 52));
  const description = escapeXml(
    `${model.overall.title} is ${model.overall.percent}% complete with ${model.overall.tasks}. ${model.milestone.label}.`,
  );

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${height}" viewBox="0 0 ${CARD_WIDTH} ${height}" role="img" aria-labelledby="status-title status-description" data-theme="${themeName}">`,
    `  <title id="status-title">${escapeXml(model.overall.title)} project status</title>`,
    `  <desc id="status-description">${description}</desc>`,
    `  <rect width="${CARD_WIDTH}" height="${height}" rx="18" fill="${theme.canvas}"/>`,
    `  <rect x="0.5" y="0.5" width="759" height="${height - 1}" rx="17.5" fill="none" stroke="${theme.border}"/>`,
    `  <g transform="translate(28 22) scale(.43)">`,
    `    <path fill="${theme.surface}" stroke="${theme.accent}" stroke-width="1.8" d="M11 22 17 7l9 11h12L47 7l6 15-4 22-17 13-17-13Z"/>`,
    `    <path fill="none" stroke="${theme.textSoft}" stroke-linecap="round" stroke-width="2.5" d="m19 30 9 3m17-3-9 3"/>`,
    `    <path fill="${theme.success}" d="m29 43 3 3 3-3-3-2Z"/>`,
    `  </g>`,
    `  <g font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif">`,
    `    <text x="65" y="34" fill="${theme.text}" font-size="13" font-weight="650">LynxBoard</text>`,
    `    <text x="65" y="49" fill="${theme.muted}" font-size="10">Project status</text>`,
    `    <circle cx="663" cy="36" r="3" fill="${theme.success}"/>`,
    `    <text x="672" y="40" fill="${theme.textSoft}" font-size="10">Synced ${escapeXml(model.lastBuild)}</text>`,
    `    <text x="28" y="91" fill="${theme.text}" font-size="21" font-weight="650">${title}</text>`,
    `    <text x="732" y="91" fill="${theme.text}" font-family="ui-monospace, SFMono-Regular, Consolas, monospace" font-size="18" font-weight="650" text-anchor="end">${model.overall.percent}%</text>`,
    `    <text x="28" y="115" fill="${theme.muted}" font-size="12">${escapeXml(truncate(model.milestone.label, 58))}</text>`,
    `    <text x="732" y="115" fill="${theme.muted}" font-family="ui-monospace, SFMono-Regular, Consolas, monospace" font-size="10" text-anchor="end">${escapeXml(model.milestone.date)} · ${escapeXml(model.overall.tasks)}</text>`,
    `    <rect x="28" y="132" width="704" height="6" rx="3" fill="${theme.track}"/>`,
    `    <rect x="28" y="132" width="${overallWidth}" height="6" rx="3" fill="${theme.accent}"/>`,
    `    <text x="28" y="160" fill="${theme.muted}" font-size="10">${escapeXml(model.changes)}</text>`,
    `    <text x="732" y="160" fill="${theme.muted}" font-size="10" text-anchor="end">Open project ↗</text>`,
    `    <rect x="28" y="178" width="704" height="${surfaceHeight}" rx="13" fill="${theme.surface}" stroke="${theme.border}"/>`,
    ...groupRows(groups, theme).map(row => `    ${row}`),
    `  </g>`,
    `</svg>`,
    "",
  ].join("\n");
}
