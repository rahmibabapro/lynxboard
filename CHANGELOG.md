# Changelog

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
