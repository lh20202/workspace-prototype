import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ContentConversation from "./ContentConversation";
import { studioPosts } from "./conversations";
import { canAccessChannel, previewRoles } from "../access/policy";
import { translateText } from "../i18n/translate";
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
          expect(translateText(text!, "de")).not.toBe(text);
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

  it("retains the Sales specialist’s existing research identity and authored collaboration", () => {
    const colleague = peopleDirectory.find((person) => person.id === "nadia");
    expect(colleague?.role).toBe("Audience Researcher");
    expect(colleague?.departmentId).toBe("marketing-growth");
    expect(previewRoles.find((role) => role.id === colleague?.id)?.role).toBe(
      "Sales & Marketing Specialist",
    );
    const names = new Set(peopleDirectory.map((person) => person.name));
    for (const posts of Object.values(studioPosts))
      for (const post of posts) {
        expect(names.has(post.author)).toBe(true);
        if (post.reply) expect(names.has(post.reply.author)).toBe(true);
      }
  });

  it("uses ordinary subject specialists with one concise creative exchange in each topic channel", () => {
    for (const channel of [
      "cities-mobility",
      "education-skills",
      "digital-society",
      "arts-culture",
    ]) {
      const posts = studioPosts[channel];
      expect(posts).toHaveLength(1);
      const specialist = peopleDirectory.find(
        (person) => person.name === posts[0].author,
      )!;
      expect(specialist).toBeTruthy();
      expect(previewRoles.some((person) => person.id === specialist.id)).toBe(
        false,
      );
      expect(specialist.role).toMatch(/Specialist|Adviser/);
      expect(posts[0].reply).toBeTruthy();
      expect(posts[0].handoff).toBeTruthy();
      expect(renderConversation(channel)).toContain(specialist.name);
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
