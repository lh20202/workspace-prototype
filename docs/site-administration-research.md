# Site administration source accuracy checklist

Research verified **18 October 2026**. This is developer reference material, so technically accurate product names are retained here. The rendered demonstration continues to use generic site, workspace and channel language.

This checklist covers site-level behaviour and the library/list source map below. Sources are Microsoft Support or Microsoft Learn. Support pages mix modern and classic sections; only the explicitly modern instructions and relevant screenshots are used for modern panels.

## Settings gear ordering

The official [Settings screenshot](https://support.microsoft.com/en-us/sharepoint/media/sp-settings-site-information.png), embedded in the site information article below, was opened and visually inspected. Its order is:

1. Add a page
2. Add an app
3. Site contents
4. Site information
5. Site permissions
6. Apply a site template
7. Site usage
8. Site performance
9. Change the look

For the requested, implemented administration subset, preserve the relative order **Site contents → Site information → Site permissions → Apply a site template → Site usage → Change the look**. Contextual Library settings or List settings may be added when the current location supplies that context.

The screenshot does **not** show a direct View all site settings gear row. The documented modern route is **Site information → View all site settings**. Unsupported app creation or performance diagnostics should not be added simply to copy every screenshot row. Feature rollout, permissions, site type and configuration affect which entries appear; the screenshot is a first-party reference, not a guarantee that every tenant has one universal menu.

The pictured Settings surface is a narrow, white, right-side flyout with a heading, close button and plain text rows. It is not a grid of administration cards or a custom dashboard.

## Required official source map

### 1. Site information, identity and modern permissions

[Change a site's title, description, logo, and site information settings](https://support.microsoft.com/en-us/sharepoint/sites-in-sharepoint/change-a-site-s-title-description-logo-and-site-information-settings)

Verified 2026-10-18; no publication/update date exposed in the retrieved Support article.

- Editing site identity requires owner or designer permissions.
- The modern Site information panel contains required site name, description, hub association and privacy for team sites. Hub association can be disabled when association permission is absent. Privacy is not an appropriate editable field for every site type.
- Logo editing is now under **Change the look → Header**, rather than a logo-upload field in Site information.
- Site information has Save/Cancel actions and a View all site settings link.
- The modern permissions panel manages site groups and membership. Advanced permissions settings is an owner entry point for additional configuration. Connected-group membership is preferred to adding unrelated individual grants.

Visually inspected references:

- [Site information panel, 345 × 619 source image](https://support.microsoft.com/en-us/sharepoint/media/settings-site-information.png): heading/close, vertically stacked fields, advanced link, bottom Save and Cancel separated from the form by a light rule.
- [Permissions panel, 345 × 785 source image](https://support.microsoft.com/en-us/sharepoint/media/permissions-and-access-dialog-box.png): Add members, expandable site groups, sharing section, advanced link. Use the documented permission levels below rather than treating every incidental screenshot caption as a separate permission type.

### 2. Modern sharing and permission architecture

[Sharing and permissions in the SharePoint modern experience](https://learn.microsoft.com/en-us/sharepoint/modern-experience-sharing-permissions)

Verified 2026-10-18; Learn reports updated **2024-10-09**.

- Group-connected team sites should normally use their connected group for owner/member access. Visitors can receive read access through the site's Visitors group.
- Communication sites use the site's permission groups. Hub association does not merge every associated site's permissions.
- Private/shared channel site membership is managed through the channel experience rather than an independent site membership editor.
- The service administrator controls who may associate sites with a hub; a site owner does not gain tenant administration through that field.

### 3. Permission levels and scope

[Understanding permission levels in SharePoint](https://learn.microsoft.com/en-us/sharepoint/understanding-permission-levels) — current page heading: “Permission levels in SharePoint”.

Verified 2026-10-18; Learn reports updated **2025-04-30**.

- Default Owners have Full Control, Members have Edit and Visitors have Read.
- Full Control includes Manage Permissions. Edit includes list and item administration, so the real product's permissions are more granular than a blanket administrator/non-administrator split.
- Lists and libraries normally inherit their site's permissions; deliberately unique permissions are exceptions. Files/items in turn normally inherit from the library/list.
- Site owner, site collection administrator and tenant administrator are different scopes. This proof of concept delegates relevant site-management capability only on accessible administered sites. It must not infer universal business access from a role name or expose site collection administrator membership management.

### 4. Appearance

[Change the look of your SharePoint site](https://support.microsoft.com/en-us/sharepoint/sites-in-sharepoint/change-the-look-of-your-sharepoint-site)

Verified 2026-10-18; no publication/update date exposed in the retrieved Support article.

- The modern entry point is Settings → Change the look. Site owner or design permissions are required.
- Modern settings cover Theme, Header and Navigation. Footer is available on communication site pages, not team-site pages, list pages or library pages.
- Theme choices can be restricted to approved company themes. Modern theme preview uses Save/Cancel; the classic “Try it out” workflow is not the modern pattern.
- Header layouts include Minimal, Compact, Standard and Extended where supported. The article notes cloud-specific availability differences. Header identity includes logo/thumbnail and title visibility.
- Navigation appearance is distinct from editing navigation links. The modern article documents horizontal/vertical orientation and horizontal cascading/megamenu options where supported.

Visually inspected [Change the look category panel](https://support.microsoft.com/en-us/sharepoint/media/sp-change-the-look-header.png): narrow right panel, heading and close, Theme/Header/Navigation rows with right arrows. A separate [current header layout reference](https://support.microsoft.com/en-us/sharepoint/media/header-layout.png) is linked from the same modern article. Do not copy the later classic theme-gallery sections as the primary modern experience.

### 5. Site templates

[Apply and customize SharePoint site templates](https://support.microsoft.com/en-us/sharepoint/sites-in-sharepoint/apply-and-customize-sharepoint-site-templates)

Verified 2026-10-18; no publication/update date exposed in the retrieved Support article.

- Applying a template requires site owner permissions or higher.
- Settings → Apply a site template opens a chooser and template preview. “Site designs” is the previous entry-point name.
- Real application can create a new home page and additional content; existing libraries/lists/pages are retained. There is no automatic undo. The demonstration therefore previews safely and must not rebuild the workspace.
- Templates supplied by the organization are separated from built-in templates. Some templates require additional licensing; they need not appear in this demo.
- Template history is reachable from Site information. It is not tenant-level template policy administration.
- Current ordinary team-site template examples include Standard team, Project management, Training course and Training design team. “Training and courses” should not be presented as the chooser's current template name.

Visually inspected [template preview](https://support.microsoft.com/en-us/sharepoint/media/sp-preview-and-apply-template-teams-site.png): a wide dialog, explanatory content on the left, site preview on the right, Back at the lower left, Use template and Cancel at the lower right. This is not necessarily another narrow settings flyout.

### 6. Site contents

[SharePoint site contents page](https://support.microsoft.com/en-us/sharepoint/sites-pages/sharepoint-site-contents-page)

Verified 2026-10-18; no publication/update date exposed in the retrieved Support article.

- Reachable through site navigation or Settings → Site contents.
- Displays actual libraries, lists, pages and relevant apps; an elevated user can create supported content through New.
- The [visually inspected contents screenshot](https://support.microsoft.com/en-us/sharepoint/media/site-content-page.png) uses a normal site page and table columns **Name, Type, Items, Modified**. It is not an administration dashboard.
- Reuse the current canonical data and actual destination links, applying existing access filtering. Do not create duplicate libraries or fabricate system libraries from the screenshot.
- The article is written for owners but does not establish that simply viewing Site contents is exclusively owner-only. Separate visibility from elevated creation/configuration actions.

## Usage and advanced settings references

[View usage data for your SharePoint site](https://support.microsoft.com/en-us/sharepoint/sites-in-sharepoint/view-usage-data-for-your-sharepoint-site), verified 2026-10-18; no source update date exposed.

- Explicitly states that site admins, owners, members and visitors can view usage. It is **not an owner-only differentiator**.
- Visitors cannot run external-user reports or download the 90-day report; guest owners do not receive usage analytics.
- Real views include aggregate traffic and popular content. A restrained fictional/preview representation must not claim to collect live analytics or reveal inaccessible content.

[Change regional settings for a site](https://support.microsoft.com/en-us/sharepoint/sites-in-sharepoint/change-regional-settings-for-a-site), verified 2026-10-18; no source update date exposed.

- Site owners can set site timezone and locale. The documented modern route is Site information → View all site settings → Regional settings. Some pages instead expose settings through Site contents.

[Create a column in a list or library](https://support.microsoft.com/en-us/sharepoint/lists/data-and-lists/create-a-column-in-a-list-or-library), verified 2026-10-18; no source update date exposed.

- Its current site-column instructions use Site information → View all site settings → Web Designer Galleries → Site columns. This confirms that reusable site columns are an advanced site-level concept rather than another ordinary file property.

[Create or customize a site content type in SharePoint Online](https://support.microsoft.com/en-us/sharepoint/documents-and-library/create-or-customize-a-site-content-type), verified 2026-10-18; no source update date exposed.

- Existing site content types can describe reusable metadata and document templates. Site settings exposes the gallery.
- The source requires Full Control for creating site content types, and a site collection administrator for top-level site content-type creation. Inspecting existing canonical types does not justify adding unrestricted top-level type creation or site collection administrator management.
- Older InfoPath/document information panel instructions in this mixed-age article are not part of this implementation.

## Official German terminology

The German sources below were checked on 2026-10-18. They verify established labels; surrounding machine-translated prose is not copied blindly.

| English                       | German label                                          | Official reference                                                                                                                                          |
| ----------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Settings                      | Einstellungen                                         | [Site information](https://support.microsoft.com/de-de/sharepoint/sites-in-sharepoint/change-a-site-s-title-description-logo-and-site-information-settings) |
| Site information              | Websiteinformationen                                  | Same reference                                                                                                                                              |
| Site name                     | Websitename                                           | Same reference                                                                                                                                              |
| Site description              | Beschreibung der Website                              | Same reference                                                                                                                                              |
| Site permissions              | Websiteberechtigungen                                 | Same reference                                                                                                                                              |
| Advanced permissions settings | Erweiterte Berechtigungseinstellungen                 | Same reference                                                                                                                                              |
| Owners / Members / Visitors   | Websitebesitzer / Websitemitglieder / Websitebesucher | Same reference                                                                                                                                              |
| Full Control / Edit / Read    | Vollzugriff / Bearbeiten / Lesen                      | Same reference                                                                                                                                              |
| Change the look               | Aussehen ändern                                       | [Appearance](https://support.microsoft.com/de-de/sharepoint/sites-in-sharepoint/change-the-look-of-your-sharepoint-site)                                    |
| Theme                         | Design                                                | Same reference                                                                                                                                              |
| Navigation                    | Navigation                                            | Same reference                                                                                                                                              |
| Footer                        | Fußzeile                                              | Same reference; compound descriptions use Websitefußzeile                                                                                                   |
| Apply a site template         | Websitevorlage anwenden                               | [Templates](https://support.microsoft.com/de-de/sharepoint/sites-in-sharepoint/apply-and-customize-sharepoint-site-templates)                               |
| Use template                  | Vorlage verwenden                                     | Same reference                                                                                                                                              |
| From your organization        | Aus Ihrer Organisation                                | Same reference                                                                                                                                              |
| Site contents                 | Websiteinhalte                                        | [Contents](https://support.microsoft.com/de-de/sharepoint/sites-pages/sharepoint-site-contents-page)                                                        |
| Site usage                    | Websitenutzung                                        | [Usage](https://support.microsoft.com/de-de/sharepoint/sites-in-sharepoint/view-usage-data-for-your-sharepoint-site)                                        |
| Site settings                 | Websiteeinstellungen                                  | [Regional settings](https://support.microsoft.com/de-de/sharepoint/sites-in-sharepoint/change-regional-settings-for-a-site)                                 |
| View all site settings        | Alle Websiteeinstellungen anzeigen                    | Same reference                                                                                                                                              |
| Regional settings             | Regionale Einstellungen                               | Same reference                                                                                                                                              |
| Time zone / Locale            | Zeitzone / Gebietsschema                              | Same reference                                                                                                                                              |
| Site columns                  | Websitespalten                                        | [Columns](https://support.microsoft.com/de-de/sharepoint/lists/data-and-lists/create-a-column-in-a-list-or-library)                                         |
| Site content types            | Websiteinhaltstypen                                   | [Site content types](https://support.microsoft.com/de-de/sharepoint/documents-and-library/create-or-customize-a-site-content-type)                          |

For Header, the German support prose inconsistently uses “Überschrift”, “Header” and “Kopfzeile”. **Kopfzeile** is the clear enterprise-interface wording; avoid copying malformed translated navigation instructions. Existing punctuation and generic-product terminology rules still apply to rendered German copy.

## Fidelity and scope limits

- These are current first-party documentation references and their published screenshots, not access to an authenticated live tenant. Targeted releases and tenant configuration can differ.
- Site collection/tenant administration is not inferred from local role names. The two elevated demo roles may share the same delegated settings surface while protected business entitlements remain unchanged.
- Narrow site panels, permissions group expansion, a template chooser and advanced settings navigation reproduce documented interaction concepts. Their scope and current configuration matter more than copying every historical menu item.
- Current source-backed controls do not require an exhaustive classic settings museum. Deprecated InfoPath, legacy publishing controls and tenant-wide policies are outside this pass.
- The installed Figma UI kit reference could not be retrieved for this pass. Official documentation screenshots were used as the visual reference. Figma was not used as an authority for permissions.

### Current modern patterns represented

- The existing gear opens a right-side settings surface, with the documented relevant menu order and contextual library/list settings.
- Site information and permissions use focused panels. Appearance opens Theme, Header and Navigation rather than a custom administration homepage. Logo changes belong in Header; the visibility switch controls the site title.
- Site contents is a same-site page with canonical, access-filtered contents and real destination links. Advanced settings, columns, content types, navigation and regional settings use same-site settings pages.
- Ordinary accessible sites retain Contents and Usage. The elevated roles receive the additional configuration controls. A denied business location cannot be used as an administration backdoor.

### Simulated proof-of-concept behaviour

- Identity, appearance, navigation and regional saves are browser-session previews. They do not rename a live site, change the actual workspace architecture or write to a service.
- Privacy selection and group-member examples do not change business entitlements or send invitations. Group display uses the existing fictional role/access model rather than a live identity directory.
- The template chooser demonstrates selection and safe preview. The application action is explicitly simulated and does not create a new homepage, add competing libraries or replace current content.
- Site columns is an inspectable aggregate of existing library/list metadata, not a tenant metadata provisioning system. Site content types come from existing library definitions; the demo does not provision site collection content types.
- Site usage explicitly reports that no usage data is collected; it does not fabricate live traffic charts or reports.
- The supported template and appearance choices are deliberately restrained. The simulation does not include every licensed template, tenant branding policy, cloud-specific variation, classic setting or service configuration.

## Library and list administration source map

Verified **18 October 2026** against the current first-party pages below. Library and list controls use the same canonical contents and capability checks as the site, rather than creating a second administration data model.

### Modern entry point and fuller settings

[Add a sensitivity label to a document library](https://support.microsoft.com/en-us/sharepoint/libraries/add-a-sensitivity-label-to-sharepoint-document-library) explicitly documents **Settings → Library settings → Library settings flyout**, including the Default sensitivity labels dropdown. The article contains a current flyout illustration. Its image endpoint could not be loaded during this pass, so it is not claimed as a separately inspected screenshot.

[Switch the default experience for lists and libraries](https://support.microsoft.com/en-us/sharepoint/data-and-lists/switch-the-default-experience-for-lists-and-libraries-between-new-or-classic) distinguishes **Library settings → More library settings → Advanced settings** from a list's **List settings → Advanced settings** route. [Edit list settings](https://support.microsoft.com/en-us/sharepoint/lists/data-and-lists/edit-list-settings) describes the fuller grouped settings page, including general settings, permissions, columns and views. These sources mix modern and older product sections; RSS, InfoPath, legacy workflows and a classic-experience switch are not added merely because they appear in the article.

The implemented library entry is a restrained modern flyout with Name, Description, a configured default label where applicable, and More library settings. The explicit More action opens a wider dialog containing grouped, native-style settings links. A list opens the fuller settings view directly. **The dialog is a proof-of-concept navigation simplification:** the real fuller settings experience is normally a settings page. It is not presented as a new modern all-settings flyout or as a universal pixel-exact tenant interface.

### Versioning

[Enable and configure versioning for a list or library](https://support.microsoft.com/en-us/sharepoint/lists/documents-and-library/enable-and-configure-versioning-for-a-list-or-library?tabs=modern) documents the Versioning settings route and differentiates the controls:

- Libraries support major versions or major/minor versions, content approval, version limits, draft visibility and required checkout.
- Lists support item version history, approval, retained-version limits and draft visibility. Document checkout and major/minor document controls are not list settings.

[Version history limits overview](https://learn.microsoft.com/en-us/sharepoint/document-library-version-history-limits) documents Automatic and Manual library limits, count/age handling, and the UI minimums of **100 major versions** and **30 days** for an expiration limit. Never remains a valid no-expiration choice. [Set default organization version limits](https://learn.microsoft.com/en-us/sharepoint/set-default-org-version-limits) confirms the 100–50,000 major-version input range and the distinction between defaults for new libraries and individual library configuration. That organization-level page is reference material only; the demo does not expose organization policies or trimming jobs.

The preview validates these library bounds and stores only session-local configuration. Lists retain their separate count-based interface. It does not delete, trim, recover or generate actual versions. Requiring checkout is demonstrated as a library option with its collaboration implication, not enabled on every library.

### Library/list permissions

[Customize permissions for a list or library](https://support.microsoft.com/en-us/sharepoint/lists/sharepoint-sharing-and-permissions/customize-permissions-for-a-sharepoint-list-or-library) confirms the route through **Permissions and Management → Permissions for this document library / Permissions for this list**. Inheritance is normal; deliberately unique permissions are exceptions. The source recommends connected/site groups and describes breaking or restoring inheritance as consequential operations.

The preview displays the canonical inherited/unique state. Inherited group detail shows the site's normal Owners, Members and Visitors structure. A controlled library's unique state is explained without inventing broad grants. Check Permissions checks an existing fictional colleague against the canonical access model. The preview neither grants access, sends invitations nor breaks/restores inheritance.

The [permission-level reference](https://learn.microsoft.com/en-us/sharepoint/understanding-permission-levels) is essential context: real **Edit** includes **Manage Lists**, while **Contribute** does not; Full Control includes permission management. The demo's curated ordinary preview roles intentionally have a narrower settings capability than its two delegated management roles. This must not be interpreted as a claim that every real non-owner with Edit is unable to manage lists or public views.

### Columns, views and content types

[Create a column in a list or library](https://support.microsoft.com/en-us/sharepoint/lists/data-and-lists/create-a-column-in-a-list-or-library) covers modern Add column and the settings-page route for adding an existing site column. The preview inspects the actual column name, type, choices and required state. Required-state edits remain local previews. Sensitivity is shown as a built-in file classification property, **not** an invented custom “Managed label” or Managed Metadata column.

[Create, change, or delete a view](https://support.microsoft.com/en-us/sharepoint/lists/data-and-lists/create-change-or-delete-a-view-of-a-list-or-library) covers view creation/editing, columns and public/default-view restrictions. The preview lists only existing canonical views, displays their actual filters and allows a session-local selection of shown columns. It does not create arbitrary filler views or change everyone's live default view.

[Add a content type to a list or library](https://support.microsoft.com/en-us/sharepoint/documents-and-library/add-a-content-type-to-a-list-or-library) requires at least Design permissions, documents enabling content-type management through Advanced settings, and describes adding existing site content types. The preview uses only the existing library definition's content types, associated metadata and template where present. It does not fabricate content types for every file, provision tenant types or expose unrelated content-type policies. A section is shown only when the canonical definition supplies types and management is enabled in the local preview.

### Default sensitivity label prerequisites and limits

[Configure a default sensitivity label for a document library](https://learn.microsoft.com/en-us/purview/sensitivity-labels-sharepoint-default-label), updated 10 June 2025, documents these prerequisites and behaviours:

- Appropriate licensing, published file-scoped labels available to the configuring user, enabled file-label integration, and site-admin permissions are required. PDFs require separate support; library IRM is incompatible.
- A default can label newly uploaded or edited content; existing files at rest are not bulk relabelled. A manually applied label is preserved regardless of priority; a lower-priority automatic/default label may be replaced.
- The preview-only “Extend protection on download, copy, or move” option belongs to another scenario and is not included here.

Only the canonical configured examples expose the default dropdown. It reuses Public, Internal, Confidential and Strictly confidential; there is no second vocabulary. A changed selection is saved locally and does not relabel existing documents, apply encryption, modify permissions or connect to a policy service. The chosen library default must not be confused with a label policy default or a sensitivity label on the site/container.

### German library/list terminology

The current German references establish these labels; translated prose is reviewed for meaning rather than copied mechanically:

| English                                      | German label                                              | Official reference                                                                                                                                            |
| -------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Library settings / List settings             | Bibliothekseinstellungen / Listeneinstellungen            | [Permissions](https://support.microsoft.com/de-de/sharepoint/lists/sharepoint-sharing-and-permissions/customize-permissions-for-a-sharepoint-list-or-library) |
| More library settings                        | Weitere Bibliothekseinstellungen                          | Same reference                                                                                                                                                |
| Permissions and Management                   | Berechtigungen und Verwaltung                             | Same reference                                                                                                                                                |
| Permissions for this document library / list | Berechtigungen für diese Dokumentbibliothek / diese Liste | Same reference                                                                                                                                                |
| Advanced settings / Content types            | Erweiterte Einstellungen / Inhaltstypen                   | [Content types](https://support.microsoft.com/de-de/sharepoint/documents-and-library/add-a-content-type-to-a-list-or-library)                                 |
| Allow management of content types            | Verwaltung von Inhaltstypen zulassen                      | Same reference                                                                                                                                                |
| Default sensitivity labels                   | Standardmäßige Vertraulichkeitsbezeichnungen              | [Library default label](https://support.microsoft.com/de-de/sharepoint/libraries/add-a-sensitivity-label-to-sharepoint-document-library)                      |
| Versioning settings                          | Versionseinstellungen                                     | [Versioning](https://support.microsoft.com/de-de/sharepoint/lists/documents-and-library/enable-and-configure-versioning-for-a-list-or-library)                |

The versioning article also contains the older “Versionsverwaltungseinstellungen” wording in later historical instructions. The preview uses the concise, consistent Versionseinstellungen. The existing four label translations remain **Öffentlich, Intern, Vertraulich, Streng vertraulich**.

### Implementation boundary

Modern contextual entry points, the limited flyout, grouped fuller settings, list/library distinctions and canonical configuration inspection are reproduced. The wider dialog, selected-column editor, versioning saves, local visibility selection and read-only access check are deliberate proof-of-concept representations. All editable administration settings remain within browser-session storage. There is no live service write, membership grant, inheritance mutation, document relabel or metadata provisioning, and protected business contents are excluded before an administration surface is constructed.
