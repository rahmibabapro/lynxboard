# LynxBoard implementation plan

1. Build and test the read-only Project data contract.
2. Add a local snapshot from the existing Development Board.
3. Render the dashboard as a responsive static site.
4. Generate the Atom feed and production artifact.
5. Configure scheduled GitHub Pages deployment.
6. Publish, verify the live site, and document follow options.
7. Derive a reference-faithful widget view model and visual surface.
8. Package the surface as an iframe and `<lynx-board>` web component.
9. Reduce automatic refresh latency to GitHub's safe minimum and publish v0.2.0.

## Risks and mitigations

- **User Project requires a token:** keep it server-side in Actions and pass it only to the sync step.
- **Optional fields are sparse:** normalize absent values and show honest empty states.
- **Public repo could expose private work:** reject redacted/private items and publish only allowlisted fields.
- **Scheduled Actions can be delayed:** show the last successful sync time and keep manual dispatch enabled.
- **Personal Projects cannot emit Project item webhooks:** poll the sanitized snapshot in
  the widget and run the source sync every five minutes; document the exact limitation.
