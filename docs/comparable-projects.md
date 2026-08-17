# Comparable project review

Reviewed on 2026-08-18 to identify proven features that fit LynxBoard without turning it
into a configurable stats platform.

## Repositories reviewed

| Project | Useful pattern | LynxBoard decision |
|---|---|---|
| [GitHub Readme Stats](https://github.com/anuraghazra/github-readme-stats) | README-safe SVG cards, explicit light/dark handling, compact summaries | Adopt static SVG output and paired Quiet Winter themes. Do not add a large query-parameter theme API. |
| [Metrics](https://github.com/lowlighter/metrics) | Actions-generated artifacts that can be embedded outside the application | Generate cards in the existing trusted build, beside Pages and the Atom feed. Do not add a plugin system. |
| [GitHub Profile Summary Cards](https://github.com/vn7n24fzkq/github-profile-summary-cards) | Dedicated theme variants and copyable profile snippets | Publish stable `status-dark.svg` and `status-light.svg` URLs plus a README `<picture>` example. |
| [GitHub Readme Activity Graph](https://github.com/Ashutosh00710/github-readme-activity-graph) | A focused card with a small set of visible facts | Keep one compact project card instead of exposing every Project field. |
| [Org Metrics Dashboard](https://github.com/github-community-projects/org-metrics-dashboard) | GitHub Actions fetches data, then GitHub Pages serves a token-free dashboard | Retain LynxBoard's existing sanitized snapshot boundary and publish cards from the same snapshot. |

## Features adopted

1. **GitHub README card** — a standalone, script-free SVG generated from the validated
   public Project snapshot.
2. **Automatic light and dark variants** — both preserve the Quiet Winter hierarchy and
   can switch through the standard HTML `<picture>` element.
3. **Visible freshness** — each card names the last successful snapshot date and recent
   change count instead of implying real-time data.
4. **One build contract** — Pages, Atom, JSON, and SVG outputs are regenerated together,
   preventing cards from drifting away from the live board.
5. **Accessible and self-contained output** — SVG title and description elements expose
   the project, completion percentage, task total, and milestone; no script, font, image,
   credential, or external runtime resource is embedded.

## Features intentionally rejected

- Large theme catalogs and arbitrary color query parameters: they would weaken the visual
  identity and expand the validation surface.
- Rankings, trophies, and contribution scoring: LynxBoard reports delivery state, not
  developer status.
- Per-request GitHub API calls: they would expose rate-limit and credential concerns to
  every viewer.
- Plugin dashboards: the current single-purpose card is easier to understand, embed, and
  maintain.
