# Digital Workspaces prototype

A local React/TypeScript/Vite prototype of a SharePoint intranet, functional workspaces and connected Teams views. All people, work items, records and platform choices are fictional. No backend, real authentication, external messages or authoritative business transactions are implemented.

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

`src/workspaces/registry.ts` is the canonical registry: names, routes, purposes, Teams availability, access models, legacy redirects, cross-workspace handoffs and 16 explicit primary-destination examples. Existing specialised applications retain their working behaviour; the new areas share the established Fluent UI/SharePoint shell through `FunctionalApp`.

| Workspace | Route | Primary work |
| --- | --- | --- |
| Organisational Planning & Reporting | `/planning` | Organisation-wide strategy, plans and approved reporting |
| Acquisition & Activation Logistics | `/logistics` | Deployment, staffing, rotas, locations and operational logistics |
| Audience Research & Marketing Insight | `/audience-innovation` | Research, journeys, analytics, experiments and automation ideation |
| Content Creation & Delivery | `/content-delivery` | Editorial, creative, content packages, requirements and acceptance |
| Customer Care & Relations | `/customer-relations` | Care, relationships, accounts, partnerships and interaction quality |
| Income & Financial Operations | `/financial-operations` | Income, reconciliation, settlement, accounting, FP&A and treasury |
| Organisation Services | `/services` | Office Maintenance & Equipment, Purchasing & Suppliers, Travel Services, Reception only |
| Quality, Monitoring & Improvement | `/quality-monitoring` | Cross-company monitoring, process redesign, change support and Eco Practice |
| Digital & Technology | `/digital-tech` | Engineering, Web & CRM, business systems, AI, M365, information architecture and operations |
| Legal, Privacy & Compliance | `/legal-compliance` | Advice, privacy, compliance, assurance and controlled legal matters |
| People & Culture | `/people-culture` | Hiring, workforce, capability, employment, internal communications and staff communities |
| CEO & Executive Committee | `/executive` | Executive coordination, restricted decisions, liaison and strategic initiatives |
| Company Archives | `/archives` | Historical discovery, retention, appraisal, transfer, description and preservation |

Division & team coordination is a separate organisational layer. The six divisions and 33 unit structures remain intact in the intranet rail and `/teams?staff=maya&division=marketing-growth&tab=Posts`. Channels can be Organisation-wide or Division-only; unit folders can be Division-wide or Unit-only. Persona membership filters posts, files, search and availability views. Local administration stays here; contextual MODERATOR replies link misplaced business work to its canonical functional owner. The intranet keeps the compact tile treatment, fixed Teams CTA and staff selector. The external dark banner contains only Back to all workspaces and the existing caveat.

## Boundaries and handoffs

- Audience defines segment, journey, automation hypothesis and measurement; Content develops messages/creative; Digital engineers automation/integration; Audience evaluates results.
- Content's Digital Content & Experience area owns requirements and acceptance. Code, deployment, runtime operation, engineering repositories and external technical collaboration live in Digital. The scoped technical partner preview is `/digital-tech/web-crm/partner-review`.
- People owns hiring, employment processes, all-staff meetings, intranet/wiki publishing, opt-in communities and company-event programmes. Digital owns People-platform configuration/APIs. Services owns physical event logistics, rooms, equipment, travel and reception.
- Services owns sourcing; Legal reviews contracts/privacy; Finance owns payment/accounting; Quality handles systemic process improvement. Services has no IT, hiring, legal or project library and no system wall.
- Customer Care owns interaction quality, coaching, calibration and recovery. Quality owns organisation-wide methods, monitoring and process redesign.
- Archives owns retention, appraisal and preservation decisions. Digital implements storage, metadata, migration and access controls against those requirements. Archive catalogue and legacy-drive records are view-only.

Five reusable handoff examples are stored in the registry. Specialist tools open lightweight contextual simulations; they do not clone CRM/candidate/accounting/archive/Git datasets. Freshservice belongs to `/digital-tech/operations`, Greenhouse to `/people-culture/hiring`, and M365 technical work to `/digital-tech/m365`. Company Git is a fictional GitHub Enterprise destination with synthetic repository/PR/issue/release references. Technical Innovators and AI Lab conversations use `/teams?staff=devon&workspace=digital&channel=AI+Lab`.

## Controlled work

Protected subjects contain boundary labels only, with no underlying sensitive payloads. Ordinary demo personas are denied access to employee records/contracts/cases, candidate assessments, private staff-network membership, privileged legal matters, security/production technology, restricted historical collections and existing financial/executive subjects. Search, recent work, calendars and Teams use permitted canonical working objects. Unit coordination privacy remains visually distinct from these business confidentiality boundaries.

Executive roles remain independent. `/governance` retains its separate Committee/Member previews. `/emergency-response` remains a separate **STRICTLY CONFIDENTIAL · DEMO PREVIEW** with incident-specific private channels, participants, files, actions, timeline, decisions and read-only closure. `/employee-council` is an independent controlled boundary; no council deliberations are merged into People & Culture. Staff-community public information includes purpose/open events/joining routes, never membership lists or private posts.

All edits, review notes, status changes and simulation approvals are browser-local and reset on reload. Archive search/filtering, retention-status review and transfer stages are local demonstrations, not an approved real retention policy.

## Legacy navigation

Old routes remain useful redirects where practical:

| Old route | Owning destination |
| --- | --- |
| `/services/technology` | `/digital-tech` |
| `/services/projects` | `/quality-monitoring/improvement` |
| `/services/legal` | `/legal-compliance` |
| `/services/hiring` | `/people-culture/hiring` |
| `/services/resources` | `/services` |
| `/services/workplace` | `/services/office` |
| `/services/procurement` | `/services/purchasing` |
| Services Freshservice / M365 / recruitment system links | Digital operations / M365 / People hiring |
| `/content-delivery/tools/github` and `/datadog` | Digital-owned system previews |
| `/content-delivery/packages/PKG-105/shared` | Scoped Digital technical collaboration |

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
