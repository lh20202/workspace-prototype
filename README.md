# Digital workspace design — Microsoft 365 proof of concept

An interactive React/TypeScript/Vite proof of concept for a SharePoint intranet, functional workspaces and selected Teams experiences. `/` presents two detailed reference proofs of concept and the **Full Architecture Proof of Concept** with a restrained **Beta** build label. The formal architecture remains exploratory; the label describes the interactive build, not product maturity. All people, work items, records and platform choices are fictional. No backend, real authentication, external messages or authoritative business transactions are implemented.

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

| Workspace                             | Route                   | Primary work                                                                                                                   |
| ------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Organisational Planning & Reporting   | `/planning`             | Organisation-wide strategy, plans and approved reporting                                                                       |
| Acquisition & Activation Logistics    | `/logistics`            | Deployment, staffing, rotas, locations and operational logistics                                                               |
| Audience Research & Marketing Insight | `/audience-innovation`  | Research, journeys, analytics, experiments and automation ideation                                                             |
| Creative & Editorial Studio           | `/content-delivery`     | Editorial, creative, content packages, requirements and acceptance                                                             |
| Customer Care & Relations             | `/customer-relations`   | Care, relationships, accounts, partnerships and interaction quality                                                            |
| Income & Financial Operations         | `/financial-operations` | Income, reconciliation, settlement, accounting, FP&A and treasury                                                              |
| Organisation Services                 | `/services`             | Office Maintenance & Equipment, Purchasing & Suppliers, Travel Services, Reception only                                        |
| Quality, Monitoring & Improvement     | `/quality-monitoring`   | Cross-company monitoring, process redesign, improvement and Eco Practice                                                       |
| Digital & Technology                  | `/digital-tech`         | Engineering, Web & CRM, business systems, AI, M365, information architecture and operations                                    |
| Legal, Privacy & Compliance           | `/legal-compliance`     | Advice, privacy, compliance, assurance and controlled legal matters                                                            |
| People & Culture                      | `/people-culture`       | Workforce, leadership, culture, inclusion, learning, internal communications, wellbeing and organisation-wide framework design |
| Employment & Hiring Administration    | `/employment-admin`     | Shared recruitment/employment process coordination, with strictly protected candidate/personnel records and system handoffs    |
| CEO & Executive Committee             | `/executive`            | Executive coordination, restricted decisions, liaison and strategic initiatives                                                |
| Projects                              | `/projects`             | Formal project control, active support, reviews and separate project delivery workspaces                                       |
| Company Archives                      | `/archives`             | Historical discovery, retention, appraisal, transfer, description and preservation                                             |

Department Teams is a separate organisational layer. The six departments and 33 unit structures remain intact in the intranet rail and `/teams?staff=maya&department=mcg&tab=Posts`. Channels can be Organisation-wide or Department-only; unit folders can be Department-wide or Unit-only. Persona membership filters posts, files, search and availability views. Local administration stays here; contextual MODERATOR replies link misplaced business work to its functional owner. The full architecture intranet at `/architecture` keeps quiet workspace tiles, Department Teams and a compact Teams preview utility row with its staff selector. The restrained external preview controls contain ← All workspaces, Architecture, a language toggle and one fictional-content caveat; Teams adds its staff selector.

## Boundaries and handoffs

- Audience defines segment, journey, automation hypothesis and measurement; Content develops messages/creative; Digital engineers automation/integration; Audience evaluates results.
- Content's Digital Content & Experience area owns requirements and acceptance. Code, deployment, runtime operation, engineering repositories and external technical collaboration live in Digital. The scoped technical partner preview is `/digital-tech/web-crm/partner-review`.
- People & Culture owns workforce/organisation design, leadership, inclusion, learning, all-staff meetings, intranet/wiki publishing, opt-in communities, wellbeing and organisation-wide reward/employment frameworks. Employment & Hiring Administration owns recruitment administration, candidate workflow handoffs and controlled employment operations. Individual candidate/personnel/contract/change/payroll/absence records remain protected. Digital owns HR-platform engineering, APIs, authentication and integrations. Services owns physical event logistics, rooms, equipment, travel and reception.
- Services owns sourcing; Legal reviews contracts/privacy; Finance owns payment/accounting; Quality handles systemic process improvement. Services has no IT, hiring, legal or project library and no system wall.
- Customer Care owns interaction quality, coaching, calibration and recovery. Quality owns organisation-wide methods, monitoring and process redesign.
- Archives owns retention, appraisal and preservation decisions. Digital implements storage, metadata, migration and access controls against those requirements. Archive catalogue and legacy-drive records are view-only.

