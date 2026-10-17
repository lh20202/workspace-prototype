import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ContentConversation from "./ContentConversation";
import { studioPosts } from "./conversations";
import { canAccessChannel, previewRoles } from "../access/policy";
import { germanTeamsStudio } from "../i18n/de-teams-studio";
import { peopleDirectory } from "../intranet/catalog";
import { resolveContentChannel } from "./channels";

const renderConversation = (channel: string) =>
  renderToStaticMarkup(
    <ContentConversation
      channel={channel}
      userName="Taylor Brooks"
      personId="taylor"
      query=""
      onOpenFile={() => {}}
    />,
  );

describe("Studio conversation fixtures", () => {
  it("keeps the existing German conversation coverage for every rewritten message", () => {
    for (const posts of Object.values(studioPosts)) {
      for (const post of posts) {
        for (const text of [post.text, post.reply?.text].filter(Boolean)) {
          expect(germanTeamsStudio[text!]).toBeTruthy();
          expect(germanTeamsStudio[text!]).not.toBe(text);
        }
      }
    }
  });

  it("keeps active selectable-role authors within their actual channel membership", () => {
    for (const [channel, posts] of Object.entries(studioPosts)) {
      if (resolveContentChannel(channel)?.lifecycle === "Archived") continue;
      for (const post of posts) {
        for (const name of [post.author, post.reply?.author].filter(Boolean)) {
          const selectable = previewRoles.find(
            (person) => person.name === name,
          );
          if (selectable)
            expect(canAccessChannel(selectable, "content", channel)).toBe(true);
        }
      }
    }
  });

  it("retains a specialist colleague without making her a selectable preview", () => {
    const colleague = peopleDirectory.find((person) => person.id === "nadia");
    expect(colleague?.role).toBe("Audience Researcher");
    expect(colleague?.departmentId).toBe("marketing-growth");
    expect(previewRoles.some((role) => role.id === colleague?.id)).toBe(false);
    const names = new Set(peopleDirectory.map((person) => person.name));
    for (const posts of Object.values(studioPosts))
      for (const post of posts) {
        expect(names.has(post.author)).toBe(true);
        if (post.reply) expect(names.has(post.reply.author)).toBe(true);
      }
  });

  it("renders only the reactions recorded on each post", () => {
    const articles = renderConversation("web").match(
      /<article\b[^>]*>[\s\S]*?<\/article>/g,
    )!;
    expect(articles).toHaveLength(studioPosts.web.length);
    for (const [index, post] of studioPosts.web.entries()) {
      expect(articles[index].match(/aria-label="React /g) || []).toHaveLength(
        post.reactions?.length || 0,
      );
      expect(articles[index].includes('aria-label="Like this post"')).toBe(
        !post.reactions?.length,
      );
    }
  });

  it("keeps archived coverage read-only after the editorial pass", () => {
    const html = renderConversation("community-week");
    expect(html).not.toContain("<textarea");
    expect(html).not.toContain("Reply to thread");
    expect(html).not.toContain(">Reply</button>");
    expect(html).toMatch(/aria-label="React [^"]+"[^>]*disabled=""/);
  });
});
