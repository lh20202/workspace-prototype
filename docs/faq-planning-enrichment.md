# FAQ and Planning & Reporting handover

This remains an exploratory Digital Workspace proof of concept. The current working tree, established architecture and role boundaries were preserved. The polish-website skill was not used.

## FAQ (simplified 19 October 2026)

Welcome and Demo Controls open the same compact FAQ popup. Two normal questions cover external collaboration and focal points; one fictional submitted question demonstrates sharing a link across departments. All three use the same expandable pattern, with no categories or introductory design note.

The anonymous form accepts only a question. Submitting a nonblank question clears the field and displays a local success message. It sends no network request, writes no storage and does not insert new FAQ entries. Nothing is retained after the acknowledgement. English and German use the same concise structure.

The former long FAQ, embedded channel example and FAQ-only links have been removed. The original personal-drive correction conversation remains available in its channel; broader access logic and workspace features are unchanged.

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

FAQ reset (19 October 2026): all 928 tests across 89 suites passed, together with full lint, type checking and a production build. Local browser checks covered both popup entry points, keyboard expansion, all three answers, blank-submission prevention, successful acknowledgement and field clearing in English and German. At a 1280 × 720 laptop viewport, the collapsed questions and complete form fit without scrolling. Live deployment verification is recorded in the final response.

Anonymity and technology agnostic correction (18 October 2026): all 931 tests across 90 suites passed, plus type checking, lint and a production build. Automated scans found no real organisation-name references in 223 production source text files, 12 public text assets or 72 built text files. Both languages were checked in all 23 expanded FAQ answers, the inline personal-drive example, loaded workspace and Wiki pages, the portal, directory and nine tool destinations, including accessible labels. Neutral site and channel marks replace the product logos. Anonymity and source-wide display terminology checks now gate each production build.

FAQ revision (18 October 2026): 46 relevant tests across 7 suites passed, along with type checking, lint for changed source files and a production build. Browser checks covered Welcome, English and German questions and answers, keyboard expansion, multiple open answers, the fictional channel example, the two-paragraph Wiki explanation and a 375 × 800 German dialog with a visible Close action and no horizontal overflow.

Original enrichment verification: Local verification passed: npm run lint, npm run typecheck, all 646 tests across 73 suites, and npm run build. New Planning translation checks also passed after the final accessibility-label translations. Browser checks covered Welcome and Demo Controls FAQ entries, Enter/Space expansion, multiple open answers, fixed title and Close action, 375 × 740 German layout, the inline OneDrive thread, Planning Home and Teams, Robin/Sam/Maya role switching, Department submissions, guided Logframe, registration, Shared, Open in SharePoint and Sam’s denied Restricted Planning entry. Live deployment verification is recorded in the final response.
