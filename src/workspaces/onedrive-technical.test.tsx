import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { technicalPosts } from "./technicalTeams";
import { configById, functionalConfigs } from "./config";
import { functionalFileHref, libraryForFile } from "./siteArchitecture";
import { canAccessArea, canAccessChannel } from "../access/policy";
import { germanOneDriveTechnical } from "../i18n/de-onedrive-technical";
import TechnicalConversation from "./TechnicalConversation";
import TeamsPreview from "../intranet/TeamsPreview";

const oneDrivePosts = technicalPosts.filter(
  (post) => post.attachment?.source === "onedrive",
);
afterEach(() => vi.unstubAllGlobals());

describe("occasional OneDrive sharing in a functional Team", () => {
  it("adds one historical source reference, reusing one real shared file", () => {
    expect(oneDrivePosts).toHaveLength(1);
    const post = oneDrivePosts[0];
    const config = configById.get("digital")!;
    const file = config.files.find(
      (candidate) => candidate.id === post.attachment!.fileId,
    )!;
    expect(file).toBeDefined();
    expect(post.attachment?.removed).toBe(true);
    expect(
      functionalConfigs
        .flatMap((workspace) => workspace.files)
        .filter((candidate) => candidate.id === file.id),
    ).toEqual([file]);
    expect(libraryForFile(config, file.id)?.areas).toContain(file.area);
    const links = post.replies!.flatMap((reply) =>
      reply.link ? [reply.link] : [],
    );
    expect(links).toHaveLength(2);
    const canonical = new URL(
      functionalFileHref(config, file.id),
      "https://example.test",
    );
    const folder = new URL(links[0].href, canonical.origin);
    const workingCopy = new URL(links[1].href, canonical.origin);
    expect(folder.pathname).toBe(canonical.pathname);
    expect(folder.searchParams.get("folder")).toBe(file.folder);
    expect(folder.searchParams.has("file")).toBe(false);
    expect(workingCopy.href).toBe(canonical.href);
    for (const role of ["devon", "leonie"]) {
      expect(canAccessChannel(role, "digital", post.channel)).toBe(true);
      expect(canAccessArea(role, "digital", file.area)).toBe(true);
    }
  });

  it("keeps ordinary provider attribution with human moderator replies and real links", () => {
    vi.stubGlobal(
      "location",
      new URL(
        "https://example.test/teams?staff=devon&workspace=digital&channel=M365+%26+SPFx&tab=Posts",
      ),
    );
    const post = oneDrivePosts[0];
    const html = renderToStaticMarkup(
      createElement(TechnicalConversation, {
        channel: post.channel,
        messages: [post],
      }),
    );
    expect(html).toContain(
      'class="m365-teams-attachment teams-attachment-removed"',
    );
    expect(html).toContain('class="teams-file-provider"');
    expect(html).toContain("Attachment removed");
    expect(html).toContain("OneDrive");
    expect(html.match(/class="teams-moderator-badge"/g)).toHaveLength(2);
    expect(html.match(/class="m365-teams-reply"/g)).toHaveLength(3);
    expect(html).toContain("file=digital-F17&amp;staff=devon");
    expect(html).not.toContain('href="https://onedrive');
    expect(html.indexOf('class="teams-file-provider"')).toBeLessThan(
      html.indexOf('class="m365-teams-reply"'),
    );
  });

  it("does not expose the example to roles outside this technical channel", () => {
    for (const role of ["taylor", "maya", "robin", "jamie"]) {
      vi.stubGlobal(
        "location",
        new URL(
          `https://example.test/teams?staff=${role}&workspace=digital&channel=M365+%26+SPFx&tab=Posts`,
        ),
      );
      vi.stubGlobal("sessionStorage", { getItem: () => role });
      const html = renderToStaticMarkup(createElement(TeamsPreview));
      expect(html).toContain("Access required");
      expect(html).not.toContain("OneDrive source");
      expect(html).not.toContain(oneDrivePosts[0].text);
    }
  });

  it("provides German for the complete short exchange", () => {
    const post = oneDrivePosts[0];
    for (const text of [post.text, ...post.replies!.map((reply) => reply.text)])
      expect(germanOneDriveTechnical[text]).toBeTruthy();
    expect(germanOneDriveTechnical[post.replies![0].link!.label]).toBeTruthy();
  });
});
