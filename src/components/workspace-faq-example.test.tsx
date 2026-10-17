import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import WorkspaceFAQExample from "./WorkspaceFAQExample";
import WorkspaceFAQThread from "./WorkspaceFAQThread";
import { workspaceFAQExampleHref } from "./workspaceFAQContent";
import { resolveDepartment } from "../coordination/data";
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
    expect(html).toContain("See an example");
    expect(html).toContain("hidden=");
    expect(html).not.toContain("href=");
    expect(html).not.toContain("Taylor Brooks");
  });

  it("shows the existing exchange and removed attachment without creating a new conversation", () => {
    vi.stubGlobal("location", new URL("https://example.test/?staff=maya"));
    const post = resolveDepartment("marketing-growth")!.posts.find(
      (message) => message.id === "marketing-growth-onedrive",
    )!;
    const html = renderToStaticMarkup(createElement(WorkspaceFAQThread));
    for (const message of [post, ...post.replies!]) {
      expect(html).toContain(message.author);
      expect(html).toContain(
        renderToStaticMarkup(createElement("p", null, message.text)),
      );
    }
    expect(html).toContain(
      renderToStaticMarkup(createElement("p", null, post.moderatorReply)),
    );
    expect(html).toContain("MCG Department");
    expect(html.match(/class="workspace-faq-thread-reply"/g)).toHaveLength(3);
    expect(html.match(/>MODERATOR</g)).toHaveLength(2);
    expect(html).toContain(`<s>${post.upload!.name}</s>`);
    expect(html).not.toContain("needed to give Leonie access");
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
