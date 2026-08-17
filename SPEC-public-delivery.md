# Spec: public-delivery

## Objective

Publish LynxBoard from GitHub Actions to GitHub Pages, refresh it every five minutes, and give visitors durable follow mechanisms without creating another account system.

## Tech Stack

- GitHub Actions and GitHub Pages
- Repository Watch/notifications
- Generated Atom 1.0 feed

## Commands

- Test: `node --test`
- Build: `node scripts/build.mjs`
- Local serve: `node scripts/serve.mjs dist`
- Manual refresh: GitHub Actions → `Refresh and deploy` → Run workflow

## Project Structure

- `.github/workflows/pages.yml` → test, sync, build, deploy
- `scripts/build.mjs` → validate/copy site and generate Atom feed
- `app/feed.xml` → generated public subscription feed
- `README.md` → setup, security, and follow instructions

## Code Style

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

Declare the smallest workflow permissions and pass the project token only to the sync step.

## Testing Strategy

- Run tests and snapshot validation before artifact upload.
- Build locally and smoke-test the generated `dist` directory.
- Verify the live Pages URL and latest Actions run after publishing.

## Boundaries

- Always: official GitHub Actions, least-privilege workflow permissions, no secrets on pull requests.
- Ask first: Discord posting, custom domains, or adding non-GitHub hosting.
- Never: commit the project token, expose it to frontend JavaScript, or deploy private Project content.

## Success Criteria

- Public Pages URL loads over HTTPS.
- The minimum-supported five-minute schedule and manual dispatch both update the snapshot.
- Visitors can open the source Project, watch the repository, and subscribe to Atom.
- Deploy fails closed on invalid generated data.

## Open Questions

- Discord delivery is intentionally deferred until the target server/channel is known.
- Personal Projects have no Projects v2 item webhook. Event-driven refresh would require
  an organization Project plus a GitHub App webhook receiver.
