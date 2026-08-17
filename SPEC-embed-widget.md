# Spec: embed-widget

## Objective

Turn the supplied 562×661 dark progress panel into a reusable, read-only LynxBoard
widget. A visitor should be able to embed it on any HTTPS site with either one iframe
or one custom-element script while GitHub Project 1 remains the source of truth.

## Tech Stack

- Semantic HTML, modern CSS, browser-native JavaScript modules
- Sandboxed iframe wrapper exposed as the `<lynx-board>` web component
- No runtime dependency and no client-side GitHub credential

## Commands

- Focused tests: `node --test tests/widget-view-model.test.mjs tests/embed-element.test.mjs`
- Full tests: `npm test`
- Build: `npm run build`
- Local preview: `node scripts/serve.mjs dist`

## Project Structure

- `app/widget/index.html` → standalone iframe document
- `app/widget/widget.css` → reference-faithful 562×661 visual system
- `app/widget/widget.mjs` → safe snapshot rendering and visible-tab polling
- `app/embed.mjs` → reusable `<lynx-board>` wrapper
- `app/widget-view-model.mjs` → pure display derivation shared with tests

## Code Style

```js
const label = document.createElement("span");
label.textContent = item.title;
```

Treat GitHub text as untrusted data; use DOM text nodes and allowlisted URLs only.

## Testing Strategy

- Unit-test display derivation, clamping, sorting, safe defaults, and embed attributes.
- Test the generated custom element contract without network access.
- Browser-test the standalone widget at 562×661, a 390px mobile viewport, and inside
  a host-page web component.
- Verify zero console warnings, no horizontal overflow, link safety, and reduced motion.

## Boundaries

- Always: preserve truthful counts, expose the last sync, sandbox the iframe, and keep
  the widget responsive from 320px upward.
- Ask first: accept arbitrary data URLs, add editable controls, or add third-party fonts.
- Never: ship a GitHub token, fabricate progress, render GitHub HTML, or claim webhook
  immediacy that a personal Project cannot provide.

## Success Criteria

- Visual order and proportions match the supplied reference: milestone rail, total row,
  stacked colored areas, recent-change line, and four-node speech-bubble timeline.
- `https://rahmibabapro.github.io/lynxboard/widget/` works as a direct iframe.
- Loading `embed.mjs` registers `<lynx-board>` once and derives its iframe URL from the
  module location, so the package works from GitHub Pages or a self-hosted copy.
- The iframe refreshes its public JSON in place every 30 seconds while visible.
- GitHub Actions refreshes the authoritative snapshot at GitHub's minimum supported
  five-minute schedule and still supports manual runs.

## Open Questions

- True event-driven updates require moving the personal Project to an organization and
  installing a GitHub App webhook receiver; personal Projects do not expose Project item
  webhooks. This release therefore promises automatic near-real-time refresh, not instant
  webhook delivery.
