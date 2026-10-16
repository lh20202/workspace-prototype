# Workspace prototypes

A simple landing page leading to five interactive Microsoft 365 workspaces. Built with React, TypeScript, Vite and Fluent UI React v9. No backend, authentication, actual tickets, messages or personnel records.

## Development

Use Node 24. Run `npm ci`, then `npm run dev`. Validate with `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

## Routes

- `/`: Workspace prototypes. Six large links to the planning workspace, acquisition and activation logistics workspace, Organisation Services, Audience Research & Marketing Insight, Content Creation & Delivery, and the Teams experience.
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

Narrow protected matter routes sit inside technology, legal, purchasing, workplace and hiring topics, e.g. `/services/legal/matters/INV-008`, `/services/procurement/tenders/TND-014`, `/services/hiring/recruitment/REC-221`. Only minimal labels are modelled; no protected files or case payloads exist in the client. The normal fictional member receives a restricted state and the existing local Freshservice-style access request, prefilled with Organisation Services, service area and matter. This is an information-architecture demonstration, not production access enforcement.

System launch tiles use clean product text rather than invented logos. Freshservice links to `/service-desk/it-support`, extending the same existing simulated portal for first-level triage and specialist support. Oracle NetSuite, M-Files, Greenhouse Recruiting and Microsoft 365 open clearly marked simulated external destinations under `/services/systems/…`. No authoritative transactions, candidate queues or controlled records are duplicated; external IDs are references only. No request is sent, no external login is opened, and no data leaves the browser.

## Audience Research & Marketing Insight

The current landing page gains an **Outreach · Interactive Demo** link to `/audience-innovation`; the existing layout, colours, logos, typography and other entries are preserved. The dark external demo controls gain the same workspace. Child routes: `/research`, `/audiences`, `/experiments`, `/analytics`, `/decisions`, `/calendar` beneath `/audience-innovation`.

`src/audience/data.ts` is the single fictional dataset. The research/experiment register, Home initiatives, Innovation Pipeline, saved views, experiment backlog, related working files, calendar and decisions refer to common initiative/file IDs. Register stage changes update status coherently and are reflected in the other views. Approval or an additional-evidence decision updates the linked initiative. Changes and review comments are local to the current workspace session and reset on reload; URL filters, canonical file links and direct child routes support refresh.

Audience & Journeys contains five aggregate synthetic segments and a seven-stage interactive journey with behaviours, touchpoints, gaps and linked evidence. Measurement & Analytics contains website friction analysis, a measurement framework and an exploratory retention model with validation/bias/limitations material. The linked Website Analytics and Performance dashboard destinations (`/audience-innovation/systems/website-analytics` and `/audience-innovation/systems/performance`) show a few synthetic aggregate indicators and interpretation links, not a cloned analytics platform or actual tracking service.

The month-style Research Calendar uses existing calendar styling and eight fictional October 2026 sessions/milestones linked to the register. The Teams indicator opens a restrained connection panel with four enduring channels and links to the same SharePoint working files; it does not create a duplicate Teams file structure or a separate Teams simulation. Existing logistics Teams remains unchanged.

Study-level protection is demonstrated at `/audience-innovation/research/website-usability/participant-administration`. Only an appropriate boundary label exists; no participant records are present in the client or ordinary search/views. It reuses the existing access-request portal with workspace, study path and user prefilled, and returns to audience research. All research, models, examples and metrics are fictional and non-identifiable. There are no analytics trackers, backend requests or production predictive models.


## Content Creation & Delivery

`/content-delivery` adds a fifth SharePoint workspace with the existing Outreach landing treatment, shared red/white shell, typography, file icons and dark demo controls. Child routes: `/pipeline`, `/editorial`, `/creative`, `/channels`, `/digital`, `/partners`, `/calendar`, `/teams`, `/tools` beneath `/content-delivery`. The existing prototypes remain in place.

`src/content/data.ts` contains 12 canonical fictional packages, sparse working files and specialist-system references. Home production/review/release views, saved pipeline views, channel/format filters, package details, partner handoffs and calendar milestones all use those same package objects. Standard channel files resolve to the same canonical SharePoint file objects. Package stages, review comments, rights and approvals are local demonstration edits and reset on reload. Release-stage changes enforce pending reviews, permitted channels, rights status and embargo conditions; they never publish anything.

Content purpose stays together across editorial, creative and digital outputs. Mobile Sign-up Experience links the research need to the brief, UX copy, design, external developer handoff, Contentful implementation, acceptance, experimentation, release and measurement. Research and evaluation link back to Audience Research & Marketing Insight; analytical files are not copied into production.

The scoped partner previews at `/content-delivery/packages/PKG-103/shared` and `/content-delivery/packages/PKG-105/shared` show only the approved production/development file IDs for that engagement. They omit workspace search, other package content and protected components. Invalid out-of-scope file parameters do not open a file. These are explicit collaboration previews, not real authentication or external sharing.

Protected components follow their package: story participant administration, pre-release operational briefing, embargoed distribution, commercial proposal and security-sensitive implementation notes. No participant, medical, contact, security or commercial payloads are seeded. The normal production context shows minimal rights/conditions and external references, and the existing local access-request portal is prefilled with the package and component.

Eight compact Quick Access links and an All Tools list cover the requested fictional ecosystem of 18 real platforms. Product text with Fluent icons is used rather than invented brand logos or hotlinked assets. Each tool opens a clearly marked simulated external destination, optionally carrying its package and fictional reference. No authoritative CMS, ticket, customer/contact, financial, registration, source-code or analytics dataset is reproduced. The collaboration calendar shows milestones; detailed channel timing stays in Planable.

Organisation Services keeps its existing areas, handoffs and protected matters, with tools updated to Freshservice, Oracle NetSuite, M-Files, Greenhouse Recruiting, Microsoft 365 and Asana. External references now use FS-/NS-/MF-/GH-/AS- prefixes. Existing `/services/systems/business-central`, `/docuware`, and `/recruitment` URLs remain aliases; protected recruitment matter IDs and routes remain stable. The shared portal displays Freshservice for Organisation Services and Content Creation & Delivery while preserving other existing flows.

Vendor roles checked against primary sources on 16 October 2026: [Planable](https://planable.io/), [Contentful](https://www.contentful.com/solutions/composable-content-platform/), [Affinity](https://www.affinity.studio/), [Wistia](https://wistia.com/), [Cvent](https://www.cvent.com/), [Piwik PRO](https://piwik.pro/), [Brandwatch](https://www.brandwatch.com/), [Freshservice](https://www.freshworks.com/freshservice/), [NetSuite](https://www.netsuite.com/portal/home.shtml), [M-Files](https://www.m-files.com/), [Greenhouse](https://www.greenhouse.com/) and [Asana](https://asana.com/). VWO currently redirects to [Wingify](https://wingify.com/why-wingify/); the UI retains the requested VWO reference with the current Wingify name. Official URLs for the remaining tools are stored in the tool registry as research references; no vendor assets are fetched at runtime.

## Digital Workspaces intranet and financial operations

The root is now a minimal SharePoint-style intranet directory, as requested: illustrative top navigation with Digital Workspaces selected, six compact workspace tiles, small SharePoint marks on the workspace links and a fixed Teams call to action. Six fictional staff choices open `/teams?staff=...`, showing their relevant workspace, enduring channels and the original canonical SharePoint file objects. The existing full logistics Teams conversation/Planner/Pet photos experience remains available unchanged.

`/financial-operations` adds Income & Financial Operations, a single connected workspace with Income Administration, Reconciliation & Close, Payments & Settlement, Planning & Analysis, Accounting & Reporting, Treasury & Banking and Financial Calendar. Common synthetic coordination records drive home cycles, handoffs, saved views, registers, details and calendar milestones. Ten ordinary working files contain no sensitive payload. Procurement evidence links back to `/services/procurement`; specialist records are references rather than duplicated financial datasets.

Income matching and refund examples connect Salesforce/Stripe to reconciliation, NetSuite and reporting. Planning supports shared contribution milestones, aggregate fictional variance explanations (Maya's assigned income line only), narrow draft scenarios and a clearly labelled simulated budget-owner approval releasing an approved baseline reference. Close checklist updates are local coordination states; no payment, accounting posting or external approval is executed. All edits reset on reload.

Twenty-three protected subjects sit within their business area, including payment exceptions, payroll, draft forecasts, tax papers, bank mandates and transfer authorisation. Only boundary labels are seeded; no underlying protected records exist in the browser. Generic files, search, calendar, shared views and Teams reuse only safe coordination objects. These are illustrative access boundaries, not production authentication. The existing Freshservice access-request simulation accepts financial context and returns to the workspace.

Fictional financial platform choices verified against official product descriptions on 16 October 2026: [Salesforce Sales Cloud](https://www.salesforce.com/sales/), [Stripe](https://stripe.com/payments), [Oracle NetSuite](https://www.netsuite.com/portal/products/erp/financial-management.shtml), [BlackLine](https://www.blackline.com/), [Workday Adaptive Planning](https://www.workday.com/en-us/products/adaptive-planning/overview.html), [Tableau](https://www.tableau.com/) and [Kyriba](https://www.kyriba.com/). Product wordmarks are text; there are no hotlinked logo assets or real external transactions. Customer Care & Relations is not present in this repository, so no fictional dead link or replacement workspace was added.

## CEO & Executive Committee and separate controlled environments

`/executive` adds the seventh workspace using the existing SharePoint shell, typography, cards, dark external demo controls and local Fluent icons. The directory retains its compact tiled layout and pinned Teams staff selector, adding fictional Executive Coordinator Robin Avery. Shared executive coordination, briefing stages, safe decision metadata, approved/shared work and calendar milestones connect to planning, financial analysis and delivery sources rather than duplicate their libraries. The emergency launch has a dark-red security accent and appears alongside current priorities; no incident title, count, participant, file or activity appears on executive Home, search or calendar.

Executive participation is an explicit local preview (`?preview=...`). Base coordination, Leadership Team, Oversight Committee Liaison and Strategic Initiatives each have separate access. An initiative participant sees Digital Service Renewal only; the separate strategic-review preview can inspect the five synthetic executive initiative summaries. Leadership status changes, briefing stages and initiative stages are local and reset on reload. Approved decisions and source links are distinct from pre-decision working papers; saved views and search operate on permitted canonical records. There is no generic confidential library.

`/governance` is a separate controlled environment with a restrained slate identity and independent Committee Member / Member Representative previews. Executive participation never supplies governance membership. Committee and Members Assembly records are filtered independently. Executive-side preparation references the authoritative GOV-2026-04 resolution in this portal; formal minutes, resolutions and member records are not copied into executive files. No real personal member data or substantive committee deliberations are seeded.

`/emergency-response` and `/emergency-response/incidents/:incidentId` are a separate Teams-style environment, always marked **STRICTLY CONFIDENTIAL · DEMO PREVIEW**. Intentionally entering the preview shows fictional incident structures as each selected incident's response lead; it is not a claim that ordinary users can browse live incidents. Every private response has its own participant objects, file IDs, posts, actions, timeline and decision log. A setup form creates a private response locally; specialist membership can be added/removed for that incident only. Posts, decisions and action states are interactive. Closing requires follow-up, closure review and confirmation of evidence capture, then archives the response read-only. No external channel, membership, message, ticket or financial/governance action is actually created. Reload restores seeded data; unknown temporary incident IDs then show unavailable. ED-105 is a minimal cross-environment executive decision reference, not an incident-content copy.

Automated boundary tests cover role isolation, filtered search/files/views, initiative scope, independent governance audiences, incident-specific files/membership and archived immutability. Browser validation covers role transitions, governance denial, incident creation, posts, actions, participants, decisions and closure. Customer Care & Relations still does not exist in the supplied project and was not invented or replaced.
