# Digital workspace design — Microsoft 365 proof of concept

## UI refinement instruction

Do not invoke `$polish-website` again in this project. Future UI refinements must be explicit and task-specific, implemented directly against the requested scope rather than delegated to Website Polish.

An interactive React/TypeScript/Vite proof of concept for a SharePoint intranet, functional workspaces and selected Teams experiences. `/` is the Welcome page, with two reference workspace choices and **Explore all workspaces & wikis**, marked **BETA TEST** in a restrained berry pill. A small SharePoint cue identifies the product context; concise proof-of-concept and creation explanations open on demand. No company data was used, and the demo is not connected to live Microsoft 365 or business systems. All people, work items, records and platform choices are fictional. No backend, real authentication, external messages or authoritative business transactions are implemented.

## Run and validate

Use Node 24 (Render uses 24.19.0).

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

The existing local production preview can be run with `npx vite preview --host 127.0.0.1 --port 5180` after building.

## Functional ownership

`src/workspaces/registry.ts` is the canonical registry: names, routes, purposes, Teams availability, access models, legacy redirects, cross-workspace handoffs and 21 explicit primary-destination examples. Existing specialised applications retain their working behaviour; the new areas share the established Fluent UI/SharePoint shell through `FunctionalApp`.

| Workspace registry title           | Route                     | Primary work |
| ---------------------------------- | ------------------------- | ------------ |
| Planning Cycle                     | `/planning`               | Organisation-wide strategy, plans and approved reporting |
| Acquisition Logistics              | `/logistics`              | Deployment, staffing, rotas, locations and operational logistics |
| Research & Insight                 | `/audience-innovation`    | Research, journeys, analytics, experiments and automation ideation |
| Creative Studio                    | `/content-delivery`       | Editorial, creative, content packages, requirements and acceptance |
| Customer Relations                 | `/customer-relations`     | Care, relationships, accounts, partnerships and interaction quality |
| Income & Financial Operations      | `/financial-operations`   | Income, reconciliation, settlement, accounting, FP&A and treasury; signposted as Purse Strings in the directory |
| Purchasing & Office                | `/services`               | Office Maintenance & Equipment, Purchasing & Suppliers, Travel Services, Reception only |
| Quality & Monitoring               | `/quality-monitoring`     | Cross-company monitoring, process redesign, improvement and Eco Practice |
| Tech & Digital                     | `/digital-tech`           | Engineering, Web & CRM, business systems, AI, M365, information architecture and operations |
| Legal & Risk                       | `/legal-compliance`       | Advice, privacy, compliance, assurance and controlled legal matters |
| People & Culture                   | `/people-culture`         | Workforce, leadership, culture, inclusion, learning, internal communications, wellbeing and organisation-wide framework design |
| Employment & Hiring Administration | `/employment-admin`       | Strictly confidential recruitment/employment coordination, protected candidate/personnel records and system handoffs |
| Welfare & Employee Representation  | `/welfare-representation` | Strictly confidential welfare, safeguarding/complaints and independent employee representation |
| Executive & CEO                    | `/executive`              | Executive coordination, restricted decisions, liaison and strategic initiatives |
| Project Centre                     | `/projects`               | Formal project control, active support, reviews and separate project delivery workspaces |
| Company Archives                   | `/archives`               | Historical discovery, retention, appraisal, transfer, description and preservation |

Department Teams is a separate organisational layer. The six departments and 33 unit structures remain intact in the directory's right rail and `/teams?staff=maya&department=mcg&tab=Posts`. Channels can be Organisation-wide or Department-only; unit folders can be Department-wide or Unit-only. Role membership filters posts, files, search and availability views. Local administration stays here; contextual MODERATOR replies link misplaced business work to its functional owner. The directory has no generic Teams action or fixed bottom preview bar. Its six Department links open an explicitly labelled General Staff Member department-preview context with Company Updates and department-wide General content only; unit-only content is excluded. Switching Preview Role clears this route-scoped override and loads the actual role’s normal Teams context.

