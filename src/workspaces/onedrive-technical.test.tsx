import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { technicalPosts } from "./technicalTeams";
import { configById, functionalConfigs } from "./config";
import { functionalFileHref, libraryForFile } from "./siteArchitecture";
import {
  canAccessArea,
  canAccessChannel,
  isChannelPinnedForRole,
  previewRoles,
} from "../access/policy";
import { germanOneDriveTechnical } from "../i18n/de-onedrive-technical";
import TechnicalConversation from "./TechnicalConversation";
import TeamsPreview from "../intranet/TeamsPreview";

const oneDrivePosts = technicalPosts.filter(
  (post) => post.fileLink?.correctedFrom === "onedrive",
);
const technicalConversationHref =
  "/teams?staff=devon&workspace=digital&channel=M365%20%26%20SPFx&tab=Posts&post=digital-onedrive-review";

afterEach(() => vi.unstubAllGlobals());

describe("occasional OneDrive sharing in a functional Team", () => {
  it("corrects one personal OneDrive link, reusing one real shared file", () => {
    expect(oneDrivePosts).toHaveLength(1);
    const post = oneDrivePosts[0];
    const config = configById.get("digital")!;
    const file = config.files.find(
      (candidate) => candidate.id === post.fileLink!.fileId,
    )!;
    expect(file).toBeDefined();
    expect(post.fileLink?.correctedFrom).toBe("onedrive");
    expect(post.text).not.toContain("OneDrive");
    expect(post.replies?.[0].text).toContain(
      "link points to your personal OneDrive",
    );
    expect(post.replies?.[1].text).toContain(
      "didn't realise I'd shared the OneDrive link",
    );
    expect(post.replies?.[1].text).toContain("updated my original post");
    expect(JSON.stringify(post)).not.toMatch(/attachment|Department|Leonie/);
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
    for (const role of previewRoles) {
      expect(canAccessChannel(role, "digital", post.channel)).toBe(true);
      expect(canAccessArea(role, "digital", file.area)).toBe(true);
    }
  });

  it("shows the edited original as a canonical link, with human moderator replies and no attachment removal", () => {
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
    expect(html).toContain("Edited");
    expect(html).not.toMatch(/Attachment removed|teams-attachment-removed|<s>/);
    expect(html).toContain("OneDrive");
    expect(html.match(/class="teams-moderator-badge"/g)).toHaveLength(2);
    expect(html.match(/class="m365-teams-reply"/g)).toHaveLength(3);
    expect(html).toContain("file=digital-F17&amp;staff=devon");
    expect(html).not.toContain('href="https://onedrive');
    expect(html.indexOf("file=digital-F17&amp;staff=devon")).toBeLessThan(
      html.indexOf('class="m365-teams-reply"'),
    );
  });

  it("keeps the personal-drive correction thread available in the full channel view", () => {
    vi.stubGlobal(
      "location",
      new URL(technicalConversationHref, "https://example.test"),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => "devon" });
    const html = renderToStaticMarkup(createElement(TeamsPreview));
    expect(html).toContain(`id="post-${oneDrivePosts[0].id}"`);
    expect(html).toContain(
      renderToStaticMarkup(
        createElement(
          "p",
          { style: { whiteSpace: "pre-line" } },
          oneDrivePosts[0].text,
        ),
      ),
    );
    expect(html).toContain("That link points to your personal OneDrive");
    expect(html).not.toContain("Attachment removed");
  });

  it("allows ordinary unpinned readers to explore the canonical correction exchange contextually", () => {
    for (const { id: role } of previewRoles) {
      vi.stubGlobal(
        "location",
        new URL(
          `https://example.test/teams?staff=${role}&context=workspace:digital&workspace=digital&channel=M365+%26+SPFx&tab=Posts`,
        ),
      );
      vi.stubGlobal("sessionStorage", { getItem: () => role });
      const html = renderToStaticMarkup(createElement(TeamsPreview));
      expect(html).not.toContain("Access required");
      expect(html).toContain(
        renderToStaticMarkup(
          createElement(
            "p",
            { style: { whiteSpace: "pre-line" } },
            oneDrivePosts[0].text,
          ),
        ),
      );
      expect(html).toContain("That link points to your personal OneDrive");
      expect(html).toContain(`file=digital-F17&amp;staff=${role}`);
      expect(html).not.toContain("Attachment removed");
    }
    expect(
      isChannelPinnedForRole("taylor", "digital", oneDrivePosts[0].channel),
    ).toBe(false);
  });

  it("keeps the private security conversation protected despite ordinary technical channel exploration", () => {
    const security = technicalPosts.find(
      (post) => post.channel === "Security Engineering",
    )!;
    for (const { id: role } of previewRoles.filter(
      (person) => person.id !== "devon",
    )) {
      vi.stubGlobal(
        "location",
        new URL(
          `https://example.test/teams?staff=${role}&context=workspace:digital&workspace=digital&channel=Security+Engineering&tab=Posts`,
        ),
      );
      vi.stubGlobal("sessionStorage", { getItem: () => role });
      const html = renderToStaticMarkup(createElement(TeamsPreview));
      expect(html).toContain("Access required");
      expect(html).not.toContain(security.text);
      expect(html).not.toContain(
        renderToStaticMarkup(
          createElement(
            "p",
            { style: { whiteSpace: "pre-line" } },
            oneDrivePosts[0].text,
          ),
        ),
      );
    }
  });

  it("provides German for the complete short exchange", () => {
    const post = oneDrivePosts[0];
    for (const text of [post.text, ...post.replies!.map((reply) => reply.text)])
      expect(germanOneDriveTechnical[text]).toBeTruthy();
    expect(germanOneDriveTechnical[post.replies![0].link!.label]).toBeTruthy();
    expect(germanOneDriveTechnical["· Edited"]).toBe("· Bearbeitet");
  });
});
