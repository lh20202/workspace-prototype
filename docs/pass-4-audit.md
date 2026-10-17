# Pass 4 — final proof-of-concept audit

This completes the fourth planned remediation pass. The application remains an interactive proof of concept, with fictional people/data, simulated access and local edits. It is not production-ready software or a connected Microsoft 365 tenant.

## Ownership and discovery

- People & Culture now defines only workforce/organisation, leadership/culture/inclusion, learning, framework design, communications, communities, aggregate analysis and wellbeing work. Obsolete hiring/employment areas, files, items, tools and protected subjects were removed from its source fixtures, rather than hidden by a runtime filter.
- Employment & Hiring Administration directly owns the migrated working items and files, retaining their original IDs. Fourteen shared protected-subject definitions cover candidate applications, assessments, references, offers, placement circumstances, personnel/contracts, employment changes, compensation, absence, master data, payroll/benefit inputs, employee relations, complaints and welfare cases. They contain no individual records.
- Known legacy protected aliases resolve to existing subjects. Unrecognised old record URLs fall back to a relevant denied boundary. Ordinary legacy file URLs and old Teams links preserve the same file and current library/folder.
- The registry has 21 explicit ownership examples, including employment contracts, leadership programmes, editorial production, CMS engineering and formal project plans. Library audits verify one primary ordinary working location per file, useful views/content types, and protected-content exclusion.
- Actual rendered People searches for Role & Selection Criteria, Interview Planning Schedule and Employment Process return no documents; a learning search supplies a positive control. Employment finds the original moved file in Recruitment Administration.

## Deliberate Teams availability

| Experience                         | Integration                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| Acquisition & Activation Logistics | Operational coordination, shifts and handovers                                      |
| Content Room                       | Six enduring desks, two active temporary coverage channels and one archived channel |
| Digital & Technology               | Engineering, innovators, AI and platform coordination                               |
| Planning                           | Lightweight reference-prototype connection                                          |
| Department Teams                   | Six department teams with their own unit/membership rules                           |
| Active projects                    | Assigned project teams, independently of central Projects                           |
| Emergency Response                 | Incident-specific private collaboration and read-only closure                       |

Central Projects, Audience, Customer Care, Finance, Services, Quality, Legal, People, Employment, Executive and Archives do not manufacture generic Teams feeds. Removed feeds and their Shared datasets are absent from the generic Teams implementation. Staff whose functional workspace has no Team enter their Department. Old explicit functional Teams destinations return to the owning SharePoint page; known public file links retain their file identity, and protected IDs are not passed through ordinary discovery.

## Visual and interaction decisions

- The launcher distinguishes two **Reference prototypes** from **Full Architecture Proof of Concept · EXPLORATORY**. External Demo Controls use **Full architecture · POC**. User-facing Beta labels were removed.
- Inter Variable remains bundled for organisational content; Microsoft/Teams chrome and portaled native controls retain Segoe. The final changes use restrained weights, readable metadata, consistent field heights, quiet hover/pressed/focus states and reduced-motion support.
- Planning's structure is retained. Its document/task shortcuts remain; navigation duplicates in Planning, Logistics and Finance were removed. Project shortcuts are labelled Delivery & support and retain real handoffs.
- The architecture directory retains one icon/name/arrow per tile, normal scrolling, a distinct Department Teams rail, concise fictional-data caveat and a light staff-preview utility. The repeated directory eyebrow was removed.
- Home grids have consistent section spacing and comfortable line lengths without new cards or dashboards. Projects now uses the shared SharePoint header sizing. Archive details use readable labels rather than raw object keys/IDs. Finance's old table CSS no longer distorts shared document libraries; its Home copy and links have intentional spacing.
- The common Teams shell is retained across Content, Department, Digital, Logistics, projects and private response. Post/composer alignment, tab transitions, replies, reactions, Shared links and archived read-only behavior were reviewed.

## Rendered review

Manual browser review used 100% zoom at 1440×900 and 1728×1100 desktop sizes. Captures were inspected as rendered images, not accepted solely from DOM assertions or automated tests.

The required review set covers the root launcher; architecture directory; Planning Home and library; Logistics Home; Services Home and library; Digital Home and library; Content Room Home, library and Teams; MCG Department Teams; Employment Home, library and restricted denial; Projects; and Company Archives. People, Audience, Customer Care, Quality, Legal, Finance and Executive Homes were also checked for purposeful content and consistency.

The installed SharePoint Web UI Kit (Community), v3 was accessible in Figma Desktop and actively inspected again: team-site composition/header/navigation, Document Library, List and Quick Links. The 48px product bar, restrained section hierarchy, aligned section grid, quiet command bar and approximately 44px simple rows informed comparison. The kit was not edited, exported into the application or made a dependency.

Current primary references include [Microsoft's web-part composition examples](https://learn.microsoft.com/sv-se/sharepoint/dev/design/key-web-part-examples), [SharePoint design guidance](https://learn.microsoft.com/en-us/sharepoint/dev/design/design-guidance-overview), [brand-font packages](https://learn.microsoft.com/en-us/sharepoint/brand-center-font-packages), and [the current Teams chat/channel experience](https://support.microsoft.com/en-gb/teams/teams-channels/explore-the-new-chat-and-channels-experience-in-microsoft-teams), including its official combined-view screenshot. These calibrate product grammar rather than demand pixel copying.

## Access and verification

Rendered checks cover candidate/personnel, legal, banking, technology security, Platinum relationships, governance without membership, Employee Representative Council, restricted projects and private Emergency Response. Denied states expose no underlying file rows or previews. Search/recent/Shared checks retain original permitted objects and exclude protected subjects. Local role previews are illustrative access simulations, not security enforcement suitable for deployment with real records.

Lint, type checking, all 282 tests and the production build pass. Focused tests include People/Employment search separation, all protected aliases, deliberate Teams availability, legacy document identity, POC labels, one primary file location and library/view integrity. The content population snapshot is [content-audit.md](content-audit.md); counts remain review guidance, never quotas or ISO requirements.

Deployment uses the existing GitHub main branch and existing Render service. Completion requires verifying the actual live build and browser-testing the public routes after deployment; a successful push alone is insufficient.
