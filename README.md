# LynxBoard

A public, icy-blue delivery signal generated from the
[Development Board](https://github.com/users/rahmibabapro/projects/1).

**Live board:** <https://rahmibabapro.github.io/lynxboard/>

LynxBoard turns GitHub Project items into a compact progress view with a milestone,
area totals, current priorities, and recent activity. It refreshes on GitHub Pages
twice an hour. The browser receives only a sanitized static snapshot—never a token.

## Follow the work

- Open the [live status board](https://rahmibabapro.github.io/lynxboard/).
- Subscribe to the [Atom feed](https://rahmibabapro.github.io/lynxboard/feed.xml).
- Use **Watch** on this repository for release and repository notifications.
- Open the [GitHub Project](https://github.com/users/rahmibabapro/projects/1) for the full queue.

## How it works

1. A scheduled GitHub Actions workflow reads public items from Project 1 through
   GitHub's GraphQL API.
2. The sync boundary rejects drafts, redacted content, private links, and non-GitHub URLs.
3. A dependency-free build produces the dashboard, an Atom feed, and crawler metadata.
4. GitHub Pages deploys the generated `dist` artifact.

There is no database, analytics script, client-side API credential, or runtime backend.

## Local development

Requires Node.js 22 or newer.

```bash
npm ci
npm test
npm run build
npm run serve
```

To refresh from GitHub locally, provide a token with Project read access only for the
duration of the command:

```bash
GH_PROJECT_TOKEN=... npm run sync
```

The deployment workflow expects that token in the encrypted repository secret
`GH_PROJECT_TOKEN`. A dedicated fine-grained/read-only credential is preferred over a
general-purpose developer token.

## Documentation

- [Architecture and delivery research](docs/research.md)
- [Project sync contract](SPEC-project-sync.md)
- [Status surface contract](SPEC-status-surface.md)
- [Public delivery contract](SPEC-public-delivery.md)

## License

[MIT](LICENSE)
