# Site consistency review — 18 October 2026

Completed against the current working tree, starting at `a67ee91`. Changes are local and uncommitted. Nothing was pushed, deployed or published, and no external forms or messages were submitted.

## Presentation refinements

- Removed North’s lone “Workspaces” subheading. All four architecture panels now use the same heading rhythm.
- Aligned the tools sections within the North/East and West/South pairs. Preserved the existing equal-height pairs, smaller lower row, colours, icons and content order.
- Kept South’s compact labels and red workspace icons. Added descriptive tooltips and accessible names for income, payments, value and treasury, including German translations.
- Added a keyboard skip link to the architecture page.
- Made Edu and Workforce headings, browser titles and local navigation reflect the section being visited. Removed the adjacent duplicate content headings. Their shared parent is presented as “Workforce & Edu”; the existing site, libraries and records remain shared.
- Made the Council entrance retain its name in the header, browser title, area label and contact presentation. Its independent contact remains Skyler Lane.
- Restored the requested full stop in “Dev.” across displayed names, cross-links, channel references, project descriptions, administration and German copy.
- Standardised Local Crew Portal capitalisation alongside Global Crew Portal and Membership Portal. Corrected the old Personnel label in the workspace switcher.
- Updated residual Lab, Relations, Acquisitions and Dev. references in Wiki guidance and related handoff text, including the corresponding German passages.
- Used British “favourites” consistently. Replaced the shared header’s Acquisitions-specific notification message with neutral demo wording.
- Carried the current display names into support and access-contact views. Corrected the support-page back label when its destination is the architecture page.

## Integrity retained

Canonical role IDs, workspace IDs, routes, file IDs, library contents, classifications and memberships are unchanged. Demo User remains the default exploratory role. Restricted content, administration and specialist permissions continue to follow the existing rules.

Historical access-request names remain resolvable, including `Dev` and `Local crew portal`. The Council contact lookup recognises the new display name without changing authorisation.

“People & Culture” remains where it identifies the actual PAC department or an internal canonical source identity. It no longer appears as the Edu workspace header. Detailed business-area and document names remain where they explain the work rather than name a workspace.

## Review and validation

Reviewed source labels and shared presentation components across the site, then inspected 48 distinct local route/state combinations. Coverage included:

- Welcome, architecture and every workspace entrance.
- Planning, Acquisitions, Lab, Studio, Relations, Services, Quality, Dev., Legal, Workforce, Edu, Projects and Archives.
- All four South entrances, financial calendars, operational rotas, working lists, libraries, folders and a document preview.
- CEO, Personnel and Welfare in both permitted and denied preview states; Council’s protected entrance; open and restricted project examples.
- Wiki, local/global crew portals, Membership Portal, Media Library and Metriva.
- Department and technical channels, Demo User help, restricted-page role discovery, Workspace FAQ, support pages and site settings.

Checked architecture at desktop width (1280), tablet width (820, German), and phone width (390). Checked Edu on a phone and in German. No page-level horizontal overflow was found in the recorded route observations. Library tables retain their own horizontal scrolling where needed.

At desktop width, North and East each measure 349 px high; West and South each measure 258 px. The tools sections align within both pairs. Temporary viewport overrides were reset.

Final checks:

- **922 tests passed across 87 files.**
- TypeScript check passed.
- Lint passed.
- Production build passed.
- Diff whitespace check passed.
- No console errors or warnings were observed during the final production-preview checks.

The initial suite contained four failing tests left behind by earlier naming/layout changes. Those expectations were updated, and regression coverage now checks contextual Edu/Workforce titles, duplicate headings, Council presentation and legacy access-request names.

The build reports a bundle-size advisory for chunks above 500 kB. Bundle restructuring was left outside this presentation pass. Browser review sampled deeper content and interactions; it did not manually open every document or submit every form. The existing automated access and route suites provide broader coverage.

## Review material

- Local production preview: <http://127.0.0.1:5181/architecture?staff=taylor>
- Architecture screenshot: `/private/tmp/workspace-polish-2026-10-18/architecture.png`
- Edu screenshot: `/private/tmp/workspace-polish-2026-10-18/edu.png`
- Recorded browser observations: `/private/tmp/workspace-polish-2026-10-18/browser-review.json`

The preview is bound to this computer only. The hosted site has not been changed by this pass.