An external auto-hiding control strip replaces the permanent dark navigation bar. Its thin top edge and keyboard-focusable handle reveal **← Welcome**, **All workspaces · BETA**, **Workspace FAQ**, **Preview role** and **ENG / DE**. Hover, focus or a handle click opens it; leaving collapses it after a short delay unless a control retains focus. Entering from Welcome briefly reveals it once per browser session. The noninteractive blue-grey fictional-content notice sits below the action row, separate from navigation. Reduced-motion users receive immediate state changes.

## Hub families

The central registry defines hub association, short navigation labels, environment type and workspace access level. Architecture sections and the shared `HubNavigation` read that model; grouping never grants site or protected-area access. `workspaceRegistry` contains the 16 SharePoint workspaces; `environmentRegistry` adds the Wiki and Frontline Portal as distinct environments.

The directory uses four vertically separated, colour-tinted bands, each with its own lightweight Admin logins. Normal SharePoint entrances use compact white WorkspaceIcon tiles, two per row at desktop/laptop widths. Wiki and external links, controlled Personnel links and Finance jump links keep their lighter distinct treatments. Its signposts reuse existing sites and canonical files; normal page scrolling preserves readable content.

| Directory band | Destinations |
| -------------- | ------------ |
| Sales | Workspaces: Research & Insight; Creative Studio; Acquisition Logistics; Customer Relations. Separately: Sales & Marketing Wiki and Frontline Crew Portal. |
| Org Central | Direction & assurance: Executive & CEO; Planning Cycle; Project Centre; Quality & Monitoring; Legal & Risk. Shared services: Tech & Digital; Purchasing & Office; Company Archives. |
| Personnel | Culture & Inclusion; Learning Management; Internal Events & Networking. Quiet protected text links: Personnel Admin; Workers' Union; Welfare & Safeguarding. |
| Purse Strings | The existing Income & Financial Operations workspace at `/financial-operations`. Jump to: Income & Booking; Payments & Close; Planning & Reporting; Treasury. German label: **Geldströme**. |

The three ordinary Personnel destinations are section entrances in the existing People & Culture workspace, not three new sites or duplicate libraries. Culture & Inclusion links workforce, organisation, leadership, framework and aggregate analytics work; Learning Management retains learning and onboarding design; Internal Events & Networking links communications, meetings, networks and events. Personnel Admin opens `/employment-admin`; Workers' Union opens the independently protected `/welfare-representation/employee-representation`; Welfare & Safeguarding opens `/welfare-representation/welfare-support`. Independent representation does not inherit welfare or personnel access.

Every normal directory workspace and both Welcome reference choices use the same `WorkspaceIcon`: an outlined folder with a restrained S badge. A separate lock denotes controlled access. Wiki and Portal destinations have their own environment icons. Admin logins use four fictional local vendor marks—**Teralink**, **Velora**, **PeopleHarbour** and **Recorda**—and open lightweight external-system simulations, with no authentication or live connection. Admin logins is not a fifth hub.

Executive, personnel-administration and welfare boundaries deny non-member entry. Jamie's Employment preview retains its identity when following internal links; individual-record boundaries remain narrower. Department Teams remains separate from the functional bands.

This follows Microsoft's [hub planning guidance](https://learn.microsoft.com/en-us/sharepoint/planning-hub-sites) and [navigation guidance](https://learn.microsoft.com/en-us/sharepoint/plan-navigation-modern-experience): associate related sites without replacing their independent permissions, and use clear, progressively disclosed navigation. One shared hub bar provides a compact **Workspaces** folder menu, separated Wiki/Portal entries where relevant, current-site state and the **Company intranet** link to `/architecture`. It preserves explicit staff context while dropping page-specific filters. Local navigation stays separate. Finance remains standalone with its existing site and Company intranet destination.

## Sales & Marketing knowledge and frontline execution

The **Sales & Marketing Wiki** at `/sales-marketing/wiki` is the only hub Wiki demonstrated. Its warm reading canvas, bundled IBM Plex Sans typography and two persistent desktop navigation rails differ deliberately from SharePoint and Teams. The primary rail selects Foundations, Messaging & Creative, Insight & Performance, Legal & Standards, Learning, Tools & How-tos, Who to Ask or A–Z Directory; the chapter rail follows that context. Chapter routes support direct refresh and browser back/forward. Reference articles link to the same managed source files rather than duplicating working documents.

