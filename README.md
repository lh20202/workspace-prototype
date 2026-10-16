# Workspace prototypes

A simple landing page leading to four interactive Microsoft 365 workspaces. Built with React, TypeScript, Vite and Fluent UI React v9. No backend, authentication, actual tickets, messages or personnel records.

## Development

Use Node 24. Run `npm ci`, then `npm run dev`. Validate with `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

## Routes

- `/`: Workspace prototypes. Five large links to the planning workspace, acquisition and activation logistics workspace, Organisation Services, Audience Insight & Innovation R&D, and the Teams experience.
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

## Organisation Services

`/services` adds a third SharePoint workspace for internal service providers. The existing simple landing page is retained (the earlier intranet was intentionally removed); its new SharePoint link is labelled Infrastructure & Services. The dark external demo controls include Organisation Services. Existing planning, logistics, Teams and service-desk routes remain in place.

Routes: `/services/coordination`, `/services/projects`, `/services/technology`, `/services/legal`, `/services/procurement`, `/services/workplace`, `/services/hiring`, `/services/resources`. Every route supports direct loading via the existing Render SPA rewrite. Libraries use folder-first navigation, document search, saved views, work-type filters, details, simulated previews and canonical document links.

`src/services/data.ts` contains only fictional provider material. Shared templates are single canonical objects referenced across service areas and scenarios. Service Coordination includes a directory of request routes and five lightweight handoff examples. The software implementation and approved recruitment-to-setup scenarios link existing source guidance rather than making copies or exposing candidate records. Recent documents and ordinary search never contain protected matter content.

Narrow protected matter routes sit inside technology, legal, purchasing, workplace and hiring topics, e.g. `/services/legal/matters/INV-008`, `/services/procurement/tenders/TND-014`, `/services/hiring/recruitment/REC-221`. Only minimal labels are modelled; no protected files or case payloads exist in the client. The normal fictional member receives a restricted state and the existing local Jira-style access request, prefilled with Organisation Services, service area and matter. This is an information-architecture demonstration, not production access enforcement.

System launch tiles use clean product text rather than invented logos. Jira links to `/service-desk/it-support`, extending the same existing simulated portal for first-level triage and specialist support. Business Central, DocuWare, Recruitment Portal and Microsoft 365 open clearly marked simulated external destinations under `/services/systems/…`. No authoritative transactions, candidate queues or controlled records are duplicated; external IDs are references only. No request is sent, no external login is opened, and no data leaves the browser.

## Audience Insight & Innovation R&D

The current landing page gains an **Outreach · Interactive Demo** link to `/audience-innovation`; the existing layout, colours, logos, typography and other entries are preserved. The dark external demo controls gain the same workspace. Child routes: `/research`, `/audiences`, `/experiments`, `/analytics`, `/decisions`, `/calendar` beneath `/audience-innovation`.

`src/audience/data.ts` is the single fictional dataset. The research/experiment register, Home initiatives, Innovation Pipeline, saved views, experiment backlog, related working files, calendar and decisions refer to common initiative/file IDs. Register stage changes update status coherently and are reflected in the other views. Approval or an additional-evidence decision updates the linked initiative. Changes and review comments are local to the current workspace session and reset on reload; URL filters, canonical file links and direct child routes support refresh.

Audience & Journeys contains five aggregate synthetic segments and a seven-stage interactive journey with behaviours, touchpoints, gaps and linked evidence. Measurement & Analytics contains website friction analysis, a measurement framework and an exploratory retention model with validation/bias/limitations material. The linked Website Analytics and Performance dashboard destinations (`/audience-innovation/systems/website-analytics` and `/audience-innovation/systems/performance`) show a few synthetic aggregate indicators and interpretation links, not a cloned analytics platform or actual tracking service.

The month-style Research Calendar uses existing calendar styling and eight fictional October 2026 sessions/milestones linked to the register. The Teams indicator opens a restrained connection panel with four enduring channels and links to the same SharePoint working files; it does not create a duplicate Teams file structure or a separate Teams simulation. Existing logistics Teams remains unchanged.

Study-level protection is demonstrated at `/audience-innovation/research/website-usability/participant-administration`. Only an appropriate boundary label exists; no participant records are present in the client or ordinary search/views. It reuses the existing access-request portal with workspace, study path and user prefilled, and returns to audience research. All research, models, examples and metrics are fictional and non-identifiable. There are no analytics trackers, backend requests or production predictive models.
