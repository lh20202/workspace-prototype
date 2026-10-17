# FAQ and Planning & Reporting handover

This remains an exploratory Digital Workspace proof of concept. The current working tree, established architecture and role boundaries were preserved. The polish-website skill was not used.

## FAQ

The same popup opens from Welcome and Demo Controls. A fixed title and Close action surround the scrolling content. All 22 accessible Fluent accordion questions start collapsed; several may remain open. No tabs or question cards were added. The later short personal-drive wording and “See an example” label remain; the previously removed automation explanation was not restored.

### Files & access

- Who can see my files?
- Do I save documents in Teams channels or workspaces?
- Where do personal drives fit in?
- What if someone shares a personal drive file anyway?
- Who manages access and permissions?
- What happens when someone joins, leaves or changes roles?
- How do I know how sensitive a document is?
- Where do I save personal data or Strictly confidential information?
- Do I need to make a copy before sharing a document with another team?
- What happens if I accidentally delete or overwrite something?
- What happens to files when a project or piece of work finishes?
- What happens to files in our current shared drive?
- What happens to my existing links, bookmarks and synced folders?

### Working with others

- Can I work with colleagues in other countries?
- Can I work with people outside the company?
- What's the difference between Teams and a workspace?
- I work with lots of different tools and platforms — how do they fit in?
- I already work in lots of sites and Teams channels — will this add even more?

### Getting started & support

- What if I don't know which workspace something belongs in?
- How do I create a new workspace if I need one?
- Will my team and I get training?
- Do I need to learn the technical settings?

The sensitivity question explains the four canonical labels. The protected-information question explains where personal data or Strictly confidential information belongs. There is no duplicate general confidential-document question.

### Final migration and training wording

**What happens to files in our current shared drive?**

Existing shared-drive files will be reviewed as work moves into the new setup. Useful information will move to the right workspace or archive; material that is no longer needed doesn't have to be carried forward. You won't be expected to work out all of the destinations on your own.

**What happens to my existing links, bookmarks and synced folders?**

Switch-over support will include updating important links and bookmarks and reviewing old synced folders. We'll make it clear what needs changing rather than expecting you to discover broken links yourself.

**Will my team and I get training?**

Yes — everyone will be introduced to the workspaces they use, with support for the new setup, updating important links and bookmarks, and safely creating, sharing and receiving information. Workspace focal points will receive additional training so they can help with structure, access, day-to-day questions and good working practices.

**Do I need to learn the technical settings?**

It depends on your role. Most people only need to know how to use their workspaces day to day; focal points, people who regularly handle personal or sensitive information, and technical or administrative roles will receive the extra training relevant to their responsibilities.

### OneDrive example

“See an example” expands the actual Ari Morgan / Devon Park exchange inside the popup. Ari did not realise the original link was personal OneDrive; Devon asks for the shared workspace copy, Ari moves it and updates the original link, and Devon acknowledges. The footer opens the same authorized Tech & Digital → M365 & SPFx post as Devon. This remains separate from Department misplaced-upload cleanup.

## Planning & Reporting

One new channel belongs to the existing Planning Cycle Team. It is pinned by default only for **Robin Avery — Executive Director** and **Sam Patel — Finance Operations Specialist**. Existing default landing contexts remain. Frontline Sales Adviser, Technology & Engineering Administrator and other unrelated roles do not gain channel membership.

Planning Home uses the existing restrained Teams panel pattern. Open in SharePoint returns to the current person’s Planning workspace. Team identity uses the established colour-varied WorkspaceIcon.

### Canonical destinations

- Department submissions reuses **2027 Annual Planning / Department submissions**, with six department folders and their original submission files. No duplicate List or submission records were created.
- Logframe reuses **planning-11 — Organisation-wide Logframe 2027.xlsx**. Its guided view shows one outcome at a time, preserves preview target edits between outcomes and identifies missing targets. Existing document links still work.
- Shared references the original six submissions, Planning guidance, Logframe and reporting template, with canonical IDs and sensitivity labels.
- Restricted Planning, workforce scenarios and executive pre-decision work remain separate and do not enter this channel’s posts or Shared view.

### Conversation history

| Author | Role | Post |
| --- | --- | --- |
| Amina Reed | Financial Planning Partner | Budget deadline, Department submissions and drop-ins; short thread about updating figures before the deadline. |
| Owen Clarke | CEO Support Officer | Check outcomes, indicators and targets; link to the existing Logframe. |
| Jordan Ellis | Planning Coordinator | Improved Logframe view; same content and deadlines, existing work remains. Sofia Bennett asks whether anything must move; Jordan confirms it does not. |
| Nina Foster | Network Coordinator | Strategy away-day requirements; separate registration form rather than personal details in Teams. |
| Jordan Ellis | Planning Coordinator | October reporting deadline update; existing reporting template. |

Posts span 12–16 October 2026, with short replies and named thumbs-up reactions. The Logframe update does not invalidate earlier guidance. Fictional authors do not become new Preview Roles.

### Preview limitations

The guided Logframe is an illustrative view of the existing file; edits remain in page memory until reload. The fictional registration form sends and stores nothing and exposes no responses. Neither connects to live Microsoft 365 or a business system.

## Verification

Local verification passed: npm run lint, npm run typecheck, all 646 tests across 73 suites, and npm run build. New Planning translation checks also passed after the final accessibility-label translations. Browser checks covered Welcome and Demo Controls FAQ entries, Enter/Space expansion, multiple open answers, fixed title and Close action, 375 × 740 German layout, the inline OneDrive thread, Planning Home and Teams, Robin/Sam/Maya role switching, Department submissions, guided Logframe, registration, Shared, Open in SharePoint and Sam’s denied Restricted Planning entry. Live deployment verification is recorded in the final response.
