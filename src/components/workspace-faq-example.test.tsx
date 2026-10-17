import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import WorkspaceFAQExample from "./WorkspaceFAQExample";
import WorkspaceFAQThread from "./WorkspaceFAQThread";
import { workspaceFAQExampleHref } from "./workspaceFAQContent";
import { technicalPosts } from "../workspaces/technicalTeams";
import { withExplicitStaff } from "../utils/staffNavigation";

afterEach(() => vi.unstubAllGlobals());

describe("inline FAQ Teams example", () => {
  it("starts with a collapsed disclosure instead of a navigation link", () => {
    const html = renderToStaticMarkup(
      createElement(WorkspaceFAQExample, { href: workspaceFAQExampleHref }),
    );
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("aria-controls=");
    expect(html).toContain("See an example in Teams");
    expect(html).toContain("hidden=");
    expect(html).not.toContain("href=");
    expect(html).not.toContain("Ari Morgan");
  });

  it("shows the existing exchange and removed attachment without creating a new conversation", () => {
    vi.stubGlobal("location", new URL("https://example.test/?staff=maya"));
    const post = technicalPosts.find(
      (message) => message.id === "digital-onedrive-review",
    )!;
    const html = renderToStaticMarkup(createElement(WorkspaceFAQThread));
    for (const message of [post, ...post.replies!]) {
      expect(html).toContain(message.author);
      expect(html).toContain(
        renderToStaticMarkup(createElement("p", null, message.text)),
      );
    }
    expect(html.match(/class="workspace-faq-thread-reply"/g)).toHaveLength(3);
    expect(html.match(/>MODERATOR</g)).toHaveLength(2);
    expect(html).toContain("<s>Provisioning Script Review.docx</s>");
    expect(html).toContain("Attachment removed");
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
