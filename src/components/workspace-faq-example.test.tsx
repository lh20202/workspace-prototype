import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import WorkspaceFAQExample from "./WorkspaceFAQExample";
import WorkspaceFAQThread from "./WorkspaceFAQThread";
import { workspaceFAQExampleHref } from "./workspaceFAQContent";
import { technicalPosts } from "../workspaces/technicalTeams";
import { configById } from "../workspaces/config";
import { functionalFileHref } from "../workspaces/siteArchitecture";
import { withExplicitStaff } from "../utils/staffNavigation";
import { formatPublicTerminology } from "../i18n/publicTerminology";
import { formatDisplayPunctuation } from "../i18n/displayPunctuation";

afterEach(() => vi.unstubAllGlobals());

describe("inline FAQ Teams example", () => {
  it("starts with a collapsed disclosure instead of a navigation link", () => {
    const html = renderToStaticMarkup(
      createElement(WorkspaceFAQExample, { href: workspaceFAQExampleHref }),
    );
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("aria-controls=");
    expect(html).toContain("See an example");
    expect(html).toContain("hidden=");
    expect(html).not.toContain("href=");
    expect(html).not.toContain("Ari Morgan");
  });

  it("shows the same OneDrive-link exchange as the full demo without a Department upload error", () => {
    vi.stubGlobal("location", new URL("https://example.test/?staff=maya"));
    const example = new URL(workspaceFAQExampleHref, "https://example.test");
    const post = technicalPosts.find(
      (message) => message.id === example.searchParams.get("post"),
    )!;
    const html = renderToStaticMarkup(createElement(WorkspaceFAQThread));
    for (const message of [post, ...post.replies!]) {
      expect(html).toContain(message.author);
      expect(html).toContain(
        renderToStaticMarkup(
          createElement(
            "p",
            null,
            formatDisplayPunctuation(
              formatPublicTerminology(message.text, "en"),
              "en",
            ),
          ),
        ),
      );
    }
    expect(html).toContain("Dev.");
    expect(html).toContain("Workplace platforms &amp; SPFx");
    expect(html).toContain('aria-label="Channel exchange"');
    expect(html.replace(/<[^>]*>/g, "")).not.toMatch(
      /\b(?:Teams|SharePoint|Microsoft|M365)\b/i,
    );
    expect(html.match(/class="workspace-faq-thread-reply"/g)).toHaveLength(3);
    expect(html.match(/>MODERATOR</g)).toHaveLength(2);
    expect(html).toContain("Edited");
    expect(html).toContain(
      withExplicitStaff(
        functionalFileHref(configById.get("digital")!, post.fileLink!.fileId),
      ).replaceAll("&", "&amp;"),
    );
    expect(html).not.toContain("needed to give Leonie access");
    expect(html).not.toMatch(/Department|Attachment removed|<s>/);
    expect(html).toContain("OneDrive");
    expect(html).not.toMatch(/<button|<input|<textarea|<form|id="post-/);
    for (const reply of post.replies!) {
      if (reply.link)
        expect(html).toContain(
          withExplicitStaff(reply.link.href).replaceAll("&", "&amp;"),
        );
    }
    expect(location.search).toBe("?staff=maya");
  });
});
