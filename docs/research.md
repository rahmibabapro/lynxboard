# Architecture and delivery research

## Decision

Use a static GitHub Pages site generated from a sanitized GitHub Projects v2 snapshot.
This is the smallest reliable system for a public progress surface: no hosted database,
no server process to operate, no token in the browser, and no vendor account beyond
GitHub. GitHub remains the only source of truth.

## Repository review

| Project | Strength | Why it was not used as the base |
| --- | --- | --- |
| [lowlighter/metrics](https://github.com/lowlighter/metrics) | Mature profile SVG metrics and a large integration catalog | It is optimized for profile metrics, not Project field semantics or a public delivery queue. |
| [anuraghazra/github-readme-stats](https://github.com/anuraghazra/github-readme-stats) | Widely used repository and language cards | It summarizes Git activity, not planned work or completion by Project area. |
| [aenix-io/aeman](https://github.com/aenix-io/aeman) | A complete planning system built around Projects v2 | It adds an application stack and operational weight that this read-only public view does not need. |
| [jlucaspains/github-charts](https://github.com/jlucaspains/github-charts) | Project v2 charts and agile metrics | Its narrow chart surface and small adoption make a custom static boundary easier to secure and shape. |
| [Miraeld/sprinthub](https://github.com/Miraeld/sprinthub) | Project v2 dashboard inside VS Code | It targets an authenticated editor workflow rather than anonymous public followers. |

The useful pattern across these projects is separation: GitHub owns work state, a small
adapter derives presentation data, and the public surface stays disposable.

## Official platform constraints

- GitHub documents Projects v2 automation through GraphQL and requires `read:project`
  for queries: [Using the API to manage Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects).
- A user-owned project is queried through `user(login) { projectV2(number) }`, so a
  repository-scoped workflow token alone is not assumed to have access.
- GitHub's custom Pages workflow uses a generated artifact plus the official Pages
  deployment action: [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- Followers can use GitHub Watch controls for repository events:
  [Configuring notifications](https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications).

## Security boundary

- The credential exists only as an encrypted Actions secret and is exposed only to the
  sync step.
- Raw GraphQL data is normalized before publication.
- Draft items, redacted nodes, non-GitHub URLs, and inaccessible/private repository
  content are excluded.
- All public HTML is static; the browser cannot query GitHub with privileged credentials.
- The workflow has read-only repository permission except for the isolated Pages deploy
  job, which receives only `pages: write` and `id-token: write`.

## Refresh latency

GitHub's scheduled workflows support a shortest interval of five minutes:
[Workflow syntax for scheduled events](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onschedule).
The widget polls the already-sanitized public snapshot every 30 seconds while visible,
so an open embed picks up a successful deployment without a page reload.

GitHub documents `projects_v2_item` webhooks only for organization Projects, and account
webhooks cannot be created for personal user resources:
[Webhook events and payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads#projects_v2_item),
[Types of webhooks](https://docs.github.com/en/webhooks/types-of-webhooks).
The current user-owned Project therefore cannot provide true event-driven item updates.
The workflow already accepts a `project-sync` repository dispatch so an organization
Project and GitHub App receiver can be added later without changing the widget contract.
