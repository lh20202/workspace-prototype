# Preview access matrix integrity

This audit covers the current canonical controlled-resource definitions. It separates ordinary exploration, personalised navigation, protected business access and delegated administration. It describes a fictional proof of concept, not production authorisation.

## Coverage and method

`src/access/controlledResources.ts` enumerates **164 resources** and independently states the expected authorised preview identities and business rationale for each. `src/access/integrity.test.ts` checks **all nine roles against all 164 resources: 1,476 access decisions**. Expected roles are not generated from the role's current grants. A separate canonical library/list sweep checks **42 settings contexts across all nine roles: 378 additional context decisions**.

| Category                                | Canonical resources | Demonstrable/contextual | Explicitly outside preview scope |
| --------------------------------------- | ------------------: | ----------------------: | -------------------------------: |
| Whole confidential workspaces           |                   3 |                       3 |                                0 |
| Protected areas/subjects                |                  74 |                      40 |                               34 |
| Strategic initiative rows               |                   5 |                       5 |                                0 |
| Private technical channel               |                   1 |                       1 |                                0 |
| Restricted project workspaces           |                   3 |                       2 |                                1 |
| Restricted project channel environments |                   3 |                       2 |                                1 |
| Project production security reviews     |                  18 |                       3 |                               15 |
| Explicit department General contexts    |                   6 |                       6 |                                0 |
| Department/unit coordination            |                  33 |                      22 |                               11 |
| Incident responses                      |                   3 |                       3 |                                0 |
| Delegated site and Wiki administration  |                  14 |                      14 |                                0 |
| Retired external governance boundary    |                   1 |                       0 |                                1 |
| **Total**                               |             **164** |                 **101** |                           **63** |

Department General context is intentionally common, not confidential. Unit coordination uses actual department/unit membership. Delegated administration is a capability, not protected business-content entitlement. Counts below therefore include contextual, coordination and administrative resources as well as restricted business resources.

| Preview role                                   | ALLOW | DENY |
| ---------------------------------------------- | ----: | ---: |
| Demo User / Taylor                  |    11 |  153 |
| Frontline Sales Adviser / Maya                 |    11 |  153 |
| Executive Director / Robin                     |    32 |  132 |
| Personnel Administrator / Jamie                |    23 |  141 |
| Technology & Engineering Administrator / Devon |    22 |  142 |
| Information Advisory Specialist / Leonie       |    26 |  138 |
| Sales & Marketing Specialist / Nadia           |    13 |  151 |
| Finance Operations Specialist / Sam            |    23 |  141 |
| Site Administrator / Elliot                    |    26 |  138 |

## Exact protected-business ALLOW lists

For each role, **all protected business resources not listed here are DENY**. The independent inventory contains the exact resource IDs, canonical routes and the same expectation for each individual resource. Ordinary internal content and department contexts are covered separately below.

- **Taylor and Maya:** no protected business subjects, confidential whole workspaces, private technical channels, restricted projects or incidents.
- **Robin:** Executive & CEO workspace; executive `home`, `coordination`, `leadership`, `oversight`, `initiatives`, `decisions`, `calendar`; strategic initiatives `SI-01` through `SI-05`; Planning `restricted`; Project Centre `control` and `reviews`; Finance `restructuring-cost` and `pre-decision`; project workspaces `PRJ-2026-027` and `PRJ-2026-038`; project channels for `PRJ-2026-027`; incidents `INC-104` and `INC-099`. Executive oversight does not imply participation in every project channel.
- **Jamie:** Employment & Hiring Administration and Welfare & Employee Representation workspaces; Employment `candidate-applications`, `candidate-assessments`, `references`, `offers`, `employee-records`, `employment-changes`, `employee-master-data`, `absence-administration`; Welfare `welfare-support` and `approved-consultation`; incident `INC-107`. Safeguarding, independent representation, individual payroll/compensation and health/placement circumstances remain excluded.
- **Devon:** Digital `security`, `production`, `recovery`, `vulnerabilities`, `restricted-web`; the private `Security Engineering` channel; incident `INC-104`; project production security reviews for assigned technical projects `PRJ-2026-014`, `PRJ-2026-042` and archived `PRJ-2020-006`. These reviews concern release/security acceptance and recovery readiness, not secrets or privileged records. Privileged-access records and credentials are excluded. This role has no delegated site-administration capability.
- **Nadia:** Studio `commercial-proposal` and Client & Customer Relations `commercial-account`. Participant data, customer cases, premium stewardship, pre-release briefings and embargoed distribution remain excluded.
- **Sam:** the 11 Finance subjects below, plus the Financial Close Improvement project `PRJ-2026-038` and its channel environment. High-risk banking, individual payroll and executive-only scenarios remain excluded.
- **Leonie and Elliot:** no protected business subjects, confidential whole workspaces, private technical channels, restricted projects or incidents. Both have the same delegated site/library/list administration capabilities for ordinary sites they can access.

## Finance: all 23 canonical subjects

