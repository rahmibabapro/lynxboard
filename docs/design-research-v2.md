# LynxBoard visual direction: Arctic Field Log

## The problem

The v0.3 surface is orderly and usable, but it reads like a polished SaaS status card.
Rounded cards, a pill-shaped live badge, soft elevation, and a conventional blue/amber
palette do not express the lynx identity strongly enough.

## Reference findings

- [Cyberpunk 2077 UI visual design](https://www.behance.net/gallery/133185623/Cyberpunk-2077User-Interface-%28Part-2%29)
  shows that memorable sci-fi UI comes from a coherent type, color, geometry, and layout
  grammar—not from adding neon decoration.
- [Destiny 2 UI visual design](https://www.behance.net/gallery/60073341/Destiny-2-UI-Visual-Design)
  uses quiet neutral fields, compact utility copy, and a few unmistakable markers to keep
  dense objective data cinematic without losing clarity.
- [Mission-control interface references](https://dribbble.com/search/mission-control-dashboard)
  consistently prioritize coordinates, state, sequence, and precise alignment over cards.
- [Dark UI guidance](https://www.toptal.com/designers/ui/dark-ui-design) reinforces using
  near-black surfaces, controlled luminance steps, and limited high-intensity accents.

## Subject and job

LynxBoard is an arctic field terminal for visitors following a live development expedition.
Its single job is to reveal momentum and the next tracked objective in a few seconds.

## Tokens

- Polar night `#05080d`
- Deep ice `#0a121c`
- Frost `#eaf5ff`
- Glacier signal `#78d7ff`
- Lynx-eye signal `#ff4f70`
- Muted steel `#8c9bad`

Typography uses three native roles: Bahnschrift/Aptos Display for condensed headings,
Aptos/Segoe UI for task text, and Cascadia Mono/Consolas for telemetry.

## Layout

```text
┌ LYNX SIGIL  LYNX//FIELD LOG       LIVE / OPEN ↗ ┐
│ 44 DAYS                              SEP / 30     │
│ NEXT PUBLIC PREVIEW  ━━━━━━━━━━━━━━━╾             │
├ DEVELOPMENT BOARD                000% / 005 ITEMS ┤
│ INFRASTRUCTURE         0/3  ───────────────────   │
│ DOCUMENTATION          0/1  ───────────────────   │
│ MINECRAFT              0/1  ───────────────────   │
├ CURRENT TRACK / 05 CHANGES ──────────────────────┤
│ 01  ACTIVE   Connect GitHub updates to Discord    │
│ 02  QUEUED   Choose and publish Atrium's license  │
│ 03  QUEUED   Upgrade the Next.js dependency chain │
│ 04  QUEUED   Prepare a standalone public release  │
└───────────────────────────────────────────────────┘
```

## Signature and restraint

The signature is the lynx sigil paired with a single red tracking line that locks onto the
active objective. Corners are cut, not rounded; task order is structural, not decorative.
There are no pills, glass cards, generic dashboard tiles, or perpetual scan effects. A
single field-scan reveal runs when a new snapshot arrives and disappears under reduced
motion.

