# Targeted post-Pass-4 close-out

This change preserves the completed four remediation passes. It does not reopen the architecture or introduce a fifth pass.

## Restrained preview caveats

The preview controls sit outside the simulated Microsoft product with a single subdued fictional-content caveat. Notes use normal product-compatible typography and concise, muted copy. There are no stickers, marker fonts, construction colours, rotations or decorative shadows. The full phrase **proof of concept** replaces the rejected acronym and homepage prototype terminology. A small Beta label describes build state.

The architecture backdrop has four disabled, greyed navigation items and selected Digital Workspaces. Business sensitivity, private-channel and access warnings retain native product styling.

## Teams membership and language

The Information Manager persona, all-channel bypass and structural administrator view are removed. Explicit staff/channel membership governs every Teams entry, sidebar, Home link and direct URL. Company channels and Logistics General remain available to everyone; operational, functional, department and project channels follow role-specific participation.

A standard English/Deutsch toggle uses bundled professional German copy and persists the selection locally. It translates display text and accessible labels without changing canonical routes, IDs, native option values or underlying records. User-entered text stays as entered. No translation service receives page content.

## Access model

Every existing denial surface leads with **Contact focal point**, opening a local contact/message preparation panel. It does not send a message or create a ticket. Central contact configuration reuses fictional staff; when the requester is the primary focal point, the existing department coordinator acts as alternate.

**Raise urgent access request** is secondary and opens the existing Service Desk with request type, workspace, area, location, requester, focal point and urgent-reason scaffold. Service Desk routes for business authorisation and implements/escalates access. Legacy ordinary access-ticket URLs now show the focal-point workflow. Original permission guards and protected data remain in force.

## Creative & Editorial Studio

The visible workspace name is **Creative & Editorial Studio**, with `/content-delivery` and canonical file IDs retained. Its purpose is: “Shared production space where channel teams and topic specialists plan, create, review and release public-facing work.”

- Channel desks: Editorial Desk; Web Desk; Social Desk; Media Desk; Publications & Email; Video & Visuals; Production Coordination.
- Topic desks: Cities & Mobility; Education & Skills; Digital Society; Arts & Culture.
- Active temporary coverage: Special Coverage · City Innovation Summit; Rapid Coverage · Major Transport Disruption.
- Archived/read-only: Campaign · Future Skills Week.

Web/Social/Media are conversation-led. Publications & Email defaults to Shared with existing SharePoint files. Video & Visuals centres on delivery handoffs. Existing participant scopes and legacy bookmark aliases remain; obsolete subjects are not visible content.

## Home layout and organisation mark

`TeamsHomePanel` supplies a consistent top-aligned 260px right rail within the 1204px content width, with 32px grid gap and local Teams identity beside every channel row. Logistics, Digital & Technology and the Studio use it; Digital places Teams before other shortcuts. Planning remains the layout reference.

The original fictional organisation asset is `public/images/company-mark.png`. It replaces the blue-square site mark and appears in the intranet identity. SharePoint, Teams and file product logos remain intact.

### Image-generation provenance

Generated with the built-in image generation tool, transparent background enabled, then copied without image modification to `public/images/company-mark.png`. No external organisation asset was reused. Exact final prompt:

> Use case: logo-brand. Asset type: company-mark.png, an original fictional organisation symbol used at 32–56px in professional enterprise site headers. Create ONE simple polished abstract connection/bridge/ribbon mark, no letters or text. Two interlocking broad flowing bands form a balanced compact bridge-like connection with clear negative space. Deep navy #102A43 and teal #008A91, with one restrained pale teal #9ADAD8 accent. Flat solid fills, crisp vector-like edges, understated geometry, highly legible at small sizes. Center the symbol tightly with a modest transparent margin, square composition. Genuinely transparent background. No words, no alphabet-like monogram, no Microsoft squares, no real company resemblance, no gradient, no shadow, no mockup, no badge/frame. This is a clean organisation identity asset, not a warning/test label.

## Validation

Lint, type checking, all 316 tests in 23 files, and the production build pass. The automated checks cover restrained caveats, disabled intranet navigation, launcher build label, focal-first access and alternate contacts, urgent prefill, safe local return links, Studio naming/coverage/visibility, canonical files, per-channel Teams logos, and the PNG asset. Rendered checks cover the launcher, architecture, four representative Homes, chat/file-led Studio channels, denial/contact and urgent escalation at 100% zoom. The launcher and architecture were also checked at 390px width, with all tiles also fitting at 1433×612; the mobile Beta label remains in normal title flow. Release validation and live checks are recorded in the delivery handover.

## Limits

This remains an exploratory Microsoft 365 architecture proof of concept. Messages, tickets, approvals, permissions and specialist-system connections are local simulations, with no production back end or real entitlement changes.
