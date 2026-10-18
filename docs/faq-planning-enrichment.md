# FAQ and Planning & Reporting handover

This remains an exploratory Digital Workspace proof of concept. The current working tree, established architecture and role boundaries were preserved. The polish-website skill was not used.

## FAQ (revised 18 October 2026)

Welcome and Demo Controls open the same accessible FAQ dialog. Its 23 questions start collapsed, multiple answers can stay open, and the fixed title and Close action remain outside the scrolling content.

The revised copy follows the supplied staff FAQ: it separates established design principles from the proposed approach and arrangements still being developed or approved. It explains shared work, approved knowledge, protected information and specialist systems without implying that everything will migrate to SharePoint. Personal data is not automatically Strictly Confidential. Most administrative responsibilities sit with designated colleagues, IKM, IT and specialists.

Welcome now explains the early design stage and demonstration content. “What am I looking at?” describes the simulated experience. The same early-design note appears inside the FAQ for visitors opening it from another page.

### Files & access

- Is this replacing our existing sites, channels and folders on the shared drive?
- Who can see my files?
- Where do personal drives fit in?
- What if someone shares a personal drive file anyway?
- What happens when someone joins, leaves or changes roles?
- How do I know how sensitive a document is?
- Where do I save personal data or Strictly Confidential information?
- Do I need to make a copy before sharing a document with another team?
- What happens if I accidentally delete or overwrite something?
- What happens to files when a project or piece of work finishes?
- What happens to files in our current shared drive?
- What happens to my existing links, bookmarks and synced folders?

### Working with others

- Can I work with colleagues in other countries?
- Can I work with people outside the company?
- What's the difference between channels and a workspace?
- What's the difference between a Workspace and a Wiki?
- I work with lots of different tools and platforms. How do they fit in?
- I already work in lots of sites and channels. Will this add even more?

### Getting started & support

- Who are focal points?
- What if I don't know which workspace something belongs in?
- How do I create a new workspace if I need one?
- Will my team and I get training?
- Do I need to learn the technical settings?

### Language and examples

All questions, answers and orientation copy have reviewed German equivalents. Organisation references use “the company” or the natural German equivalent. The FAQ uses the shared technology agnostic display wording: sites, channels, libraries and personal drives. A build check prevents real organisation names from being reintroduced into shipped copy or asset names. Routes and access rules are unchanged.

“See an example” still expands the existing Ari Morgan / Devon Park conversation and links to the same authorised Dev. channel post. A new note identifies it as a fictional illustration, not an agreed support process. The canonical file, post, Preview Role and access checks are unchanged.

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

Anonymity and technology agnostic correction (18 October 2026): all 931 tests across 90 suites passed, plus type checking, lint and a production build. Automated scans found no real organisation-name references in 223 production source text files, 12 public text assets or 72 built text files. Both languages were checked in all 23 expanded FAQ answers, the inline personal-drive example, loaded workspace and Wiki pages, the portal, directory and nine tool destinations, including accessible labels. Neutral site and channel marks replace the product logos. Anonymity and source-wide display terminology checks now gate each production build.

FAQ revision (18 October 2026): 46 relevant tests across 7 suites passed, along with type checking, lint for changed source files and a production build. Browser checks covered Welcome, English and German questions and answers, keyboard expansion, multiple open answers, the fictional channel example, the two-paragraph Wiki explanation and a 375 × 800 German dialog with a visible Close action and no horizontal overflow.

Original enrichment verification: Local verification passed: npm run lint, npm run typecheck, all 646 tests across 73 suites, and npm run build. New Planning translation checks also passed after the final accessibility-label translations. Browser checks covered Welcome and Demo Controls FAQ entries, Enter/Space expansion, multiple open answers, fixed title and Close action, 375 × 740 German layout, the inline OneDrive thread, Planning Home and Teams, Robin/Sam/Maya role switching, Department submissions, guided Logframe, registration, Shared, Open in SharePoint and Sam’s denied Restricted Planning entry. Live deployment verification is recorded in the final response.
