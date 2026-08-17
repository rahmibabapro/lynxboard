# Spec: project-sync

## Objective

Read `rahmibabapro`'s public GitHub Project `1` without modifying it and convert issues, pull requests, fields, and milestones into a stable JSON document for the public dashboard. Success means a scheduled job can refresh the snapshot without exposing credentials or breaking when optional project fields are empty.

## Tech Stack

- Node.js 22, ECMAScript modules, built-in `fetch`, `node:test`, and file-system APIs
- GitHub GraphQL Projects v2 API
- No runtime or build dependencies

## Commands

- Fetch: `node scripts/sync-project.mjs`
- Test: `node --test`
- Validate fixture: `node scripts/validate-snapshot.mjs app/data/project.json`

## Project Structure

- `lib/project-data.mjs` → pure validation and aggregation
- `scripts/sync-project.mjs` → authenticated GraphQL boundary and snapshot writer
- `scripts/validate-snapshot.mjs` → standalone schema check
- `tests/project-data.test.mjs` → unit tests and abuse cases
- `app/data/project.json` → safe public snapshot

## Code Style

```js
export function clampPercent(value) {
  return Math.min(100, Math.max(0, Math.round(value)));
}
```

Use small pure functions, named exports, early validation, two-space indentation, and no implicit mutation of inputs.

## Testing Strategy

- Unit-test normalization, percentages, missing fields, invalid URLs, and zero totals.
- Use fixtures instead of live GitHub calls in tests.
- Validate the generated snapshot before deployment.

## Boundaries

- Always: read-only GraphQL queries, HTTPS GitHub URLs, output allowlists, bounded pagination, escaped public text.
- Ask first: changing the source project, adding private repositories, or widening token permissions.
- Never: expose tokens in browser code, logs, artifacts, or committed files; mutate Project data.

## Success Criteria

- Produces valid JSON with project metadata, totals, groups, items, and timestamps.
- Missing `Area`, `Status`, `Target Date`, or iteration values do not fail the build.
- Only `github.com` and `api.github.com` links are accepted.
- Tests prove percentage calculations and hostile input handling.

## Open Questions

- A dedicated `read:project` token should eventually replace the broader local GitHub CLI token.

