# Workspace discoverability and contextual channels

This is an exploratory Digital Workspace proof of concept. Ordinary exploration, personal channel navigation, protected access and specialist administration now have separate rules.

- Live URL: https://workspace-prototype.onrender.com/architecture
- Release commit and deployment-specific live browser results are recorded in the final handover accompanying this change.
- Hosting remains the existing Render service, `srv-db7sdaom7kps73cml6sg`, tracking GitHub `main`.

## Discoverability and protection

General Staff can explore all 13 ordinary internal workspace Homes and their ordinary libraries, lists, calendars, file features and relationships: Planning Cycle, Project Centre, Quality & Monitoring, Legal & Risk, Purchasing & Office, Company Archives, People & Culture, Income & Financial Operations, Acquisition Logistics, Customer Relations, Research & Insight, Creative Studio and Tech & Digital. Ordinary Wiki areas, including Insight & Performance, and the Frontline Crew Portal demonstration are available to every valid preview role. These capabilities no longer disappear because a role lacks normal participation.

The canonical registry retains exactly three whole workspace restrictions:

| Workspace                          | Genuine participation retained                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Executive & CEO                    | Executive Director; individual executive areas remain separately scoped                                                  |
| Employment & Hiring Administration | Personnel Administrator; individual records and hiring subjects remain separately scoped                                 |
| Welfare & Employee Representation  | Personnel Administrator for its authorised subjects; safeguarding and independent representation are not broadly granted |

Protected children remain controlled: Restricted Planning; employee and candidate records; safeguarding; privileged legal work and investigations; financial authorisations, bank/payment data and security; participant administration and raw research; embargoed, pre-release and rights-restricted material; technical credentials, privileged access, production security and recovery; restricted tenders, visitor arrangements, historical records and network membership. Safe destination labels may be visible with a lock, without revealing protected files or conversation snippets. The separate legacy governance environment retains its controlled boundary.

Open Internal projects are explorable without adding membership. Restricted projects remain **PRJ-2026-027 Company Archive Migration**, **PRJ-2026-038 Financial Close Improvement** and **PRJ-2026-045 Supplier Onboarding Redesign**. Incident entitlement and actual Department/unit membership remain genuine controls.

## Global channel navigation

General Staff entering Channels globally sees **Company Updates only**, containing Important updates, Bulletin, Office news, Pet photos, Learning & Development and Staff socials. The helper appears in the left navigation after that environment, outside the simulated channel groups:

- Heading as displayed: “See a role based channel view”
- Supporting text: “Choose a preview role to see the department, workspace and project channels that would normally appear here.”
- Action: “Choose a preview role”

It reuses the current prominent restricted-page Preview Role panel, filled action button, selector reveal/focus/highlight interaction and reduced-motion behaviour. It explains personalisation rather than claiming access is denied. Other roles retain curated global views based on their original daily channels, Department, assigned projects and authorised incidents. Ordinary access never adds every available environment to that sidebar.

## Entry context and routing

| Deliberate entry   | Channel sidebar                                                     | Access treatment                                                                            |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Department         | Company Updates plus the selected Department only                   | Ordinary General content opens for every role; foreign unit/private material is not granted |
| Workspace          | Company Updates plus that workspace and its canonical channels only | Ordinary unpinned channels open; private Security Engineering remains controlled            |
| Individual project | Company Updates plus that project only                              | Open Internal channels open; restricted project membership remains required                 |
| Incident           | Company Updates plus the selected authorised incident               | Context does not grant incident entitlement                                                 |
| Global Channels    | Selected role's curated daily view                                  | Deliberate contextual scope is cleared                                                      |

Context is explicit, reload-safe query state: `context=department:communications`, `context=workspace:content`, `context=project:PRJ-2026-014` or `context=incident:INC-104`. The selected `staff` remains unchanged on entry. Department context additionally carries the existing Department route value; workspace routes carry `workspace`, with Logistics retaining its existing `/logistics/teams` route. Global selections carry `context=global` when necessary to prevent a selected conversation from being mistaken for a fresh contextual entry. A bare global `/teams?staff=<id>` uses the role's default landing.

Existing explicit workspace, Department and project bookmarks resolve deterministically to the corresponding context. Selecting a different environment replaces that context. Role switching preserves deliberate Department/workspace/project/incident context and reapplies genuine protected access. A canonical unit destination in Department Shared retains its unit, folder and section so that switching roles changes access at that exact destination. File and post selections clear; invalid unit state is discarded. Explicit global entry restores the new role's curated channel view. Browser history and referrer are not used as access or context inputs.

## Channel-enabled workspaces

The registry's four channel-enabled ordinary workspaces are **Planning Cycle, Acquisition Logistics, Creative Studio and Tech & Digital**. Each retains its header channel affordance and a lightweight canonical Home panel under every preview role. Ordinary channel access is separate from pinning. Private channels retain their actual membership checks.

Planning always demonstrates Planning & Reporting and its shared planning files; Restricted Planning remains protected. Tech & Digital always demonstrates technical coordination, with a controlled Security Engineering destination. Acquisition Logistics always demonstrates operational coordination, including for roles outside frontline work. Individual active projects demonstrate General, Project Delivery and Decisions & Actions on their own Homes; Project Centre does not become one giant channel environment. Archived project Homes remain read-only records views, while existing direct archived channel routes retain their archived context.

