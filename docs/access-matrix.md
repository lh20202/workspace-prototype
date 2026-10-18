# Preview role access

This is a fictional browser demonstration, with nine selectable preview roles. The entitlement source is `src/access/policy.ts`; canonical ordinary and protected area IDs are in `src/access/areaDefinitions.ts`. The independent controlled-resource expectations and integrity checks are in `src/access/controlledResources.ts` and `src/access/integrity.test.ts`.

**Demo User** is the default exploratory Preview Role in English and German. Its explanation is: “Explore the ordinary workspace experience. Restricted content still follows access rules.” The canonical role ID remains `taylor`, so existing role routes and remembered session selections keep working. This display rename grants no protected business content, specialist permissions or site administration.

The complete resource-by-resource review, exact specialist grants, deliberate exclusions and verification method are recorded in [Access matrix integrity](access-matrix-integrity-qa.md). The workspace and channel model is recorded in [Workspace discoverability](workspace-discoverability-qa.md).

## Ordinary exploration and genuine restrictions

Every valid preview role can explore all ordinary internal workspace Homes, normal libraries, lists, calendars, ordinary channels, Wiki guidance and external-environment previews. Participation controls personal relevance rather than ordinary exploration.

Whole-workspace restrictions remain on CEO, Personnel, and Welfare. Protected subjects inside ordinary workspaces retain their own checks. Unknown workspaces, subjects, private channels, projects and unit IDs fail closed. The retired governance destination is an external preview, not a business-content entitlement.

## Role purpose

| Preview role | Controlled work demonstrated | Deliberate limits |
| --- | --- | --- |
| Demo User / Taylor | Own department and authorised unit coordination | No protected business subjects or specialist administration |
| Frontline Sales Adviser / Maya | Own operational unit, Logistics channels, Wiki and portal | No internal marketing specialist grants, customer cases or participant data |
| Sales & Marketing Specialist / Nadia | Controlled commercial proposal and account negotiation | No participant data, private customer cases, embargo or pre-release handling |
| Finance Operations Specialist / Sam | Eleven selected Finance reviews, including aggregate workforce cost; assigned Financial Close project and channels | No individual payroll, banking mandates/security, signing authority or executive-only scenarios |
| Executive Director / Robin | Executive work and initiatives, restricted Planning, portfolio oversight and selected pre-decision financial scenarios | No blanket personnel, banking, technical-secret or private-channel access |
| Personnel Administrator / Jamie | Eight relevant hiring/employment subjects, support methods and approved non-identifiable consultation outputs | No safeguarding, independent representation, individual payroll/compensation or health/placement records |
| Technology & Engineering Administrator / Devon | Five protected technical operations/security subjects, private Security Engineering and security review for three assigned technical projects | No credentials, privileged-account records or delegated site administration |
| Information Advisory Specialist / Leonie | Delegated site/library/list administration and information architecture | Administration grants no protected business-content entitlement |
| Site Administrator / Elliot | Equivalent delegated site/library/list administration | No business-data superuser access |

Specialist grants are explicit and narrower than all protected work. Some controlled functions have no appropriate selectable identity; each has a reviewed outside-preview rationale. Those destinations never suggest switching roles as a way to gain access.

## Channel navigation and role switching

Demo User enters global Channels with Company Updates only: Important updates, Bulletin, Office news, Pet photos, Learning & Development and Staff socials, followed by the prominent role-discovery helper. Other global views remain curated from daily channel participation and genuine project/incident assignments.

A deliberate Department, Workspace, Project or Incident entry takes precedence over global personalisation. The URL carries `context=department:<id>`, `workspace:<id>`, `project:<id>` or `incident:<id>`. The sidebar shows Company Updates plus that selected environment. Context does not confer private-channel, unit, restricted-project or incident entitlement.

Changing Preview Role preserves the deliberate environment and reapplies exact access. The visible global channel-view action clears contextual scope and restores the selected role's daily view. Home channel panels use canonical workspace capabilities, independent of pinning.

## Exact role-switch assistance

`allowedPreviewRoles(resource)` and `hasAlternativePreviewAccess(resource, currentId)` evaluate the precise denied destination. A parent workspace or project grant never advertises access to a protected child that remains denied. The controlled-resource tests check orphaned definitions, stale IDs, unintended universal access, specialist denials and role-switch alternatives against independent expectations.

No role is omniscient. This demonstration changes no real sign-in, company system, membership or production permission.