| Area       | ALLOW Sam                                                                                                                                                                                                   | ALLOW Robin                                                                                          | DENY every preview role, intentionally outside scope                                                                                                                                             |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Income     | Customer Payment Exceptions (`payment-exceptions`); Refund & Chargeback Review (`refund-chargeback`); High-Value Payment Review (`high-value-payment`); Payment Data Correction (`payment-data-correction`) | None                                                                                                 | None                                                                                                                                                                                             |
| Payments   | Disputed Supplier Payment (`disputed-supplier-payment`)                                                                                                                                                     | None                                                                                                 | Payroll Settlement (`payroll-settlement`); Employee Reimbursements, Sensitive Cases (`employee-reimbursements`); Exceptional Payment Authorisation (`exceptional-authorisation`)                 |
| Planning   | Draft Management Forecast (`draft-scenarios`); **Workforce Cost Scenario (`workforce-cost`)**; Investment Affordability Review (`investment-affordability`)                                                 | Restructuring Cost Scenario (`restructuring-cost`); Pre-Decision Financial Scenario (`pre-decision`) | None                                                                                                                                                                                             |
| Accounting | External Audit Working Papers (`external-audit`); Pre-Issue Financial Statements (`pre-issue-statements`)                                                                                                   | None                                                                                                 | Tax Working Papers (`tax-working-papers`); Unresolved Accounting Investigation (`accounting-investigation`); Sensitive Accounting Adjustment (`sensitive-adjustment`)                            |
| Treasury   | Liquidity Stress Scenario (`liquidity-stress`)                                                                                                                                                              | None                                                                                                 | Bank Account & Mandate Administration (`bank-mandates`); Authorised Signatories (`signatories`); Transfer Authorisation (`transfer-authorisation`); Banking Security Review (`banking-security`) |

No other role receives any of these Finance subjects. Sam's 11 grants span Income, Payments, Planning, Accounting and Treasury. Workforce cost is aggregate scenario work; it does not grant employee-level payroll access.

## Coordination and administration

All nine roles can deliberately enter the General channel of each of the six departments. This is route-scoped exploration and does not change membership or reveal foreign unit files.

Department-wide unit coordination follows these actual departments: Taylor, Maya and Nadia belong to MCG; Sam to FCS; Devon, Leonie and Elliot to STT; Jamie to PAC; Robin to EAO. No selectable role belongs to CPA. A unit marked `Unit-only` additionally requires the exact real unit assignment. Among the current unit-only definitions, Jamie can open People Operations and Robin can open CEO Office. Other unit-only destinations remain excluded when no matching preview participant exists. The complete 33-unit decision set is checked programmatically.

The 11 unit destinations with no represented participant are MCG Strategic Accounts and Income Administration; all five CPA units; FCS Treasury & Payments and Legal & Assurance; PAC Reward & Employment and People Systems & Analytics. Their General department context still opens ordinarily.

Leonie and Elliot can administer all 13 ordinary internal workspaces and the Sales & Marketing Wiki. The additional settings sweep enumerates all 42 actual library/list contexts in these 14 environments, resolves each context's real library/list identity, and checks its menu options against all nine roles. Delegated capability does not make a protected route accessible and does not confer business-data membership. Every protected business destination and an unknown suffix under every workspace are checked for administration bypass. Other roles, including Devon, do not receive that capability.

## Deliberate outside-preview scope

These are explicit scope decisions, not missing grants. No role-switch action is appropriate for these exact resources because no selectable role can open them.

