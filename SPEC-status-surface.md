# Spec: status-surface

## Objective

Create a public progress surface inspired by the supplied dark production-status panel: visitors should understand overall progress, work areas, the next target, current work, and how to follow the project within ten seconds.

## Tech Stack

- Semantic HTML, modern CSS, and browser-native JavaScript modules
- No framework and no client-side GitHub token

## Commands

- Serve locally: `node scripts/serve.mjs`
- Test: `node --test`
- Smoke check: open `http://127.0.0.1:4173/`

## Project Structure

- `app/index.html` → semantic shell and metadata
- `app/styles.css` → visual system, responsive layout, reduced motion
- `app/app.mjs` → snapshot rendering and safe DOM updates
- `app/assets/` → local visual assets only

## Code Style

```js
const title = document.createElement("a");
title.textContent = item.title;
title.href = item.url;
```

Render untrusted GitHub text with `textContent`, never `innerHTML`.

## Testing Strategy

- Unit-test all formatting and aggregation in `project-data`.
- Browser smoke-test desktop and mobile layouts.
- Verify keyboard focus, reduced-motion behavior, empty/error states, and zero console errors.

## Boundaries

- Always: semantic landmarks, visible focus, responsive layout, truthful progress, readable contrast.
- Ask first: analytics, cookies, third-party fonts, or a custom domain.
- Never: fabricate progress, hide source links, or render GitHub-provided HTML.

## Success Criteria

- 320px–1600px layouts remain readable without horizontal scrolling.
- The page exposes overall completion, per-area counts, recent items, target date, and last sync.
- The visual signature is a restrained icy “signal slit,” not a generic card-grid dashboard.
- `prefers-reduced-motion` disables ambient animation.

## Open Questions

- None for the first release.

