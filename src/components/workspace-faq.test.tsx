import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import WorkspaceFAQ, { WorkspaceFAQContent } from "./WorkspaceFAQ";
import {
  creationExplanation,
  workspaceFAQQuestions,
  workspaceFAQExampleHref,
} from "./workspaceFAQContent";
import { technicalPosts } from "../workspaces/technicalTeams";
import { canAccessChannel } from "../access/policy";
import Launcher from "../intranet/Launcher";
import PrototypeNavigator from "./PrototypeNavigator";
import { proofOfConceptInfoText } from "./DemoInfo";

afterEach(() => vi.unstubAllGlobals());
describe("shared staff-facing Workspace FAQ", () => {
  it("offers the same named dialog trigger on Welcome and immediately after All workspaces", () => {
    vi.stubGlobal("location", new URL("https://example.test/planning"));
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    const launcher = renderToStaticMarkup(createElement(Launcher));
    const controls = renderToStaticMarkup(createElement(PrototypeNavigator));
    for (const html of [launcher, controls])
      expect(html).toMatch(
        /class="workspace-faq-link"[^>]*aria-haspopup="dialog"|aria-haspopup="dialog"[^>]*class="workspace-faq-link"/,
      );
    expect(controls.indexOf('class="workspace-faq-link"')).toBeGreaterThan(
      controls.indexOf("All workspaces"),
    );
    expect(controls.indexOf('class="workspace-faq-link"')).toBeLessThan(
      controls.indexOf("prototype-utilities"),
    );
    const trigger = renderToStaticMarkup(createElement(WorkspaceFAQ));
    expect(trigger).toContain("Workspace FAQ");
    expect(trigger).not.toContain(workspaceFAQQuestions[0].question);
  });
  it("keeps answers short and staff-focused without an automation section", () => {
    const html = renderToStaticMarkup(createElement(WorkspaceFAQContent));
    for (const entry of workspaceFAQQuestions) {
      expect(
        entry.answer.split(/[.!?]+/).filter((part) => part.trim()),
      ).toHaveLength(2);
      expect(html).toContain(entry.question);
    }
    expect(html).not.toContain("Could this be automated?");
    expect(html).not.toContain("<details");
    expect(proofOfConceptInfoText).not.toMatch(/prototype/i);
    expect(creationExplanation).toBe(
      "This demo was built with AI-assisted coding. No company data was used, and nothing is connected to live Microsoft 365 or business systems.",
    );
  });
  it("links to a real authorised human correction thread instead of a separate demo", () => {
    const url = new URL(workspaceFAQExampleHref, "https://example.test");
    expect(url.pathname).toBe("/teams");
    expect(url.searchParams.get("workspace")).toBe("digital");
    expect(
      canAccessChannel(
        url.searchParams.get("staff")!,
        "digital",
        url.searchParams.get("channel")!,
      ),
    ).toBe(true);
    const post = technicalPosts.find(
      (entry) => entry.id === url.searchParams.get("post"),
    );
    expect(post?.attachment?.source).toBe("onedrive");
    expect(post?.text).toContain("needed to give Leonie access");
    expect(
      post?.replies?.some(
        (reply) => reply.moderator && reply.text.includes("already has access"),
      ),
    ).toBe(true);
    expect(
      post?.replies?.some((reply) =>
        reply.link?.href.includes("file=digital-F17"),
      ),
    ).toBe(true);
  });
});
