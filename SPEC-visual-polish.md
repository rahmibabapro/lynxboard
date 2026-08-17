# Spec: professional visual polish

> Visual tokens and composition were superseded by the v0.5 Quiet Winter direction in
> [`docs/design-direction-v3.md`](docs/design-direction-v3.md). Accessibility, motion,
> resilience, and performance requirements in this document remain active. The previous
> Arctic Field Log exploration remains archived in
> [`docs/design-research-v2.md`](docs/design-research-v2.md).

## Objective

Evolve the compact LynxBoard widget from a reference-faithful game-style panel into a
professional release-telemetry surface without losing its recognizable lynx signal rail.
The result must remain truthful, dependency-free, responsive, and safe to embed.

## Design direction

- Present information in three layers: live identity, release progress, active work.
- Keep the paw rail as the single signature motif; render the rest with restrained
  typography, precise spacing, low-chroma surfaces, and hairline borders.
- Use one ice-blue accent for live/progress states and one warm amber accent for the
  active item. Group colors remain data-driven but are softened against the panel.
- Communicate every state with text and a symbol in addition to color.
- Use system fonts only. No third-party font, image, animation, or runtime dependency.

## Visual tokens

- Canvas: `#090d14`; surface: `#101722`; raised surface: `#172131`
- Primary text: `#f2f6fb`; secondary text: `#94a3b8`; border: `#2a374a`
- Ice accent: `#8ec5f4`; active amber: `#e1a76a`; success: `#78c6a3`
- Sans stack: `ui-sans-serif`, `Segoe UI Variable`, `Segoe UI`, system sans-serif
- Mono stack: `ui-monospace`, `SFMono-Regular`, `Consolas`, monospace

## Information architecture

1. A compact brand row exposes `LYNXBOARD`, live state, and the GitHub Project link.
2. The milestone row shows remaining time, target date, and an accessible progress rail.
3. The delivery row shows overall percent, task count, truthful area completion, and
   recent changes.
4. The signal timeline shows at most four items. Each card contains title, area, and an
   explicit `Active`, `Queued`, or `Complete` state.
5. The last successful snapshot time remains available to assistive technology.

## Motion contract

- On a new snapshot, reveal the milestone, area rows, and task cards once with a short
  stagger. Movement is limited to `transform` and `opacity`; progress fills use scale.
- The active paw may emit one subtle ambient ring. It must not move content or obscure text.
- Hover and keyboard focus may lift a linked card by at most two pixels.
- Under `prefers-reduced-motion: reduce`, all animations and movement transitions are
  disabled. No information may depend on animation.

## Accessibility and resilience

- Target WCAG 2.2 AA contrast for text and meaningful graphics.
- Do not rely on color alone; expose state text and a distinct status mark.
- Keep semantic headings, named progress bars, safe external links, and visible focus.
- The live badge is decorative; snapshot status remains a polite live region.
- Long repository task titles truncate visually while their full title remains available.
- Empty/error states keep the same layout and remain readable.

## Performance budget

- No new network request beyond the existing sanitized JSON snapshot.
- No external asset, font, framework, or animation library.
- Widget-authored HTML, CSS, and JavaScript should remain below 50 KB uncompressed.
- Avoid layout animation and continuous timers beyond the existing refresh scheduler.

## Success criteria

- The direct widget is composed and readable at 562×661 and at 390 px wide.
- There is no horizontal overflow at 320 px.
- Four task cards fit without covering the progress section.
- Browser console and network log are clean on the root page, direct iframe, and host embed.
- Keyboard navigation reaches the Project link and linked tasks with visible focus.
- Reduced-motion mode reports no running animation on the active node or cards.
- Existing snapshot, embed, and security contracts continue to pass.