Five reusable handoff examples are stored in the registry. Specialist tools open lightweight contextual simulations; they do not clone CRM/candidate/accounting/archive/Git datasets. Freshservice belongs to `/digital-tech/operations`, Greenhouse to `/employment-admin/recruitment-administration` and Workday HCM to `/employment-admin/employment-operations`, and M365 technical work to `/digital-tech/m365`. Company Git is a fictional GitHub Enterprise destination with synthetic repository/PR/issue/release references. Technical Innovators and AI Lab conversations use `/teams?staff=devon&workspace=digital&channel=AI+Lab`.

## Controlled work

Protected subjects contain boundary labels only, with no underlying sensitive payloads. Ordinary demo personas are denied access to employee records/contracts/cases, candidate assessments, private staff-network membership, privileged legal matters, security/production technology, restricted historical collections and existing financial/executive subjects. Search, recent work, calendars and Teams use permitted canonical working objects. Unit coordination privacy remains visually distinct from these business confidentiality boundaries.

Executive roles remain independent. `/governance` retains its separate Committee/Member previews. `/emergency-response` remains a separate **STRICTLY CONFIDENTIAL · DEMO PREVIEW** with incident-specific private channels, participants, files, actions, timeline, decisions and read-only closure. `/employee-council` is an independent controlled boundary; no council deliberations are merged into People & Culture. Staff-community public information includes purpose/open events/joining routes, never membership lists or private posts.

All edits, review notes, status changes and simulation approvals are browser-local and reset on reload. Archive search/filtering, retention-status review and transfer stages are local demonstrations, not an approved real retention policy.

## Legacy navigation

Old routes remain useful redirects where practical:

| Old route                                               | Owning destination                                 |
| ------------------------------------------------------- | -------------------------------------------------- |
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

`/projects` is the single Projects tile in `/architecture`. Formal identifiers use `PRJ-YYYY-NNN` consistently. Home links eight current project workspaces; Current Projects navigation is collapsed by default. Central `/projects/control`, `/projects/support` and `/projects/reviews` own project oversight, active support and stage reviews, moved out of Quality. Quality develops process improvement needs and evaluates outcomes; formal project delivery is coordinated in Projects. Old Services project and Quality change routes redirect here.

Each `/projects/PRJ-2026-014`-style route has a common plan, sparse canonical working documents, decision/action logs, risks/issues and delivery/handover. `/teams` under that route uses the same project documents. Engineering, workforce and other substantive work remain in their functional owners, linked from the project. Executive escalation and financial forecast handoffs use references.

Open Internal and Restricted project membership follows the selected fictional persona. Maya can open the chatbot pilot; Sam can open financial close; archive migration is narrower. Denied projects expose only safe titles and an existing Service Desk request with project/person context. Requests use the existing Jira-like simulation and stay browser-local; submitting does not grant access. Open projects can have separately protected technical subjects. Central control/reviews are limited to Robin and Casey; support also includes selected project contributors.

`/projects/archive` groups completed projects into 2024–2026, 2022–2025, 2020–2023 and Earlier Projects. `/projects/archive/PRJ-2024-018` is read-only and can link selected final records to Company Archives, which retains formal appraisal, retention and preservation ownership.

The right rail is **Department Teams**: MCG Department, CPA Department, FCS Department, STT Department, PAC Department, EAO Department. All use the same team icon and open Teams directly. Units remain beneath departments. Department Assistants retain MODERATOR replies and contextual redirects to functional workspaces. Organisation-wide / Department-only and Department-wide / Unit-only access are preserved. New links use `department=mcg` etc.; old `division=` links still resolve. Functional workspaces keep their business names.

The intranet’s illustrative navigation uses anchored popovers; tile category eyebrows are removed; fictional examples have a highlighted caveat. Finance Home no longer displays Handoffs & exceptions.

## Design and interaction model

`/` is a sparse three-choice launcher: Organisational Planning & Reporting, Acquisition & Activation Logistics, and **Full Architecture Proof of Concept · EXPLORATORY**. `/architecture` preserves the complete 15-workspace directory, Department Teams, staff previews and Teams CTA. Existing functional routes still work.

Organisational Planning & Reporting is the SharePoint interaction reference. Ordinary document work uses a small number of libraries with real folders, subfolders and original files. Homes surface current work, selected recent files and specific tasks. Structured Lists remain for projects, research/production tracking, financial checklists, actions, risks and retention. Pages are retained for published information; archive discovery, operational calendars and incident response are deliberate exceptions. Git, CRM, HR and finance platforms remain authoritative.

