# External preview assets

The shared preview uses two locally generated corporate photographs. They contain no company data or identifiable people and are deliberately blurred, decorative and hidden from assistive technology.

Generated with the built-in image-generation tool, 17 October 2026. The original PNGs remain in the Codex generated-images folder; optimised JPEG copies are stored in `public/images/external/`.

- `corporate-courtyard.jpg`: contemporary glass office building and landscaped courtyard in soft early morning sunlight; empty scene, no people, readable signs, logos, text or brands; natural photographic realism, understated geometry, warm light, muted green and blue; wide 16:9 corporate hero photograph, no graphic overlays.
- `workplace-atrium.jpg`: bright contemporary workplace atrium with open collaborative table, pale wood, glass partitions, plants and neutral furnishings; empty scene, no people, readable screens, signs, logos, text or brands; spacious photographic realism and soft daylight; wide 16:9 corporate section photograph, no graphic overlays.

The current [SAP homepage](https://www.sap.com/index.html) and [Adobe homepage](https://www.adobe.com/home) were visually reviewed before implementation. Only broad composition cues informed the fictional backdrop: a simple header silhouette, large saturated hero region, strong type proportions, image-led sections and lighter full-width regions. No source assets, branding, copy or exact layouts were reused.

Vendor logos are original local SVGs in `public/images/admin-logins/`. The central registry is `src/environments/catalog.ts`. All portals and vendor systems use `ExternalEnvironmentPreview`; legacy Governance, Frontline and system entrances resolve to this same boundary. The backdrop has no links, controls or meaningful text.