**A–Z Directory** retains the Wiki's hub context and uses the shared SharePoint document-library component: shallow subject folders, A–Z/Recently updated/Needs review/By topic views, search, metadata, Details and Version history. Its source/reference collection is separate from live research, production, customer and legal working files.

The **Frontline Crew Portal** at `/frontline-sales` uses the shared external-environment preview with its restrained **COMING SOON** variant. Members Portal (`/governance` and legacy child routes), International Taskforce Portal, City Health Unit, Global Media Library and third-party systems use the same external boundary. These views have no product navigation; the collapsed demo-control handle remains available. Detailed external applications and business datasets are intentionally absent.

The directory presents the Wiki, Frontline Crew Portal and Global Media Library separately from the Sales workspace tiles. No Org Central, Personnel or Financial Wiki has been added. Other hub Wikis remain intentionally undecided because their relationship with the wider company intranet and resource centre requires further design validation.

Planning has a persistent **JUMP TO → Department submissions** shortcut on every local page. It opens the current cycle's existing departmental folder tree and preserves canonical submission identities. Semantic local-navigation icons distinguish libraries, lists/registers, pages, calendars, Teams, archives and protected areas. English remains the default; the small ENG / DE control translates the new hub, Wiki, Portal and access copy without changing routes or source records.

The installed Figma SharePoint Web UI Kit was inspected for navigation hierarchy and proportions only, without copying assets or editing the kit.

## Boundaries and handoffs

- Audience defines segment, journey, automation hypothesis and measurement; Content develops messages/creative; Digital engineers automation/integration; Audience evaluates results.
- Content's Digital Content & Experience area owns requirements and acceptance. Code, deployment, runtime operation, engineering repositories and external technical collaboration live in Digital. The scoped technical partner preview is `/digital-tech/web-crm/partner-review`.
- People & Culture owns workforce/organisation design, leadership, inclusion, learning, all-staff meetings, intranet/wiki publishing, opt-in communities, wellbeing and organisation-wide reward/employment frameworks. Employment & Hiring Administration owns recruitment administration, candidate workflow handoffs and controlled employment operations. Individual candidate/personnel/contract/change/payroll/absence records remain protected. Digital owns HR-platform engineering, APIs, authentication and integrations. Staff Service Operations owns physical event logistics, rooms, equipment, travel and reception. Welfare & Employee Representation owns confidential welfare/support, safeguarding, complaints and employee-representation work; People retains organisation-wide wellbeing programmes.
- Staff Service Operations owns sourcing; Legal reviews contracts/privacy; Finance owns payment/accounting; Quality handles systemic process improvement. Staff Service Operations has no IT, hiring, legal or project library and no system wall.
- Customer Care owns interaction quality, coaching, calibration and recovery. Quality owns organisation-wide methods, monitoring and process redesign.
- Archives owns retention, appraisal and preservation decisions. Digital implements storage, metadata, migration and access controls against those requirements. Archive catalogue and legacy-drive records are view-only.

Five reusable handoff examples are stored in the registry. Specialist tools open the shared high-level external preview; they do not clone CRM/candidate/accounting/archive/Git datasets. Fictional Teralink belongs to IT/service support, PeopleHarbour to HR and recruitment, and Relovia is the same CRM across Sales and finance. Canonical vendor identities and local logos come from `src/environments/catalog.ts`; legacy tool IDs remain durable aliases. M365 technical work belongs to `/digital-tech/m365`. Company Git is a fictional GitHub Enterprise destination with synthetic repository/PR/issue/release references. Technical Innovators and AI Lab conversations use `/teams?staff=devon&workspace=digital&channel=AI+Lab`.

## Controlled work

Protected subjects contain boundary labels only, with no underlying sensitive payloads. Ordinary demo personas are denied access to employee records/contracts/cases, candidate assessments, private staff-network membership, privileged legal matters, security/production technology, restricted historical collections and existing financial/executive subjects. Search, recent work, calendars and Teams use permitted canonical working objects. Unit coordination privacy remains visually distinct from these business confidentiality boundaries.

