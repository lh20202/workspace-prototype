import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import DepartmentChannel, { NamedAcknowledgement } from "./DivisionChannel";
import { departments } from "./data";
import { staff } from "../intranet/catalog";

afterEach(() => vi.unstubAllGlobals());

describe("department correction thread rendering", () => {
  it("keeps both Theo moderator replies and Casey's canonical link inside one post", () => {
    vi.stubGlobal(
      "location",
      new URL(
        "/teams?staff=devon&department=STT&tab=Posts",
        "https://example.test",
      ),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => "devon" });
    const original = departments.find(
      (department) => department.id === "strategy-technology",
    )!;
    const post = original.posts.find(
      (item) => item.id === "strategy-technology-misfiled",
    )!;
    const html = renderToStaticMarkup(
      createElement(DepartmentChannel, {
        department: { ...original, posts: [post] },
        person: staff.find((person) => person.id === "devon")!,
        tab: "Posts",
        onTabChange: () => {},
      }),
    );
    expect(html.match(/class="m365-teams-post coord-post"/g)).toHaveLength(1);
    expect(html.match(/class="coord-moderator-badge"/g)).toHaveLength(2);
    expect(
      html.match(/aria-label="Moderator reply from Theo Walker"/g),
    ).toHaveLength(2);
    expect(html).toContain('aria-label="Reply from Casey Blake"');
    const href = new URL(post.replies![0].link!.href, "https://example.test");
    href.searchParams.set("staff", "devon");
    expect(html).toContain(
      `href="${href.pathname}${href.search.replaceAll("&", "&amp;")}"`,
    );
    expect(html).toContain('class="coord-attachment coord-attachment-removed"');
    expect(html).toContain("<s>Supplier Onboarding Checklist.docx</s>");
    expect(html).toContain("Attachment removed");
    expect(html).not.toMatch(/<button[^>]*class="coord-attachment"/);
  });

  it("identifies the seeded thumbs-up colleague on hover and to screen readers", () => {
    const html = renderToStaticMarkup(
      createElement(NamedAcknowledgement, {
        names: ["Jamie Brooks"],
        person: "Maya Chen",
      }),
    );
    expect(html).toContain('title="Jamie Brooks"');
    expect(html).toContain('aria-label="Liked by Jamie Brooks"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("👍 1");
    expect(html).not.toContain("thread-reply");
  });
});
