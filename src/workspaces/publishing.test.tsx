import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { migratedPublishingFiles } from "./publishing";
import { configById, functionalConfigs } from "./config";
import {
  functionalLibraries,
  functionalFileHref,
  libraryForFile,
} from "./siteArchitecture";
import { workspaceById } from "./registry";
import { moderatorChannel, publishingLegacyHref } from "./publishingRetirement";
import { technicalChannels, technicalPosts } from "./technicalTeams";
import { canAccessChannel } from "../access/policy";
import { translateText } from "../i18n/translate";
import TechnicalConversation from "./TechnicalConversation";
import FunctionalApp from "./FunctionalApp";
import TeamsPreview from "../intranet/TeamsPreview";

afterEach(() => vi.unstubAllGlobals());

describe("moderation belongs to Tech & Digital, with legacy content kept canonical", () => {
  it("retires the separate site, config, libraries and Team", () => {
    expect(workspaceById.has("publishing")).toBe(false);
    expect(configById.has("publishing")).toBe(false);
    expect(functionalLibraries.publishing).toBeUndefined();
    expect(technicalChannels).toContain(moderatorChannel);
    expect(canAccessChannel("devon", "publishing", "Wiki Moderation")).toBe(
      false,
    );
    expect(canAccessChannel("leonie", "digital", moderatorChannel)).toBe(true);
    expect(canAccessChannel("taylor", "digital", moderatorChannel)).toBe(false);
  });

  it("moves each original file once into the existing Architecture & Decisions library", () => {
    const digital = configById.get("digital")!;
    expect(migratedPublishingFiles.map((file) => file.id)).toEqual(
      Array.from({ length: 7 }, (_, index) => `publishing-F${index + 1}`),
    );
    for (const file of migratedPublishingFiles) {
      expect(
        functionalConfigs
          .flatMap((config) => config.files)
          .filter((candidate) => candidate.id === file.id),
      ).toEqual([file]);
      expect(file.area).toBe("information-architecture");
      expect(file.sensitivity).toBe("Internal");
      expect(libraryForFile(digital, file.id)?.id).toBe(
        "architecture-documents",
      );
      const target = new URL(
        functionalFileHref(digital, file.id),
        "https://example.test",
      );
      expect(target.pathname).toBe("/digital-tech/architecture-documents");
      expect(target.searchParams.get("file")).toBe(file.id);
      expect(target.searchParams.get("folder")).toBe(file.folder);
    }
  });

  it("preserves role, file and useful query context from retired site and Team links", () => {
    expect(publishingLegacyHref("/workspace-publishing", "?staff=leonie")).toBe(
      "/digital-tech/architecture-documents?staff=leonie",
    );
    const file = migratedPublishingFiles[0];
    for (const path of [
      "/workspace-publishing/workspace-coordination",
      "/workspace-publishing/workspace-reviews",
      "/workspace-publishing/reviews/",
    ]) {
      const target = new URL(
        publishingLegacyHref(
          path,
          `?staff=devon&file=${file.id}&view=review&lang=de`,
        )!,
        "https://example.test",
      );
      expect(target.pathname).toBe("/digital-tech/architecture-documents");
      expect(target.searchParams.get("staff")).toBe("devon");
      expect(target.searchParams.get("file")).toBe(file.id);
      expect(target.searchParams.get("folder")).toBe(file.folder);
      expect(target.searchParams.get("view")).toBe("review");
      expect(target.searchParams.get("lang")).toBe("de");
    }
    for (const path of ["/teams", "/workspace-publishing/teams"]) {
      const target = new URL(
        publishingLegacyHref(
          path,
          `?staff=leonie&workspace=publishing&channel=Wiki+Moderation&file=${file.id}&tab=Shared`,
        )!,
        "https://example.test",
      );
      expect(target.pathname).toBe("/teams");
      expect(target.searchParams.get("workspace")).toBe("digital");
      expect(target.searchParams.get("channel")).toBe(moderatorChannel);
      expect(target.searchParams.get("staff")).toBe("leonie");
      expect(target.searchParams.get("file")).toBe(file.id);
      expect(target.searchParams.get("tab")).toBe("Shared");
    }
    expect(
      publishingLegacyHref("/digital-tech", "?staff=leonie"),
    ).toBeUndefined();
  });

  it("shows the natural Policy rollout thread in the durable coordination channel", () => {
    const html = renderToStaticMarkup(
      createElement(TechnicalConversation, {
        channel: moderatorChannel,
        userName: "Leonie Fischer",
      }),
    );
    expect(html).toContain("Leonie Fischer");
    expect(html).toContain("Approval status");
    expect(html).toContain("@Jordan @Elena");
    expect(html).toContain("archived policy library");
    expect(html).toContain("archive stays as-is");
    expect(html).toContain('class="m365-teams-reply"');
    expect(html).toContain("Reply");
    expect(html).toContain("Start a post");
  });

  it("renders migrated canonical files with normal information-architecture access", () => {
    vi.stubGlobal(
      "location",
      new URL(
        "https://example.test/digital-tech/architecture-documents?staff=leonie",
      ),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => "leonie" });
    const html = renderToStaticMarkup(createElement(FunctionalApp));
    expect(html).not.toContain('class="access-boundary');
    expect(html).toContain("Workspace reviews");
  });

  it("opens one migrated canonical file in moderator Shared, while unjoined roles stay denied", () => {
    const file = migratedPublishingFiles[2];
    const target = publishingLegacyHref(
      "/teams",
      `?staff=leonie&workspace=publishing&channel=Wiki+Moderation&tab=Shared&file=${file.id}`,
    )!;
    vi.stubGlobal("location", new URL(target, "https://example.test"));
    vi.stubGlobal("sessionStorage", { getItem: () => "leonie" });
    const allowed = renderToStaticMarkup(createElement(TeamsPreview));
    expect(allowed).toContain(file.name);
    expect(allowed).toContain("Architecture &amp; Decisions");
    expect(allowed).not.toContain('class="access-boundary');
    vi.stubGlobal(
      "location",
      new URL(
        target.replace("staff=leonie", "staff=taylor"),
        "https://example.test",
      ),
    );
    const denied = renderToStaticMarkup(createElement(TeamsPreview));
    expect(denied).toContain("Access required");
    expect(denied).not.toContain(file.name);
    expect(denied).not.toContain('class="document-library');
  });

  it("translates the new channel, role and Policy conversation naturally", () => {
    for (const text of ["Information Advisory Specialist", moderatorChannel])
      expect(translateText(text, "de")).not.toBe(text);
    const post = technicalPosts.find(
      (message) => message.author === "Leonie Fischer",
    )!;
    expect(translateText(post.text, "de")).toContain("Genehmigungsstatus");
    for (const reply of post.replies || [])
      expect(translateText(reply.text, "de")).not.toBe(reply.text);
    for (const file of migratedPublishingFiles) {
      expect(translateText(file.name, "de")).not.toBe(file.name);
      expect(translateText(file.folder, "de")).not.toBe(file.folder);
    }
  });
});