Executive roles remain independent. `/governance` and all its child URLs retain compatibility through the shared **Members Portal** external preview. `/emergency-response` remains a separate **STRICTLY CONFIDENTIAL · DEMO PREVIEW** with incident-specific private channels, participants, files, actions, timeline, decisions and read-only closure. `/welfare-representation` is strictly confidential, with separate Welfare & Psychosocial Support, Safeguarding & Complaints and Employee Representation areas. Riley Quinn (Staff Welfare Coordinator) cannot read independent representative deliberation; Skyler Lane (Independent Employee Representative) cannot read welfare or safeguarding working methods. Approved non-identifiable consultation outputs can cross that boundary. Legacy `/employee-council` URLs redirect to the independent Employee Representation area; there is one current representation environment and no individual case dossiers. Staff-community public information includes purpose/open events/joining routes, never membership lists or private posts.

All edits, review notes, status changes and simulation approvals are browser-local and reset on reload. Archive search/filtering, retention-status review and transfer stages are local demonstrations, not an approved real retention policy.

## Legacy navigation

Old routes remain useful redirects where practical:

| Old route                                               | Owning destination                                 |
| ------------------------------------------------------- | -------------------------------------------------- |
| `/employee-council` and child routes                    | `/welfare-representation/employee-representation`  |
| `/workspace-publishing` and child routes                 | Tech & Digital Architecture & Decisions, or the Workspace & Wiki Moderators channel for old Teams links |
| `/services/technology`                                  | `/digital-tech`                                    |
| `/services/projects`                                    | `/projects`                                        |
| `/services/legal`                                       | `/legal-compliance`                                |
| `/services/hiring`                                      | `/employment-admin/recruitment-administration`     |
| `/services/resources`                                   | `/services`                                        |
| `/services/workplace`                                   | `/services/office`                                 |
| `/services/procurement`                                 | `/services/purchasing`                             |
| Services Freshservice / M365 / recruitment system links | Digital operations / M365 / Employment recruitment |
| `/content-delivery/tools/github` and `/datadog`         | Digital-owned system previews                      |
| `/content-delivery/packages/PKG-105/shared`             | Scoped Digital technical collaboration             |

Legacy legal, hiring, technology, purchasing and visitor matters stay behind an appropriate protected boundary when redirected. The earlier planning, audience and content route prefixes remain stable. Internal source identifiers such as the logistics library id `resources` remain for compatibility; those are not displayed as information-architecture labels.

## Deployment

Existing GitHub repository: `lh20202/workspace-prototype`, branch `main`.

Existing Render static service: `workspace-prototype` (`srv-db7sdaom7kps73cml6sg`).

- Build: `npm ci && npm run build`
- Publish: `dist`
- Node: `24.19.0`
- SPA rewrite: all routes to `/index.html`
- Live: https://workspace-prototype.onrender.com/

Do not create another service. `render.yaml` preserves this configuration. A push triggers deployment; validate the actual published application, direct refreshes and browser console. Render may briefly cache older HTML.

## Projects and department coordination

`/projects` is the single Project Centre workspace destination in `/architecture`. Formal identifiers use `PRJ-YYYY-NNN` consistently. Home links eight current project workspaces; Current Projects navigation is collapsed by default. Central `/projects/control`, `/projects/support` and `/projects/reviews` own project oversight, active support and stage reviews, moved out of Quality. Quality develops process improvement needs and evaluates outcomes; formal project delivery is coordinated in Projects. Old Services project and Quality change routes redirect here.

Each `/projects/PRJ-2026-014`-style route has a common plan, sparse canonical working documents, decision/action logs, risks/issues and delivery/handover. `/teams` under that route uses the same project documents. Engineering, workforce and other substantive work remain in their functional owners, linked from the project. Executive escalation and financial forecast handoffs use references.

Open Internal and Restricted project membership follows the selected fictional persona. Maya can open the chatbot pilot; Sam can open financial close; archive migration is narrower. Denied projects expose only safe titles and an existing Service Desk request with project/person context. Requests use the existing Teralink request simulation and stay browser-local; submitting does not grant access. Open projects can have separately protected technical subjects. Central control/reviews are limited to Robin and Casey; support also includes selected project contributors.

