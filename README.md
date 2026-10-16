# Workspace prototypes

A simple landing page leading to two interactive Microsoft 365 workspaces. Built with React, TypeScript, Vite and Fluent UI React v9. No backend, authentication, actual tickets, messages or personnel records.

## Development

Use Node 24. Run `npm ci`, then `npm run dev`. Validate with `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

## Routes

- `/`: Workspace prototypes. Three large links to the planning workspace, acquisition and activation logistics workspace, and its Teams experience.
- `/planning`: Organisational Planning & Reporting Home.
- `/planning/cycles`, `/planning/strategy`, `/planning/reporting`, `/planning/approved`, `/planning/restricted`: planning libraries and the protected area.
- `/logistics`: Acquisition & Activation Logistics Home.
- `/logistics/operations`, `/logistics/locations`, `/logistics/resources`, `/logistics/training`, `/logistics/records`: operational libraries and the structured Locations & Permits list.
- `/logistics/rota?type=street` and `/logistics/rota?type=telephone`: weekly operational rotas.
- `/logistics/calendar`: SharePoint-style monthly list calendar with month navigation, activity/search filters, an optional agenda view and day details linking to the same source records.
- `/logistics/teams?channel=central-city&tab=Posts`: Teams simulation. Logistics channels also support Shared, Notes and Planner.
- `/logistics/teams?channel=coaches&tab=Planner`: the existing Coach & Team Lead Planner used by the Home shortcut.
- `/service-desk/access-request`: Jira Service Management-style access request. The urgent Restricted Planning link populates its `location` query parameter with the attempted path.

The inset dark grey, monospaced **DEMO CONTROLS** strip is external to the Microsoft and service-desk interfaces. The landing page links enter workspaces; normal SharePoint/Teams links switch collaboration surfaces within logistics. Legacy `/strategy`, `/reporting`, `/approved`, and `/restricted` addresses still resolve to planning. `/planning` is Home; Planning Cycles is `/planning/cycles`.

## Content and shared records

Planning libraries, files, paths and milestones live in `src/data/workspace.ts`; discovery rules are in `src/utils/documents.ts`. Normal browsing shows immediate folders/files. Views, search and filters find documents across children. Current strategy (2025–2030) is separate from archived periods. Maya Chen is the fictional ordinary contributor. The narrower Restricted Planning boundary and fictional contact remain intact.

Logistics uses the single `files` array in `src/logistics/data.ts`. Teams Shared tabs and post attachments resolve IDs through `filesById`, so SharePoint and Teams display the same document objects and metadata. Queries and canonical file links live in `src/logistics/query.ts`.

`src/logistics/schedule.ts` attaches shift times and anonymous crew/group labels to existing file and permit IDs. Rotas resolve the original documents and permit location/lead/status. The calendar derives activities from those same duties, existing permits and existing Planner deadlines; it does not maintain a duplicate document store. Operational dates use a fixed fictional Week 42 example (12–18 October 2026), with the following week available in period controls.

## Simulated interactions and media

The Jira-style form has five read-only context fields and a reason field. Submit produces local confirmation `DEMO-1042`; no ticket or form data leaves the browser. Tasks, posts, reactions and replies are local examples and reset on reload. Open/upload/new/version actions are explicitly simulated; there are no stored Office documents. Access rules illustrate boundaries and are not security controls.

The user-provided Daisy photo was moved unchanged to `public/images/daisy.jpg`. It is served through `/images/daisy.jpg` in development and the production build. It appears in the first Pet photos post with the exact text “important mews coming in live” and alt text “Daisy the cat”. There is no absolute local filesystem path in browser code.

All organisation/workspace examples, people, campaigns, locations and business records are fictional. No company data was used. Daisy is the user-supplied illustration for the informal Teams example.

## Render

Use the existing static service connected to `lh20202/workspace-prototype`, branch `main`. Build: `npm ci && npm run build`. Publish: `dist`. Node: 24.19.0. Automatic deploys: on commit. SPA rewrite: `/*` → `/index.html`. `render.yaml` records the existing setup. Do not create a duplicate service. A successful Git push does not prove that deployment succeeded; inspect the actual service and browser-test its live routes.

## Design references

- https://fluent2.microsoft.design/components/web/react/
- https://learn.microsoft.com/en-us/sharepoint/information-architecture-modern-experience
- https://learn.microsoft.com/en-us/sharepoint/information-architecture-principles

Calendar reference: Microsoft Support, “Create a calendar view from a list” (https://support.microsoft.com/en-us/sharepoint/lists/create-a-calendar-view-from-a-list). The prototype follows the modern list calendar pattern and day details pane. Today returns to the fixed fictional example date, 14 October 2026.