`src/sharepoint/DocumentLibrary.tsx` shares command bars, shallow browsing, breadcrumbs, search, configured saved views, status filtering, sorting, selection, file preview, Details and Version history. Original file IDs are preserved across SharePoint and Teams. New, Upload and property changes are browser-local simulations; closed archives omit edit controls. Folder/file query links restore on refresh. Protected content is filtered or denied before entering a library.

The visual pass follows [Fluent typography](https://fluent2.microsoft.design/typography), [spacing](https://fluent2.microsoft.design/layout), [elevation](https://fluent2.microsoft.design/elevation/), [motion](https://fluent2.microsoft.design/motion) and [accessibility](https://fluent2.microsoft.design/accessibility), alongside [modern SharePoint libraries](https://learn.microsoft.com/en-us/sharepoint/dev/solution-guidance/modern-experience-customizations-customize-lists-and-libraries) and [document-library web parts](https://support.microsoft.com/en-us/sharepoint/web-parts-and-apps-in-sharepoint/use-the-document-library-web-part). Inter organisational typography with Segoe product chrome, a four-pixel spacing rhythm, restrained weights, neutral separators and short hover/focus transitions replace tiny density rules and repeated dashboard treatments. There is no page-wide CSS zoom or scale transform; reduced motion is supported.

## Product fidelity

The shared `src/teams/TeamsShell.tsx` provides compact desktop chrome, search, account, app rail, chat/channel navigation, selected/unread states and channel tabs. Department, technical, Acquisition, project and private incident conversations use this shell while retaining their own access and working-file logic. Posts, replies, reactions and composers remain local simulations. Shared uses the existing SharePoint-backed file identities; Department documents retain their guarded unit structure. Only Planning, Acquisition & Activation Logistics, Creative & Editorial Studio and Digital & Technology have functional Teams connections. Department Teams, active project teams and private Emergency Response use the same shell independently. Central Projects, Audience, Customer Care, Finance, Services, Quality, Legal, People, Employment, Executive and Archives have no generic Teams feed. Staff whose main workspace has no Team start in their own Department; obsolete functional Teams links return to the owning SharePoint page, preserving known public file identity and folder context.

The external navigation sits outside product surfaces: **← All workspaces** returns to `/`; **Architecture** opens `/architecture`; persona/role previews are external test controls. Inactive intranet navigation is visibly greyed and disabled, while Digital Workspaces remains selected. All notes use restrained standard typography; product content retains Inter and Microsoft chrome retains Segoe. The architecture directory uses readable 14px titles and a compact short-laptop layout for all 15 workspaces. SharePoint uses the same red brand, compact site header, restrained command bars, 44px document rows and a nonmodal Details pane. Normal scrolling preserves readable content; the utility row does not cover the last directory entries.

Visual references were current Microsoft screenshots and examples in [the new Teams chat/channel experience](https://support.microsoft.com/en-au/teams/teams-channels/explore-the-new-chat-and-channels-experience-in-microsoft-teams), [accessible navigation](https://support.microsoft.com/en-us/accessibility/teams/use-a-screen-reader-to-navigate-and-explore-the-new-chats-and-channels-experience-in-microsoft-teams), [channel tabs](https://support.microsoft.com/en-us/teams/teams-channels/use-a-tab-in-a-channel-or-chat-in-microsoft-teams), [file collaboration](https://support.microsoft.com/en-us/teams/files/collaborate-on-files-in-microsoft-teams), [channel activity](https://support.microsoft.com/en-us/teams/teams-channels/catch-up-on-channel-messages-in-microsoft-teams), and SharePoint team-site/library/Details examples. The deliberate visual direction and rendered iteration borrow the design method described in [Anthropic’s frontend-design guidance](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md), while retaining Microsoft product typography and density.

## SharePoint IA and staff-aware Teams

Pass 2 replaces generic default-library architecture with configured business libraries, useful metadata/content types/views, related working sets and intentional Homes. [Implementation and navigation](docs/sharepoint-ia-pass-2.md) and [development content audit](docs/content-audit.md) document the final model and research references.

Teams uses one staff-membership policy across all shells. Company channels remain available; unrelated workspaces, private channels and projects are not shown to ordinary staff. The Information Manager preview and its broad channel/admin bypass have been removed. Operational channels are selected per staff role; direct URLs use the same policy. Protected business-record access remains independent. SharePoint and Teams Shared use the same canonical file IDs and library definitions.

## Architecture and typography

The four planned remediation passes retain the two reference prototypes and existing library interactions. Employment & Hiring Administration is separate from People & Culture; Content Creation & Delivery is now **Creative & Editorial Studio**. The final audit covers ownership/search, deliberate Teams availability, proof-of-concept language, rendered visual quality and protected routes. See [Pass 4 audit](docs/pass-4-audit.md). This is an interactive proof of concept, not production-ready software.

Employment has two ordinary collaboration libraries, Recruitment Administration and Employment Operations, plus strictly confidential Employment Records & Contracts and protected subject boundaries. Greenhouse and Workday HCM are simulated authoritative-system handoffs; no individual candidate dossiers, contracts, salaries, absence reasons, health information or case records are seeded. Employment fixtures are defined directly under their owner, rather than seeded under People and moved at runtime. People search, Home, recent files and library views contain no hiring/personnel administration. Legacy People/Services administration links and original file IDs resolve to the new owner; protected aliases resolve to existing Employment boundaries. Jamie Ellis is the Employment Operations Coordinator preview. People & Culture retains organisation-wide programmes, learning, communications, networks, events, aggregate analysis and framework design.

Creative & Editorial Studio is the shared production space where channel teams and topic specialists plan, create, review and release public-facing work. It retains `/content-delivery`, canonical production file IDs, selective metadata/content types, scoped agency collaboration and Digital engineering handoffs. Four libraries separate current production, editorial/messaging, creative/multimedia and published/final outputs. Seven enduring channel desks—Editorial Desk, Web Desk, Social Desk, Media Desk, Publications & Email, Video & Visuals, Production Coordination—share the common Teams shell. Topic desks are Cities & Mobility, Education & Skills, Digital Society and Arts & Culture. Rapid Coverage · Major Transport Disruption and Special Coverage · City Innovation Summit are active; Campaign · Future Skills Week is archived and read-only. Web/Social/Media have more conversation, Publications & Email starts in Shared, and Video & Visuals emphasises delivery handoffs. Final files remain in SharePoint. Staff membership limits visible desks/coverage; there is no all-channel administrator persona.

Inter Variable is bundled through `@fontsource-variable/inter`, including optical-size/weight axes and its package licence. It is the organisational SharePoint/site-content font, with restrained 400/500/600 weights and tabular numerals where useful. Microsoft product chrome and the nested Teams Fluent theme retain Segoe/system typography. No external font CDN or manually copied font assets are used.

The installed **SharePoint Web UI Kit (Community), v3** was accessible in Figma Desktop and actively inspected during Passes 3 and 4 as a visual calibration reference: team-site composition, site-header/navigation proportions, aligned 32px section insets/gaps, Document Library and List web parts, and Quick Links. The kit was not edited or made an application dependency. Current Microsoft guidance on [SharePoint design](https://learn.microsoft.com/en-us/sharepoint/dev/design/design-guidance-overview), [web-part composition](https://learn.microsoft.com/sv-se/sharepoint/dev/design/key-web-part-examples), [font packages](https://learn.microsoft.com/en-us/sharepoint/brand-center-font-packages) and [modern team sites](https://support.microsoft.com/en-us/sharepoint/sites-in-sharepoint/what-is-a-sharepoint-team-site) informed the foundation. The Swedish-hosted web-part article supplies the same English design guidance because the en-us endpoint did not fetch during review.

Redundant Home/navigation shortcuts in Projects, Logistics, Planning and Finance were removed; meaningful document, system, Teams and cross-workspace handoffs remain. The directory removes repeated workspace suffixes/SharePoint logos and uses one icon, one name and a restrained action cue. The proof-of-concept launcher, menu/Architecture controls, Planning structure, Department Teams, access requests and file-library behaviours remain intact.

## Targeted post-Pass-4 close-out

The four-pass remediation remains complete; this is a targeted close-out, not a fifth architecture pass. [Close-out notes](docs/targeted-closeout.md) cover the restrained external preview caveats, focal-point-first access, studio changes and shared Teams Home panels.

`src/access/model.ts` defines business focal points. Every denied area offers a local contact panel first. Only the secondary urgent link opens Service Desk, with workspace/area/location/requester/focal-point/reason context. Service Desk routes business authorisation and implements/escalates access; it does not decide entitlement. Existing nonurgent ticket links now lead to the business-contact flow. No message, ticket or real permission change is sent.

`TeamsHomePanel` supplies one consistent top-aligned right-rail pattern in Logistics, Digital & Technology and the Studio, with a Teams icon beside each channel. Other shortcuts follow it. The original Planning structure is retained. `public/images/company-mark.png` is an original generated fictional navy/teal organisation mark; SharePoint, Teams and file product identities are unchanged. The image-generation prompt and provenance are recorded in the close-out notes.

## Display language

A small ENG / DE toggle sits at the top-right of the launcher and navigation banner. English is the default for each new browser session; a deliberate language choice lasts for that session and applies to product navigation, labels, accessible descriptions, business content, dates and representative document titles. German copy is bundled, with no external translation service. Canonical IDs, URLs, filter values and user-entered drafts remain stable.