## Creative Studio

Home remains sparse: Active production, Recent production files, Production Calendar and the compact **Live studio coordination** rail are retained. Its semantic groups are:

| Home group        | Canonical channels shown                                                               |
| ----------------- | -------------------------------------------------------------------------------------- |
| Channel desks     | Editorial Desk, Web Desk, Video & Visuals, Production Coordination                     |
| Topic specialists | Cities & Mobility, Education & Skills, Digital Society, Arts & Culture                 |
| Current coverage  | Rapid Coverage · Major Transport Disruption; Special Coverage · City Innovation Summit |

“Open all studio channels” opens the complete Creative Studio context. The complete canonical desk set is Production Coordination, Editorial Desk, Web Desk, Social Desk, Media Desk, Publications & Email and Video & Visuals. The four topics are real channels with the same names and IDs in Home and Channels. Campaign · Future Skills Week remains archived and read-only, outside current Home coverage.

Each topic has one short root post and one reply, using ordinary fictional colleagues rather than additional preview roles:

- **Cities & Mobility:** Mira Kline clarifies that transport disruption is temporary; Alex Morgan adapts the opening and sends public copy through Production Coordination.
- **Education & Skills:** Felix Ward asks for learning outcomes before session details; Rory Bell adapts email/social copy while retaining one shared reviewed script.
- **Digital Society:** Sana Malik separates service eligibility from registration instructions; Inez Hart revises content order and headings before review.
- **Arts & Culture:** Leo Moreno clarifies print-only image rights and credits; Alex Morgan preserves those credits and flags the separate digital rights check.

Posts link to existing workspace files and actual desk handoffs. Home and Channels share canonical definitions; semantic kind, lifecycle and featured-desk metadata replace arbitrary `.slice(...)` visibility. No Home-only channel registry or duplicate channel IDs were introduced.

## Administration and security

Original `workspaceMemberships`, daily `teamChannels`, occasional collaboration, project and incident memberships remain intact. Separate helpers answer ordinary opening, channel pinning, genuine restricted channel access and project pinning. The General Staff default channel landing changes to Company Updates without changing Department or memberships.

The subsequent [access-matrix integrity pass](access-matrix-integrity-qa.md) adds the reviewed specialist business grants, Sam's Financial Close project participation and exact assigned-project security reviews. Its current matrix supersedes earlier specialist grant counts, while preserving the ordinary discovery and contextual navigation described here.

Site Administrator and Information Advisory Specialist retain equivalent delegated site/library/list administration. Technology & Engineering Administrator does not become Site Administrator. Administrative metadata and settings still use the canonical access-filtered model; they cannot grant protected business access. No protected business fixture or membership was broadened to make an ordinary Home work.

## Verification evidence

Root manually completed the General Staff journey without changing Preview Role: Welcome, All workspaces and hubs, all 13 ordinary Homes, Wiki and Frontline Crew Portal, plus Studio library search, document preview, register and calendar. Root also checked Creative Studio Home under all nine roles at 100% zoom.

Root manually exercised the requested contextual journeys: General Staff global Company Updates/helper; all six Architecture Department entries; Studio to its channels; Studio context retained after switching to Finance; explicit global entry restoring Finance's view; Tech & Digital ordinary channels with Security protected; Sales role entering Planning & Reporting; Executive role selecting another Department without unrelated groups; and a restricted project remaining denied without entitlement. Additional checks covered ordinary project and Logistics conversations, incident denial, all three whole restricted workspaces, Restricted Planning, equal advisory/admin settings, and the technology role's ordinary settings. The role action revealed and focused the highlighted selector on desktop and mobile.

Automated evidence includes all nine roles against the canonical ordinary workspace registry and protected subject matrix; all ordinary channels versus private Security; Open Internal versus restricted projects; all six Department contexts and genuine unit boundaries; four channel-enabled Home panels under all nine roles; global curated groups; contextual focus; role switching/reset; and canonical Studio topic identities, lifecycle and conversations. Targeted policy, Wiki, publishing and OneDrive checks passed **44 tests** during implementation. Existing protection assertions were retained or replaced with equivalent checks for the intended access contract, including no private Security conversation leakage.

- Full checks passed: `npm run lint`, `npm run typecheck`, `npm test` (**738 tests across 83 files**) and `npm run build`. The build retains a bundle-size advisory.
- User-facing generic terminology and accessible copy review passed. Rendered topic text and accessible labels contain no Teams, SharePoint, Microsoft or M365 wording. Canonical IDs, URLs and developer documentation retain their technical identities; rendered copy uses Channels, Workspace and Site. OneDrive remains the deliberate exception.
- German semantic QA was completed after English implementation was final. Browser review covered Home groups, all four topic exchanges and handoffs, contextual Department navigation, the global helper and focused role selector, protected Security Engineering and the Project Home panel. A narrow file-cue translation preserves canonical file extensions. The 790px German Studio view retained all topic links with no horizontal overflow; the 390px global channel drawer kept the prominent role action readable.
- Actual release commit, live deployment verification and live browser results are reported in the final handover after publication.

`$polish-website` was not used. Access, conversations, file management and administration remain fictional browser-based demonstrations; no real company systems or permissions are changed. This handover does not claim production readiness.
