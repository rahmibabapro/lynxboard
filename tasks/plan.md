# LynxBoard implementation plan

1. Build and test the read-only Project data contract.
2. Add a local snapshot from the existing Development Board.
3. Render the dashboard as a responsive static site.
4. Generate the Atom feed and production artifact.
5. Configure scheduled GitHub Pages deployment.
6. Publish, verify the live site, and document follow options.

## Risks and mitigations

- **User Project requires a token:** keep it server-side in Actions and pass it only to the sync step.
- **Optional fields are sparse:** normalize absent values and show honest empty states.
- **Public repo could expose private work:** reject redacted/private items and publish only allowlisted fields.
- **Scheduled Actions can be delayed:** show the last successful sync time and keep manual dispatch enabled.

