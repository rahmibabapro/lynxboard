# Capability Map: LynxBoard

| Module id | Responsibility | Depends on |
|---|---|---|
| `project-sync` | Read GitHub Projects v2 data, validate it, and publish a stable public snapshot. | — |
| `status-surface` | Turn the snapshot into an accessible, responsive public progress dashboard. | `project-sync` |
| `embed-widget` | Present the snapshot as a reference-faithful iframe and reusable web component. | `project-sync`, `status-surface` |
| `public-delivery` | Test, schedule, deploy, and expose follow links through GitHub Pages, Watch, and Atom. | `project-sync`, `status-surface` |

Build order: `project-sync` → `status-surface` → `embed-widget` → `public-delivery`.
