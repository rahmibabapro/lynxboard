function cleanXml(value) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function httpsUrl(value, host) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (!host || url.hostname === host) ? url : null;
  } catch {
    return null;
  }
}

function isoDate(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

export function createAtomFeed(snapshot, config) {
  const site = httpsUrl(config?.siteUrl);
  if (!site) throw new TypeError("siteUrl must be an HTTPS URL");
  const projectUrl = httpsUrl(snapshot?.project?.url, "github.com");
  if (!projectUrl) throw new TypeError("project URL must be an HTTPS github.com URL");

  const updated = isoDate(snapshot.generatedAt);
  if (!updated) throw new TypeError("snapshot generatedAt must be a valid date");
  const selfUrl = new URL("feed.xml", site).toString();
  const entries = (Array.isArray(snapshot.items) ? snapshot.items : [])
    .filter((item) => httpsUrl(item.url, "github.com") && isoDate(item.updatedAt))
    .slice(0, 50)
    .map((item) => {
      const url = httpsUrl(item.url, "github.com").toString();
      const summary = [item.repository, item.area, item.status].filter(Boolean).join(" · ");
      return [
        "  <entry>",
        `    <id>${cleanXml(url)}</id>`,
        `    <title>${cleanXml(item.title)}</title>`,
        `    <link href="${cleanXml(url)}"/>`,
        `    <updated>${isoDate(item.updatedAt)}</updated>`,
        `    <summary>${cleanXml(summary)}</summary>`,
        "  </entry>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <id>${cleanXml(site.toString())}</id>`,
    `  <title>${cleanXml(snapshot.project.title)} — LynxBoard</title>`,
    `  <updated>${updated}</updated>`,
    `  <link href="${cleanXml(site.toString())}"/>`,
    `  <link rel="self" href="${cleanXml(selfUrl)}"/>`,
    `  <link rel="via" href="${cleanXml(projectUrl.toString())}"/>`,
    "  <author><name>rahmibabapro</name></author>",
    entries,
    "</feed>",
    "",
  ].filter((line) => line !== "").join("\n");
}

