# Organisational Planning & Reporting

A fictional SharePoint-style document collaboration prototype. React, TypeScript, Vite and Fluent UI React v9. No authentication, backend or actual documents.

## Development

Use Node 24 (at least 22.12). Run `npm ci`, then `npm run dev`. Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Content and interactions

Synthetic libraries, files, metadata, roles and milestones live in `src/data/workspace.ts`. Discovery and access rules are in `src/utils/documents.ts`. Normal library browsing shows immediate folders and files only. Planning cycles have small contribution folders; current strategy (2025–2030) is separated from archived periods. Views, search and metadata filters find documents across child folders. Folder paths and synthetic contents are defined in `src/data/workspace.ts`. The Restricted Planning access contact and IT request form are fictional; submitting the form only shows a simulation message. Maya Chen is the fictional signed-in workspace contributor; no role switcher is exposed. Department shortcuts open current-cycle submissions filtered by planning area, with filters preserved in URLs. Document links open details directly. Upload, open, approval and version history are explicitly simulated. Restricted Planning shows the protected-area access state to the ordinary contributor; client-side rules are not a security control.

## Render

Reuse the existing Render static site connected to `lh20202/workspace-prototype`, branch `main`. Build: `npm ci && npm run build`. Publish: `dist`. Node: 24.19.0. Enable automatic deploys on commit. Rewrite `/*` to `/index.html`. `render.yaml` records this setup; do not create a duplicate service if one already exists. A blueprint file does not by itself confirm that a service has been deployed.

## Design references

- https://fluent2.microsoft.design/components/web/react/
- https://learn.microsoft.com/en-us/sharepoint/information-architecture-modern-experience
- https://learn.microsoft.com/en-us/sharepoint/information-architecture-principles

One shared workspace, libraries by purpose/lifecycle, shallow cycle folders, restrained metadata, approved outputs and a bounded protected area. No legal retention periods are asserted. All identities and content are fictional. Figma computer-control attachment was unavailable; no Figma assets were exported.
