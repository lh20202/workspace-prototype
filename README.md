# Workspace prototypes

Two fictional Microsoft 365 workspace examples built with React, TypeScript, Vite and Fluent UI React v9. No authentication, document backend, real messages or personnel records.

## Development

Use Node 24 (at least 24.0). Run `npm ci`, then `npm run dev`. Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Routes

- `/`: prototype launcher, outside the simulated Microsoft interface.
- `/planning`: Organisational Planning & Reporting Home.
- `/planning/cycles`, `/planning/strategy`, `/planning/reporting`, `/planning/approved`, `/planning/restricted`: planning libraries and protected area.
- `/logistics`: Street & Telephone Campaign Logistics Home.
- `/logistics/operations`, `/logistics/locations`, `/logistics/resources`, `/logistics/training`, `/logistics/records`: operational libraries and the structured Locations & Permits list.
- `/logistics/teams?channel=central-city&tab=Posts`: Teams simulation. `Shared`, `Notes`, and `Planner` are also supported for logistics channels.

The charcoal prototype navigator switches demonstrations. The SharePoint/Teams links switch collaboration surfaces within logistics. Legacy `/strategy`, `/reporting`, `/approved`, and `/restricted` addresses still resolve to the planning prototype. The former Planning Cycles route `/planning` is now Home; use `/planning/cycles` for that library.

## Content and interactions

Planning libraries, files, folder paths, roles and milestones live in `src/data/workspace.ts`. Discovery and access rules are in `src/utils/documents.ts`. Normal browsing shows immediate folders and files; views, search and filters find documents across children. Current strategy (2025–2030) is separated from archived periods. The ordinary fictional contributor is Maya Chen. Restricted Planning shows its access boundary and a fictional contact; its IT request form only shows a simulation message.

Logistics content lives in `src/logistics/data.ts`. The `files` array is the single source of document objects. Channel Shared tabs and post attachments store IDs and resolve them through `filesById`; they do not maintain document copies. The same object supplies name, owner, campaign, validity dates, status and details in both applications. `src/logistics/query.ts` implements views, filters, permit discovery and canonical SharePoint file links. Operational dates are a fixed fictional Week 42 example (12–18 October 2026), so the demonstration stays coherent over time.

Tasks, posts, reactions and replies are local interactive examples and reset on reload. No messages are transmitted to Teams. Open/upload/new/version actions are explicitly simulated. No synthetic document contains an actual downloadable Office file. Role/access rules are client-side illustrations, not security controls.

## Render

Reuse the existing Render static site connected to `lh20202/workspace-prototype`, branch `main`. Build: `npm ci && npm run build`. Publish: `dist`. Node: 24.19.0. Enable automatic deploys on commit. Rewrite `/*` to `/index.html`. `render.yaml` records the setup; do not create a duplicate service. A blueprint file or successful push does not itself prove a live deployment.

## Design references

- https://fluent2.microsoft.design/components/web/react/
- https://learn.microsoft.com/en-us/sharepoint/information-architecture-modern-experience
- https://learn.microsoft.com/en-us/sharepoint/information-architecture-principles

Purposeful libraries, metadata, bounded folders, selected final records and shared channel collaboration. All people, campaigns, locations and records are fictional.
