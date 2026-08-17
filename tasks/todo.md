# Tasks

- [x] Implement and test Project snapshot normalization.
  - Acceptance: hostile and incomplete fixtures produce safe, deterministic output.
  - Verify: `node --test tests/project-data.test.mjs`
- [x] Implement the GitHub GraphQL read boundary.
  - Acceptance: Project 1 can refresh without mutations or credential output.
  - Verify: `node scripts/sync-project.mjs`
- [ ] Build the LynxBoard status surface.
  - Acceptance: desktop/mobile, keyboard, empty, and error states work.
  - Verify: browser smoke test at `http://127.0.0.1:4173/`
- [ ] Build public delivery and feed generation.
  - Acceptance: `dist` contains the validated site and Atom feed.
  - Verify: `node scripts/build.mjs`
- [ ] Publish and verify GitHub Pages.
  - Acceptance: public HTTPS URL loads and latest workflow succeeds.
  - Verify: live browser and Actions checks.