| Subject category                  | Canonical IDs excluded from every preview role                                                                               | Reason                                                                                                                                                                                             |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Procurement and sensitive visits  | Services `live-tender`, `negotiation`, `visitor-arrangements`                                                                | No procurement or confidential-visit participant is represented.                                                                                                                                   |
| Secrets and privileged records    | Digital `privileged-access`, `credentials`                                                                                   | Technical operations is separate from specific privileged-record/secrets authorisation.                                                                                                            |
| Privileged legal cases            | Legal `privileged`, `disputes`, `privacy-incidents`, `investigations`, `formal-cases`, `sensitive-risk`                      | No authorised legal/case participant is represented.                                                                                                                                               |
| Private staff networks            | People `network-membership`                                                                                                  | A personnel administrator is not automatically a member of private networks.                                                                                                                       |
| Individual employment specialisms | Employment `payroll-inputs`, `placement`, `compensation`                                                                     | Individual payroll, health/placement and compensation need separate authorisation.                                                                                                                 |
| Personal customer work            | Customer `platinum`, `customer-cases`                                                                                        | No assigned premium steward or individual-case participant is represented.                                                                                                                         |
| Restricted historical records     | Archives `historical`                                                                                                        | No authorised archive researcher or records custodian is represented.                                                                                                                              |
| Independent welfare functions     | Welfare `safeguarding-complaints`, `employee-representation`                                                                 | Safeguarding and independent representation remain separately accountable.                                                                                                                         |
| Finance specialisms               | The ten subjects in the last column of the Finance table                                                                     | Individual-sensitive records, tax/investigation and high-risk banking/authorisations require separately appointed participants.                                                                    |
| Participant and release controls  | Studio `participant-administration`, `pre-release-briefing`, `embargoed-distribution`; Research `participant-administration` | The research/production participant and release-authorisation groups are not represented.                                                                                                          |
| Supplier project                  | `PRJ-2026-045` workspace and channels                                                                                        | No procurement-project participant is represented.                                                                                                                                                 |
| Project security acceptance       | Production security reviews for the other 15 canonical projects (all except Devon's three assigned technical projects)       | No selectable identity is the assigned project-specific technical assurance reviewer. General project governance, finance participation and site administration do not confer this responsibility. |
| Unit coordination                 | The 11 units listed above                                                                                                    | No preview identity has the required department/unit assignment.                                                                                                                                   |
| Governance                        | Retired `/governance` internal record routes                                                                                 | These now resolve to an external-environment preview; committee records are outside this internal simulation. No invented internal grant remains.                                                  |

## Regression protection

The integrity function reports canonical resource IDs missing policy representation, policy IDs without a canonical resource, unknown role grants, unknown project/incident assignments, missing independent business expectations, zero-authorised-role resources without a documented scope decision, denied intended specialists, unexpectedly authorised roles, outside-scope resources gaining access, and genuinely restricted resources becoming accessible to every role.

Regression fixtures deliberately introduce an orphan, remove `workforce-cost` from policy metadata, add an obsolete policy ID, deny the intended Finance specialist, grant a restricted subject universally and add nonexistent protected, channel, workspace, department and unit assignments. New private units and unrepresented department units require an explicit business review; only the 11 reviewed exclusions receive an outside-scope reason. Each produces the expected actionable failure.

For every actual business resource and every role, the role-switch alternative is checked against the exact resource, rather than a parent workspace. Explicit department contexts and hidden specialist administration use their own scope/capability rules.

Ordinary workspace discovery, every canonical ordinary child area, all canonical ordinary channels, private security membership, Demo User's Company-only global navigation, all six department contexts and all four workspace channel contexts are tested across every preview role. These prevent the controlled-access repairs from reinstating membership gates on ordinary exploration.

Every inventory URL is checked through the production route-family resolver, administration-surface resolver or external-preview resolver. Project channels use the owning project's actual `/projects/.../teams` path, including archive prefixes. Incidents use `/emergency-response/incidents/...`. Unit contexts explicitly select Shared and Unit Coordination. The companion route audit renders these actual inventory URLs rather than substituting corrected paths in the test.

Focused verification: the 12 integrity tests and three route/administration sweep tests, scoped lint and type checking passed locally. The companion route audit covers rendered boundaries and canonical routes. Release-wide checks, manual journeys, German semantic QA and live deployment are recorded by the release handover.

## Manual release verification

Release-wide `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` passed. The complete test run contains **917 passing tests across 87 files**. The build retains its existing bundle-size advisory.

The default-role journey was repeated without using the Preview Role selector: Welcome, every architecture hub, all 13 ordinary workspace Homes, Wiki, the Frontline Crew Portal preview, Studio calendar/list/library search/document preview, and ordinary channels in all four enabled workspaces. The six previously over-restricted ordinary Client & Customer Relations sections also open. Studio Home was checked under all nine roles at 100% zoom with the same core features and canonical channel groups.

Every role was manually checked against an ordinary workspace, an allowed controlled destination and a denied controlled destination. Taylor and Maya's allowed examples were their genuinely authorised Department coordination; Leonie and Elliot's were delegated site administration. The other five roles used relevant protected business work. Every tested role action focused the selector and switching to the eligible role opened the exact denied destination. Private People Operations was additionally checked Taylor → Jamie → Taylor, retaining the unit route and restoring the same boundary when entitlement was removed.

Sam was checked against every one of the 23 Finance subjects: 11 open and 12 remain denied. The three assigned technical project security reviews open for Devon, including the read-only archived review; an unassigned open project and Sam's restricted Finance project do not grant that security review. Both delegated administration roles retain the same six site menu options, while the technology administrator stays outside that capability.

Contextual manual checks covered all six Department links, Studio's context surviving a switch to Finance, explicit global reset to Finance's curated view (including its assigned Financial Close project), Sales entering only Planning, Executive entering another Department, and private security, restricted project and incident denial. Canonical unit context now survives role switching; file and post selections still clear.

German semantic browser QA was completed after the English implementation was final. It covered all 23 Finance routes, every new review description, the commercial proposal, all three newly available project security reviews, all nine role names, the role helper, private-unit recovery, Studio groups and contextual channel labels. Untranslated project purposes and the Planning coordination channel label were corrected and rechecked. Rendered content and accessible labels in the checked surfaces use generic product terminology.

The release commit, actual deployed asset match and live browser results are supplied in the final handover. The existing GitHub main and Render service remain the publication targets. `$polish-website` was not used. This remains a fictional exploratory proof of concept; outside-preview controls represent deliberate scope limits, not real production authorisation.