`/projects/archive` groups completed projects into 2024–2026, 2022–2025, 2020–2023 and Earlier Projects. `/projects/archive/PRJ-2024-018` is read-only and can link selected final records to Company Archives, which retains formal appraisal, retention and preservation ownership.

The right rail is **Department Teams**: MCG Department, CPA Department, FCS Department, STT Department, PAC Department, EAO Department. All use the same Department identity and open the route-scoped General Staff department preview. Workspace-derived and project Teams use stable colour variants of the common WorkspaceIcon, Company Updates uses `/images/company-mark.png`, and Emergency Response keeps its separate identity. Units remain beneath departments. Department Assistants retain MODERATOR replies and contextual redirects to functional workspaces. Organisation-wide / Department-only and Department-wide / Unit-only access are preserved. New links use `department=mcg` etc.; old `division=` links still resolve. Functional workspaces keep their business names.

Inactive intranet navigation is disabled; the fictional-content notice belongs to the external reveal controls. Finance Home no longer displays Handoffs & exceptions.

## Design and interaction model

`/` is a sparse three-choice Welcome page: Organisational Planning & Reporting, Acquisition & Activation Logistics, and **Explore all workspaces & wikis · BETA TEST**. The reference-choice titles remain familiar; their destinations use the shorter Planning Cycle and Acquisition Logistics site names. `/architecture` presents the four functional bands, distinct Wiki/Portal environments, protected Personnel links, Admin logins and the separate Department Teams rail. Existing functional routes remain stable.

Organisational Planning & Reporting is the SharePoint interaction reference. Ordinary document work uses a small number of libraries with real folders, subfolders and original files. Homes surface current work, selected recent files and specific tasks. Structured Lists remain for projects, research/production tracking, financial checklists, actions, risks and retention. Pages are retained for published information; archive discovery, operational calendars and incident response are deliberate exceptions. Git, CRM, HR and finance platforms remain authoritative.

`src/sharepoint/DocumentLibrary.tsx` shares command bars, shallow browsing, breadcrumbs, search, configured saved views, status filtering, sorting, selection, file preview, Details and Version history. Original file IDs are preserved across SharePoint and Teams. New, Upload and property changes are browser-local simulations; closed archives omit edit controls. Folder/file query links restore on refresh. Protected content is filtered or denied before entering a library.

