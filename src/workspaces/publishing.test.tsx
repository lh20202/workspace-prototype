import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  publishingConfig,
  publishingPurpose,
  environmentReviews,
} from "./publishing";
import { publishingChannels, publishingPosts } from "./publishingTeams";
import { configById } from "./config";
import {
  functionalLibraries,
  functionalFileHref,
  libraryForFile,
} from "./siteArchitecture";
import { environmentsForHub, workspaceById } from "./registry";
import { prototypeForPath } from "../utils/routes";
import { germanPublishing } from "../i18n/de-publishing";
import { translateText } from "../i18n/translate";
import PublishingReviewRegister from "./PublishingReviewRegister";
import TechnicalConversation from "./TechnicalConversation";
import FunctionalApp from "./FunctionalApp";

afterEach(() => vi.unstubAllGlobals());

describe("active workspace, intranet and wiki moderation", () => {
  it("renders the controlled home and list for the technical role and denies ordinary staff", () => {
    const render = (path: string) => {
      vi.stubGlobal("location", new URL(path, "https://example.test"));
      vi.stubGlobal("sessionStorage", { getItem: () => "taylor" });
      return renderToStaticMarkup(createElement(FunctionalApp));
    };
    const denied = render("/workspace-publishing?staff=taylor");
    expect(denied).toContain("Access required");
    expect(denied).not.toContain("Current moderation");
    expect(denied).not.toContain(publishingConfig.files[0].name);
    const home = render("/workspace-publishing?staff=devon");
    expect(home).toContain("Current moderation");
    expect(home).toContain("Recent working files");
    expect(home).toContain("Moderator coordination in Teams");
    expect(home).toContain("Environment Review Register");
    expect(home).not.toContain('class="access-boundary');
    expect(home).toContain(
      'href="/workspace-publishing/workspace-coordination?staff=devon"',
    );
    const register = render("/workspace-publishing/reviews?staff=devon");
    expect(register).toContain('aria-label="Environment Review Register"');
    expect(register).toContain("Private library request");
    expect(register).not.toContain('class="access-boundary');
  });
  it("adds one controlled operational workspace to Infrastructure without introducing a new Wiki", () => {
    const workspace = workspaceById.get("publishing")!;
    expect(workspace).toMatchObject({
      href: "/workspace-publishing",
      title: "Workspace, Intranet & Wiki Coordination",
      hubId: "infrastructure",
      hubLabel: "Workspace & Publishing",
      accessLevel: "internal",
      teams: true,
      purpose: publishingPurpose,
    });
    const infrastructure = environmentsForHub("infrastructure");
    expect(infrastructure.slice(-3).map((item) => item.id)).toEqual([
      "digital",
      "publishing",
      "archives",
    ]);
    expect(
      infrastructure.every((item) => item.environmentType === "workspace"),
    ).toBe(true);
    expect(prototypeForPath("/workspace-publishing/reviews")).toBe(
      "functional",
    );
  });

  it("uses two folder-first libraries and one small structured review register", () => {
    expect(configById.get("publishing")).toBe(publishingConfig);
    expect(
      functionalLibraries.publishing.map((library) => library.name),
    ).toEqual(["Workspace Coordination", "Publishing & Ownership"]);
    expect(environmentReviews).toHaveLength(5);
    expect(publishingConfig.files).toHaveLength(7);
    for (const file of publishingConfig.files) {
      expect(file.folder.split("/")).toHaveLength(2);
      const library = libraryForFile(publishingConfig, file.id)!;
      expect(library.areas).toContain(file.area);
      expect(functionalFileHref(publishingConfig, file.id)).toContain(
        `/workspace-publishing/${library.id}?`,
      );
      expect(file.sensitivity).toBe("Internal");
    }
    expect(publishingConfig.tools).toEqual([]);
    expect(
      publishingConfig.files.some((file) =>
        /credential|SPFx|provision|tenant|source code/i.test(file.name),
      ),
    ).toBe(false);
  });

  it("uses six durable channels and the existing common Teams conversation grammar", () => {
    expect(publishingChannels).toHaveLength(6);
    for (const channel of publishingChannels) {
      expect(publishingPosts.some((post) => post.channel === channel)).toBe(
        true,
      );
      const html = renderToStaticMarkup(
        createElement(TechnicalConversation, {
          channel,
          userName: "Devon Park",
          messages: publishingPosts,
        }),
      );
      expect(html).toContain('class="m365-teams-post"');
      expect(html).toContain("Reply");
      expect(html).toContain("Start a post");
    }
    expect(
      publishingPosts.some((post) => post.text.includes("private library")),
    ).toBe(true);
    expect(
      publishingPosts.some((post) => post.text.includes("closed projects")),
    ).toBe(true);
  });

  it("keeps review context and owners in a real list with current-role navigation", () => {
    vi.stubGlobal(
      "location",
      new URL("https://example.test/workspace-publishing/reviews?staff=devon"),
    );
    const html = renderToStaticMarkup(createElement(PublishingReviewRegister));
    expect(html).toContain('aria-label="Environment Review Register"');
    expect(html).toContain("Moderator");
    expect(html).toContain("Review due");
    expect(html).toContain('href="/projects?staff=devon"');
    expect(html).toContain("Harper Cole");
    expect(html).not.toContain("Infrastructure Wiki");
  });

  it("provides clear German for workspace, list and moderation content", () => {
    expect(germanPublishing["Workspace & Publishing"]).toBe(
      "Arbeitsbereiche & Veröffentlichung",
    );
    expect(germanPublishing[publishingPurpose]).toContain("Zuständigkeiten");
    for (const channel of publishingChannels.filter(
      (name) => name !== "General",
    ))
      expect(germanPublishing[channel]).toBeTruthy();
    for (const post of publishingPosts)
      expect(germanPublishing[post.text]).toBeTruthy();
    for (const file of publishingConfig.files) {
      expect(translateText(file.name, "de")).not.toBe(file.name);
      expect(translateText(file.folder, "de")).not.toBe(file.folder);
    }
  });
});
