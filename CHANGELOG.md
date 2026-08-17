# Changelog

## 0.3.0 — 2026-08-17

- Reframe the widget as a professional, compact release-telemetry surface.
- Add a live identity row, a visible Project link, and precise visual tokens.
- Label timeline work as Active, Queued, or Complete without relying on color alone.
- Add orchestrated snapshot-entry motion and a subtle active-signal animation.
- Disable motion completely when the visitor requests reduced motion.
- Preserve truthful zero-percent groups and improve small-text contrast to WCAG AA levels.

## 0.2.0 — 2026-08-17

- Replace the full dashboard with the supplied compact progress-panel composition.
- Add the standalone `/widget/` iframe and reusable `<lynx-board>` web component.
- Poll visible widgets for newly published snapshots without exposing a GitHub token.
- Reduce the Project refresh schedule from 30 minutes to GitHub's five-minute minimum.
- Accept a future `project-sync` repository dispatch for event-driven organization setups.

## 0.1.0 — 2026-08-17

- Launch the responsive LynxBoard public progress surface.
- Read and sanitize GitHub Projects v2 items through a tested GraphQL boundary.
- Generate a public Atom feed for task changes.
- Refresh and deploy to GitHub Pages twice an hour.