The visual pass follows [Fluent typography](https://fluent2.microsoft.design/typography), [spacing](https://fluent2.microsoft.design/layout), [elevation](https://fluent2.microsoft.design/elevation/), [motion](https://fluent2.microsoft.design/motion) and [accessibility](https://fluent2.microsoft.design/accessibility), alongside [modern SharePoint libraries](https://learn.microsoft.com/en-us/sharepoint/dev/solution-guidance/modern-experience-customizations-customize-lists-and-libraries) and [document-library web parts](https://support.microsoft.com/en-us/sharepoint/web-parts-and-apps-in-sharepoint/use-the-document-library-web-part). Inter organisational typography with Segoe product chrome, a four-pixel spacing rhythm, restrained weights, neutral separators and short hover/focus transitions replace tiny density rules and repeated dashboard treatments. There is no page-wide CSS zoom or scale transform; reduced motion is supported.

## Product fidelity

The shared `src/teams/TeamsShell.tsx` provides compact desktop chrome, search, account, app rail, chat/channel navigation, selected/unread states and channel tabs. Department, technical, Acquisition, project and private incident conversations use this shell while retaining their own access and working-file logic. Posts, replies, reactions and composers remain local simulations. Shared uses the existing SharePoint-backed file identities; Department documents retain their guarded unit structure. Only Planning Cycle, Acquisition Logistics, Creative Studio and Tech & Digital have functional Teams connections. Department Teams, active project teams and private Emergency Response use the same shell independently. Central Projects, Audience, Customer Care, Finance, Services, Quality, Legal, People, Employment, Executive and Archives have no generic Teams feed. Staff whose main workspace has no Team start in their own Department; obsolete functional Teams links return to the owning SharePoint page, preserving known public file identity and folder context.

The external navigation sits outside product surfaces: **← Welcome** returns to `/`; **All workspaces** opens `/architecture`; role previews and the language toggle are demo controls. The strip normally collapses to a thin top edge and handle. Inactive intranet navigation is visibly greyed and disabled, while Digital Workspaces remains selected. Product content retains Inter and Microsoft chrome retains Segoe. Four pale hub bands use generous separation, neutral workspace rows and a consistent environment icon; locks remain separate access states. There is no fixed Teams footer or compressed all-items-on-one-screen rule. SharePoint retains the red brand, compact site header, restrained command bars, 44px document rows and a nonmodal Details pane.

Visual references were current Microsoft screenshots and examples in [the new Teams chat/channel experience](https://support.microsoft.com/en-au/teams/teams-channels/explore-the-new-chat-and-channels-experience-in-microsoft-teams), [accessible navigation](https://support.microsoft.com/en-us/accessibility/teams/use-a-screen-reader-to-navigate-and-explore-the-new-chats-and-channels-experience-in-microsoft-teams), [channel tabs](https://support.microsoft.com/en-us/teams/teams-channels/use-a-tab-in-a-channel-or-chat-in-microsoft-teams), [file collaboration](https://support.microsoft.com/en-us/teams/files/collaborate-on-files-in-microsoft-teams), [channel activity](https://support.microsoft.com/en-us/teams/teams-channels/catch-up-on-channel-messages-in-microsoft-teams), and SharePoint team-site/library/Details examples. The deliberate visual direction and rendered iteration borrow the design method described in [Anthropic’s frontend-design guidance](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md), while retaining Microsoft product typography and density.

## SharePoint IA and staff-aware Teams

Pass 2 replaces generic default-library architecture with configured business libraries, useful metadata/content types/views, related working sets and intentional Homes. [Implementation and navigation](docs/sharepoint-ia-pass-2.md) and [development content audit](docs/content-audit.md) document the final model and research references.

Teams uses one staff-membership policy across all shells. Nine roles are selectable, grouped into General / Business and Specialist / Admin: General Staff Member (Taylor Brooks), Sales & Marketing Specialist (Nadia Stein), Frontline Sales Adviser (Maya Chen), Finance Operations Specialist (Sam Patel), Executive Director (Robin Avery), Personnel Administrator (Jamie Ellis), Technology & Engineering Administrator (Devon Park), Information Advisory Specialist (Leonie Fischer) and Site Administrator (Elliot Stone). Company channels remain available; unrelated workspaces, private channels and projects are not shown merely because a role can read a SharePoint workspace. Operational channels and direct URLs use the same explicit membership policy. Protected business-record access remains independent. SharePoint and Teams Shared use the same canonical file IDs and library definitions.

Leonie joins her STT Department Team and exactly three Tech & Digital channels: Workspace & Wiki Moderators, M365 & SPFx, and Architecture & Governance. Her normal internal SharePoint visibility does not grant CEO, personnel, welfare, representation, protected financial, project or incident access. She is an advisory participant, not a global administrator. The removed Information Manager superuser view has not returned.

The former Workspace, Intranet & Wiki Coordination workspace and Team are retired. Its seven existing files now occur once in Tech & Digital’s Architecture & Decisions library. The durable **Workspace & Wiki Moderators** channel carries moderation, publishing, metadata and findability coordination; it creates no new site or library. Legacy `/workspace-publishing` links redirect to the owning Tech & Digital library or channel, preserving useful role and file context.

## Architecture and typography

The four planned remediation passes retain the two reference prototypes and existing library interactions. Employment & Hiring Administration is separate from People & Culture; Content Creation & Delivery is now **Creative Studio**. The final audit covers ownership/search, deliberate Teams availability, proof-of-concept language, rendered visual quality and protected routes. See [Pass 4 audit](docs/pass-4-audit.md). This is an interactive proof of concept, not production-ready software.

Employment has two process-coordination libraries, Recruitment Administration and Employment Operations, plus protected Employment Records & Contracts and subject boundaries. The whole workspace is signposted as strictly confidential. Welfare/support, complaints and employee-relations case boundaries now belong to Welfare & Employee Representation; legacy Employment links resolve to those protected areas. Greenhouse and Workday HCM are simulated authoritative-system handoffs; no individual candidate dossiers, contracts, salaries, absence reasons, health information or case records are seeded. Employment fixtures are defined directly under their owner, rather than seeded under People and moved at runtime. People search, Home, recent files and library views contain no hiring/personnel administration. Legacy People/Services administration links and original file IDs resolve to the new owner; protected aliases resolve to existing Employment boundaries. Jamie Ellis is the Employment Operations Coordinator preview. People & Culture retains organisation-wide programmes, learning, communications, networks, events, aggregate analysis and framework design.

Creative Studio is the shared production space where channel teams and topic specialists plan, create, review and release public-facing work. It retains `/content-delivery`, canonical production file IDs, selective metadata/content types, scoped agency collaboration and Digital engineering handoffs. Four libraries separate current production, editorial/messaging, creative/multimedia and published/final outputs. Seven enduring channel desks—Editorial Desk, Web Desk, Social Desk, Media Desk, Publications & Email, Video & Visuals, Production Coordination—share the common Teams shell. Topic desks are Cities & Mobility, Education & Skills, Digital Society and Arts & Culture. Rapid Coverage · Major Transport Disruption and Special Coverage · City Innovation Summit are active; Campaign · Future Skills Week is archived and read-only. Web/Social/Media have more conversation, Publications & Email starts in Shared, and Video & Visuals emphasises delivery handoffs. Final files remain in SharePoint. Staff membership limits visible desks/coverage; there is no all-channel administrator persona.

Inter Variable is bundled through `@fontsource-variable/inter`, including optical-size/weight axes and its package licence. It is the organisational SharePoint/site-content font, with restrained 400/500/600 weights and tabular numerals where useful. Microsoft product chrome and the nested Teams Fluent theme retain Segoe/system typography. No external font CDN or manually copied font assets are used.

The installed **SharePoint Web UI Kit (Community), v3** was accessible in Figma Desktop and actively inspected during Passes 3 and 4 as a visual calibration reference: team-site composition, site-header/navigation proportions, aligned 32px section insets/gaps, Document Library and List web parts, and Quick Links. The kit was not edited or made an application dependency. Current Microsoft guidance on [SharePoint design](https://learn.microsoft.com/en-us/sharepoint/dev/design/design-guidance-overview), [web-part composition](https://learn.microsoft.com/sv-se/sharepoint/dev/design/key-web-part-examples), [font packages](https://learn.microsoft.com/en-us/sharepoint/brand-center-font-packages) and [modern team sites](https://support.microsoft.com/en-us/sharepoint/sites-in-sharepoint/what-is-a-sharepoint-team-site) informed the foundation. The Swedish-hosted web-part article supplies the same English design guidance because the en-us endpoint did not fetch during review.

Redundant Home/navigation shortcuts in Projects, Logistics, Planning and Finance were removed; meaningful document, system, Teams and cross-workspace handoffs remain. The directory removes repeated workspace suffixes/SharePoint logos and uses one icon, one name and a restrained action cue. The proof-of-concept launcher, menu/Architecture controls, Planning structure, Department Teams, access requests and file-library behaviours remain intact.

## Targeted post-Pass-4 close-out

The four-pass remediation remains complete; this is a targeted close-out, not a fifth architecture pass. [Close-out notes](docs/targeted-closeout.md) cover the restrained external preview caveats, focal-point-first access, studio changes and shared Teams Home panels.

`src/access/model.ts` defines business focal points. Every denied area offers a local contact panel first. Only the secondary urgent link opens Service Desk, with workspace/area/location/requester/focal-point/reason context. Service Desk routes business authorisation and implements/escalates access; it does not decide entitlement. Existing nonurgent ticket links now lead to the business-contact flow. No message, ticket or real permission change is sent.

`TeamsHomePanel` supplies one consistent top-aligned right-rail pattern in Acquisition Logistics, Tech & Digital and the Studio, with a Teams icon beside each channel. Other shortcuts follow it. The original Planning structure is retained. `public/images/company-mark.png` is an original generated fictional navy/teal organisation mark; SharePoint, Teams and file product identities are unchanged. The image-generation prompt and provenance are recorded in the close-out notes.

## Display language

A small ENG / DE toggle sits at the top-right of Welcome and inside the auto-hiding demo controls. English is the default for each new browser session; a deliberate language choice lasts for that session and applies to product navigation, labels, accessible descriptions, business content, dates and representative document titles. German copy is bundled, with no external translation service. Canonical IDs, URLs, filter values and user-entered drafts remain stable.


## Workspace FAQ, human moderation and technical accuracy

The same accessible **Workspace FAQ** dialog opens from Welcome and beside **All workspaces · BETA** in the outer demo controls. Its Teams example uses an ordinary explicit Preview Role URL and a stable post identifier, rather than a second example page. The existing Ari/Devon/Leonie conversation shows that the recipient already has access through the correct workspace folder: move the working file, share its canonical link and remove the old attachment. OneDrive appears only as neutral provider attribution in that historical example. No automatic detection, policy-error banner or bot is simulated; OneDrive is omitted from the pinned app rail, not portrayed as removed from Microsoft 365.

The implementation deliberately assumes no general client-side pre-send interception hook for ordinary Teams messages. Microsoft’s [link-unfurling documentation](https://learn.microsoft.com/en-us/microsoftteams/platform/messaging-extensions/how-to/link-unfurling) describes registered-domain previews and says to register domains the app controls; this is not used as a generic OneDrive governance mechanism. An appropriately consented Teams app/agent can [receive channel messages after posting](https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/conversations/channel-messages-with-rsc), but the Graph [chatMessage softDelete operation](https://learn.microsoft.com/en-us/graph/api/chatmessage-softdelete?view=graph-rest-1.0) supports delegated channel/chat permissions and explicitly does not support application permissions. Arbitrary application deletion of other users’ posts is not assumed.

[Purview DLP for Teams](https://learn.microsoft.com/en-us/purview/dlp-microsoft-teams) is a separate configurable compliance mechanism with policy tips. [Custom sensitive information types](https://learn.microsoft.com/en-us/microsoft-365/compliance/create-a-custom-sensitive-information-type) can use regular expressions; a personal-OneDrive-versus-workspace rule would require deliberate policy/configuration and is not an assumed native Teams capability. This proof of concept demonstrates trained human focal-point moderation instead.

## File sensitivity and delegated site administration

Every canonical synthetic file has one shared `SensitivityLabel`: **Public**, **Internal**, **Confidential** or **Strictly confidential**. Internal is the normal default; narrower labels follow actual document context and protected subjects. Public is reserved for the rare approved public-facing Sales output. Classification is separate from lifecycle/status and from access policy: a label badge does not grant access. Libraries, Details panes, recent/search cards and SharePoint-backed Teams attachments read the same canonical value. German translates display labels only.

This mirrors SharePoint’s [Sensitivity column for integrated sensitivity labels](https://learn.microsoft.com/en-us/purview/sensitivity-labels-sharepoint-onedrive-files). A real [library default label](https://learn.microsoft.com/en-us/purview/sensitivity-labels-sharepoint-default-label) is a location-based baseline with Microsoft-documented prerequisites and timing; the demo does not implement live Purview enforcement or automatically scan document contents.

**Site Administrator** demonstrates delegated site information, membership, contents, navigation, library/metadata settings and workspace maintenance through the existing Settings gear. It is neither a tenant/global administrator nor a business-data superuser. CEO pre-decision material, individual personnel records, welfare/safeguarding cases, privileged legal material, restricted finance and unrelated project/incident content still require independent business entitlement. Its Teams navigation is limited to Company Updates, STT Department and M365 & SPFx, Architecture & Governance and Workspace & Wiki Moderators.

**Sales & Marketing Specialist** has the normal internal Sales workspace/Wiki experience and selected Creative Studio channels, without every desk or frontline operational channel. **Finance Operations Specialist** has normal finance working information and Company Updates/FCS Department; no artificial functional Finance Team is created. Highly sensitive payroll, bank mandates/signatories and banking security are not automatically granted.
