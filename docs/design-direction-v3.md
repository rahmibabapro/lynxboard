# LynxBoard visual direction: Quiet Winter

## Intent

LynxBoard should feel calm, trustworthy, and contemporary inside a dark GitHub profile.
It should read as a considered product surface, not a game HUD, terminal, or admin template.

## Token system

- Canvas — `#111318`
- Surface — `#181b21`
- Raised surface — `#1e2229`
- Primary text — `#eef1f4`
- Secondary text — `#969faa`
- Winter blue — `#9ab4c5`
- Calm green — `#8fa99a`

Typography uses the native UI sans stack for headings and body copy, with a native mono
stack used only for dates and counts. Weight, spacing, and tabular numerals provide the
hierarchy; there is no condensed, uppercase, or sci-fi display face.

## Composition

```text
┌  lynx mark  Lynxboard · Project status      ● Live   Open ↗ ┐
│                                                            │
│  44 days until next public preview               Sep 30th  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Last synced Aug 17th                                     │
│                                                            │
│  Development board                              0% · 5     │
│  ┌ Infrastructure                           0 / 3 ──────┐  │
│  │ Documentation                            0 / 1 ──────│  │
│  └ Minecraft                                0 / 1 ──────┘  │
│                                                            │
│  Current focus · 4                            5 changes     │
│  ○ Connect GitHub repository updates to Discord   Active   │
│  ○ Choose and publish Atrium's license            Queued   │
│  ○ Upgrade the Next.js dependency chain           Queued   │
│  ○ Prepare a standalone public release             Queued   │
└────────────────────────────────────────────────────────────┘
```

## Signature

The only brand gesture is the small lynx line mark and a quiet winter-blue thread joining
task states. Everything else is deliberately ordinary, soft, and readable.

## Motion

New snapshots receive a short fade and six-pixel rise. Progress changes ease over 300 ms.
There is no scan line, glow, pulse, looping animation, or animated background. Reduced
motion removes every transform and transition.

## Self-critique

Soft dark dashboards can become generic when every block is a rounded card. To avoid that,
only the two true groups—the area summary and task list—use surfaces. The milestone remains
open and spacious, and task cards share one connected thread rather than floating as tiles.

