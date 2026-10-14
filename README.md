# Organisational Planning & Reporting

A fictional SharePoint-style document collaboration prototype for Northstar Organisation. React, TypeScript, Vite and Fluent UI React v9. No authentication, backend or actual documents.

## Development

Use Node 24 (at least 22.12). Run `npm ci`, then `npm run dev`. Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Content and interactions

Synthetic libraries, files, metadata, roles and milestones live in `src/data/workspace.ts`. Discovery and access rules are in `src/utils/documents.ts`. Views, search, metadata filters and shallow cycle folders operate on local data. Role selection persists locally; other state is reflected in major library URLs. Document links open details directly. Upload, open, approval and version history are explicitly simulated. The role switcher illustrates an access boundary; it is not a security control.

## Render

Reuse the existing Render static site connected to `lh20202/workspace-prototype`, branch `main`. Build: `npm ci && npm run build`. Publish: `dist`. Node: 24.19.0. Enable automatic deploys on commit. Rewrite `/*` to `/index.html`. `render.yaml` records this setup; do not create a duplicate service if one already exists. A blueprint file does not by itself confirm that a service has been deployed.

## Design references

- https://fluent2.microsoft.design/components/web/react/
- https://learn.microsoft.com/en-us/sharepoint/information-architecture-modern-experience
- https://learn.microsoft.com/en-us/sharepoint/information-architecture-principles

One shared workspace, libraries by purpose/lifecycle, shallow cycle folders, restrained metadata, approved outputs and a bounded protected area. No legal retention periods are asserted. All identities and content are fictional. Figma computer-control attachment was unavailable; no Figma assets were exported.
