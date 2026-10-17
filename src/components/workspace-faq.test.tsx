import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import WorkspaceFAQ, { WorkspaceFAQContent } from "./WorkspaceFAQ";
import {
  creationExplanation,
  workspaceFAQQuestions,
  workspaceFAQGroups,
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
      const sentences = entry.answer
        .split(/[.!?]+/)
        .filter((part) => part.trim());
      expect(sentences.length).toBeGreaterThanOrEqual(1);
      expect(sentences.length).toBeLessThanOrEqual(3);
      const question = renderToStaticMarkup(
        createElement("span", null, entry.question),
      ).replace(/<\/?span>/g, "");
      expect(html).toContain(question);
    }
    expect(html).not.toContain("Could this be automated?");
    expect(html).not.toContain("<details");
    expect(proofOfConceptInfoText).not.toMatch(/prototype/i);
    expect(creationExplanation).toBe(
      "This demo was built with AI-assisted coding. No company data was used, and nothing is connected to live Microsoft 365 or business systems.",
    );
  });
  it("groups all requested questions into a repeatable, initially collapsed accordion", () => {
    const html = renderToStaticMarkup(createElement(WorkspaceFAQContent));
    expect(workspaceFAQGroups.map((group) => group.title)).toEqual([
      "FILES & ACCESS",
      "WORKING WITH OTHERS",
      "GETTING STARTED & SUPPORT",
    ]);
    expect(workspaceFAQGroups.map((group) => group.questions.length)).toEqual([
      13, 5, 4,
    ]);
    expect(workspaceFAQQuestions.map((entry) => entry.id)).toEqual([
      "file-access",
      "teams-or-workspaces",
      "personal-drives",
      "personal-drive-shared",
      "access-management",
      "role-changes",
      "sensitivity",
      "protected-information",
      "sharing-copies",
      "file-recovery",
      "finished-work",
      "shared-drive-migration",
      "existing-links",
      "international-colleagues",
      "external-collaboration",
      "teams-workspace-difference",
      "specialist-tools",
      "fewer-places",
      "finding-the-right-place",
      "new-workspace",
      "training",
      "technical-settings",
    ]);
    expect(new Set(workspaceFAQQuestions.map((entry) => entry.id)).size).toBe(
      22,
    );
    expect(html.match(/data-faq-id=/g)).toHaveLength(22);
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(22);
    expect(html).not.toContain('aria-expanded="true"');
    expect(html).not.toContain("What if a document is confidential?");
    expect(
      workspaceFAQQuestions.filter((entry) => entry.id === "sensitivity"),
    ).toHaveLength(1);
    expect(
      workspaceFAQQuestions.filter(
        (entry) => entry.id === "protected-information",
      ),
    ).toHaveLength(1);
  });
  it("keeps migration, recovery and support helpful without promising automatic fixes", () => {
    const answer = (id: string) =>
      workspaceFAQQuestions.find((entry) => entry.id === id)!.answer;
    expect(answer("shared-drive-migration")).toContain(
      "won't be expected to work out all of the destinations on your own",
    );
    expect(answer("existing-links")).toContain("reviewing old synced folders");
    expect(answer("existing-links")).not.toContain("automatically");
    expect(answer("file-recovery")).toContain("can often be restored");
    expect(answer("training")).toContain(
      "Workspace focal points will receive additional training",
    );
    expect(answer("technical-settings")).toContain(
      "relevant to their responsibilities",
    );
  });
  it("links to a real authorised human correction thread instead of a separate demo", () => {
    const url = new URL(workspaceFAQExampleHref, "https://example.test");
    expect(url.pathname).toBe("/teams");
    expect(url.searchParams.has("department")).toBe(false);
    expect(
      canAccessChannel(
        url.searchParams.get("staff")!,
        url.searchParams.get("workspace")!,
        url.searchParams.get("channel")!,
      ),
    ).toBe(true);
    const post = technicalPosts.find(
      (entry) => entry.id === url.searchParams.get("post"),
    );
    expect(post?.channel).toBe(url.searchParams.get("channel"));
    expect(post?.fileLink?.correctedFrom).toBe("onedrive");
    expect(post?.replies?.[0]).toMatchObject({ moderator: true });
    expect(post?.replies?.[0].text).toContain(
      "link points to your personal OneDrive",
    );
    expect(
      post?.replies?.some((reply) =>
        reply.text.includes("didn't realise I'd shared the OneDrive link"),
      ),
    ).toBe(true);
    expect(
      post?.replies?.some((reply) =>
        reply.link?.href.includes("file=digital-F17"),
      ),
    ).toBe(true);
  });
});
