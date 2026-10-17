# Site administration implementation and local QA

Verified 18 October 2026 against the [official source map](site-administration-research.md). This remains an exploratory proof of concept.

## Settings and role scope

Site Administrator (Elliot) and Information Advisory Specialist (Leonie) use the same delegated capability and receive the same settings on accessible administered sites:

1. Site contents
2. Site information
3. Site permissions
4. Apply a site template
5. Site usage
6. Change the look

The gear inserts Library settings or List settings immediately after Site contents only inside the corresponding accessible canonical object. Site information exposes View all site settings. That page links to Site permissions, Site columns, Site content types, Navigation, Regional settings and Site libraries and lists.

Ordinary permitted roles retain Site contents, Site usage and Reading preferences. Technology & Engineering Administrator (Devon) receives these ordinary controls, not delegated ownership. General Staff has no existing membership of Tech & Digital; its existing access boundary is preserved.

## Library and list surfaces

| Context                 | Additional administration                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Library                 | Modern Name/Description flyout, configured Default sensitivity labels, More library settings                                                         |
| Fuller library settings | Name and description, Versioning settings, Advanced settings, Permissions for this document library, actual Columns, Views and enabled Content types |
| List                    | Name and description, item Versioning settings, Advanced settings, Permissions for this list, actual Columns, Views and configured Content types     |

Library versioning previews content approval, major or major/minor versions, Automatic or Manual limits, expiration, draft readers where relevant, and required checkout. Lists use item versions without document minor-version, checkout or default sensitivity controls. Fuller settings use an explicit wider dialog instead of reproducing a classic page and ribbon.

The configured label examples are the existing Wiki default and Current Production, both Internal initially. The selector retains Public, Internal, Confidential and Strictly confidential as canonical values. Preview changes never relabel existing files or feed business access policy. Default labels are not enabled across every library.

## Canonical information and access

- Site contents lists actual access-filtered libraries, lists and Home pages with live simulated destinations, item counts and available modified dates.
- Modern permissions shows Owners/Members/Visitors and Full Control/Edit/Read. Explicit Advanced permissions settings reveals a compact group table. Membership additions are labelled previews and never grant access or send invitations.
- Library permissions inspect the canonical inherited/unique state. Check Permissions uses the same access model. There is no stop-inheriting or granting backdoor.
- Site columns aggregate current definitions. Sensitivity is an inspectable built-in label property, not an editable text classification field.
- Site content types inspect existing names, associated fields and templates. Sites without custom types show the standard Document explanation. No type is created per file.
- Denied site, protected-area and file routes expose no settings menu or content through administrative pages. The original workspace, restricted-area and project memberships are unchanged.

## Local manual verification

At 100% zoom, compared General Staff, Information Advisory and Site Administrator on Planning, Creative Studio, Tech & Digital and Acquisition Logistics. Compared contextual libraries and the Locations & Permits list. Verified both elevated roles have equivalent settings, ordinary roles lack owner controls, and Devon remains ordinary.

Exercised Site information save/reopen/cancel, permissions and explicit advanced groups, Theme/Header/Navigation previews, the wider template chooser and simulated application, canonical Site contents links, advanced metadata/content-type/navigation/regional pages and honest unavailable Site usage information. Exercised library versioning, inherited permissions, columns, views, configured content types and configured default sensitivity save/reopen.

Verified role switches with settings open: General Staff to Information Advisory, Information Advisory to Site Administrator, and Site Administrator to General Staff. Each closes the old surface before navigation. Administrative page queries are removed on role change.

Protected Planning and Executive entry points remain denied. Direct settings URLs cannot turn an inaccessible workspace into Site contents or expose owner permissions to General Staff. Automated coverage also includes personnel, welfare, privileged technology, Finance, projects, participant administration and restricted-file parameters.

Checked the narrow 794px layout and mobile 390px panel bounds. The existing gear now remains reachable on mobile.

German semantic review was performed after the English experience was final. Verified official setting terminology, form descriptions, permissions, classification, versioning, dynamic accessible names and unchanged canonical option values. Preserved the existing Wiki brand. Checked new rendered and accessible copy for prohibited product names and display dashes.

## Deliberate limits

Settings changes are browser-session previews. They do not provision an external site, alter actual access, rebuild content or mutate canonical records. Site usage has no invented analytics. The template gallery is a restrained sample, and appearance previews use simplified miniatures. Metadata inspection aggregates existing fictional definitions rather than provisioning an enterprise schema. Ordinary role permissions are deliberately curated; real default Edit permissions can include Manage Lists.

The installed Figma kit could not be retrieved through the available connection. Official current screenshots and the existing Fluent components supplied the visual reference. The source map records current modern patterns separately from these simulation limits. Live deployment verification is reported with the delivered commit in the final handover.
