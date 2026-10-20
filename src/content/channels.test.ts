import { isSensitivityLabel } from "../sharepoint/sensitivity";
import { describe, expect, it } from "vitest";
import {
  contentChannels,
  visibleContentChannels,
  canSeeContentChannel,
  contentChannelReadOnly,
  contentFilesForChannel,
  resolveContentChannel,
  contentTeamsHref,
  contentDefaultTab,
  contentHomeChannelGroups,
} from "./channels";
import {
  files,
  packages,
  filesById,
  partnerShares,
  protectedTopics,
  sharedFiles,
} from "./data";
import {
  documentFor,
  folderFor,
  libraryFor,
  definitions,
  searchableContentFiles,
} from "./libraries";
import { canSeeWorkspace, canSeeWorkspaceChannel } from "../teams/visibility";
import { teamsGroups } from "../teams/navigation";
import { staff } from "../intranet/catalog";
import { studioPosts } from "./conversations";

describe("Creative & Editorial Studio desk and temporary coverage membership", () => {
  it("uses seven durable desks and three finite coverage channels", () => {
    expect(
      contentChannels
        .filter((channel) => channel.kind === "desk")
        .map((channel) => channel.name),
    ).toEqual([
      "Editorial Desk",
      "Web Desk",
      "Social Desk",
      "Media Desk",
      "Publications & Email",
      "Video & Visuals",
      "Production Coordination",
    ]);
    expect(
      contentChannels.filter((channel) => channel.kind === "temporary"),
    ).toHaveLength(3);
    expect(
      contentChannels.filter(
        (channel) =>
          channel.kind === "temporary" && channel.lifecycle === "Active",
      ),
    ).toHaveLength(2);
    expect(contentChannelReadOnly("Campaign · Future Skills Week")).toBe(true);
    expect(
      contentChannelReadOnly("Special Coverage · City Innovation Summit"),
    ).toBe(false);
  });
  it("keeps role pinning separate from ordinary contextual Studio access", () => {
    expect(visibleContentChannels("maya").map((channel) => channel.id)).toEqual(
      [],
    );
    expect(canSeeContentChannel("maya", "Production Coordination")).toBe(true);
    expect(canSeeContentChannel("maya", "Web Desk")).toBe(true);
    expect(canSeeContentChannel("sam", "coastal-flooding")).toBe(true);
    expect(canSeeWorkspace({ id: "maya" }, "content")).toBe(false);
    expect(canSeeWorkspaceChannel({ id: "maya" }, "content", "Web Desk")).toBe(
      true,
    );
    expect(visibleContentChannels("morgan")).toEqual([]);
    for (const person of staff) {
      expect(
        visibleContentChannels(person.id).map((channel) => channel.id),
      ).toEqual(
        person.id === "nadia" ? ["editorial", "social", "coordination"] : [],
      );
      for (const channel of contentChannels)
        expect(canSeeContentChannel(person.id, channel.name)).toBe(true);
    }
  });
  it("retains Studio and archived coverage without showing an empty Team to preview roles", () => {
    const taylor = staff.find((person) => person.id === "taylor")!;
    const groups = teamsGroups(taylor);
    expect(groups.map((group) => group.id)).toEqual(["company"]);
    for (const person of staff)
      expect(teamsGroups(person).some((group) => group.id === "content")).toBe(
        false,
      );
    expect(
      teamsGroups(taylor, { kind: "workspace", id: "content" }).some(
        (group) => group.id === "content",
      ),
    ).toBe(true);
    expect(
      resolveContentChannel("Special Coverage · City Innovation Summit")?.kind,
    ).toBe("temporary");
    expect(contentChannelReadOnly("community-week")).toBe(true);
  });
  it("selects Home channels by canonical working purpose rather than role or array order", () => {
    const groups = contentHomeChannelGroups();
    expect(groups.map((group) => group.label)).toEqual([
      "Channel desks",
      "Topic specialists",
      "Current coverage",
    ]);
    expect(
      groups[0].channels.every(
        (channel) => channel.homeFeatured && channel.kind === "desk",
      ),
    ).toBe(true);
    expect(groups[1].channels.map((channel) => channel.name)).toEqual([
      "Cities & Mobility",
      "Education & Skills",
      "Digital Society",
      "Arts & Culture",
    ]);
    expect(groups[2].channels).toHaveLength(2);
    for (const channel of groups.flatMap((group) => group.channels)) {
      expect(channel).toBe(resolveContentChannel(channel.id));
      expect(channel.lifecycle).toBe("Active");
      const url = new URL(
        contentTeamsHref("taylor", channel.id),
        "https://example.test",
      );
      expect(url.searchParams.get("context")).toBe("workspace:content");
      expect(url.searchParams.get("channel")).toBe(channel.name);
    }
  });
  it("keeps old entry names compatible without creating duplicate channels", () => {
    expect(resolveContentChannel("General")?.name).toBe(
      "Production Coordination",
    );
    expect(resolveContentChannel("Digital Content & Experience")?.name).toBe(
      "Web Desk",
    );
    expect(contentTeamsHref("taylor", "editorial")).toContain(
      "channel=Editorial+Desk",
    );
    expect(new Set(contentChannels.map((channel) => channel.id)).size).toBe(
      contentChannels.length,
    );
  });
});

describe("Creative & Editorial Studio canonical lifecycle files", () => {
  it("reuses SharePoint identity for desk and coverage Shared files", () => {
    for (const channel of contentChannels) {
      expect(contentFilesForChannel(channel.name).length).toBeGreaterThan(0);
      for (const file of contentFilesForChannel(channel.name)) {
        expect(file).toBe(filesById.get(file.id));
        expect(documentFor(file).id).toBe(file.id);
        expect(folderFor(file).split("/").length).toBeLessThanOrEqual(2);
      }
    }
    expect(
      contentFilesForChannel("coastal-flooding").every(
        (file) => file.packageId === "PKG-108",
      ),
    ).toBe(true);
    expect(
      contentFilesForChannel("community-week").every(
        (file) => libraryFor(file) === "published",
      ),
    ).toBe(true);
    expect(Object.keys(definitions)).toHaveLength(4);
    expect(contentChannels.length).toBeGreaterThan(
      Object.keys(definitions).length,
    );
  });
  it("keeps live production working sets together instead of one folder per file type", () => {
    const workingSets = new Map<string, string[]>();
    for (const file of files.filter(
      (item) => libraryFor(item) === "production",
    )) {
      const folder = folderFor(file);
      workingSets.set(folder, [...(workingSets.get(folder) || []), file.id]);
    }
    expect(
      [...workingSets.values()].every(
        (items) => items.length >= 2 && items.length <= 5,
      ),
    ).toBe(true);
    expect(
      workingSets.get("Customer Welcome Series/Working Copy"),
    ).toHaveLength(4);
    expect(
      workingSets.get("Service Explainer Video/Creative & Review"),
    ).toHaveLength(2);
  });
  it("separates retained final outputs from active production without fake versions", () => {
    expect(libraryFor(filesById.get("community-final")!)).toBe("published");
    expect(libraryFor(filesById.get("welcome-brief")!)).toBe("production");
    expect(folderFor(filesById.get("welcome-message")!)).toBe(
      "Customer Welcome Series/Working Copy",
    );
    expect(documentFor(filesById.get("community-final")!).contentType).toBe(
      "published-output",
    );
    expect(new Set(files.map((file) => file.id)).size).toBe(files.length);
    expect(files.some((file) => /\bv\d+\b/i.test(file.name))).toBe(false);
  });
  it("retains narrow agency scopes and never supplies protected records to Shared", () => {
    for (const share of partnerShares) {
      expect(sharedFiles(share.packageId).length).toBeLessThan(files.length);
      expect(
        sharedFiles(share.packageId).every((file) =>
          share.fileIds.includes(file.id),
        ),
      ).toBe(true);
    }
    for (const channel of contentChannels)
      for (const topic of protectedTopics)
        expect(
          contentFilesForChannel(channel.name).some(
            (file) => file.id === topic.id,
          ),
        ).toBe(false);
    expect(files.every((file) => isSensitivityLabel(file.sensitivity))).toBe(
      true,
    );
  });
});

describe("Studio topic expertise and different working patterns", () => {
  it("uses four unrelated topic desks whose public context files feed channel production", () => {
    const topics = contentChannels.filter(
      (channel) => channel.kind === "topic",
    );
    expect(topics.map((channel) => channel.name)).toEqual([
      "Cities & Mobility",
      "Education & Skills",
      "Digital Society",
      "Arts & Culture",
    ]);
    for (const topic of topics) {
      expect(
        contentFilesForChannel(topic.id).every(
          (file) => file.topic === topic.name,
        ),
      ).toBe(true);
      const post = studioPosts[topic.id][0];
      expect(post.handoff).toBeTruthy();
      expect(
        contentFilesForChannel(topic.id).some(
          (file) => file.id === post.attachment,
        ),
      ).toBe(true);
    }
  });
  it("opens Publications & Email in Shared while chat-heavy and handoff desks retain Posts", () => {
    expect(contentDefaultTab("publications")).toBe("Shared");
    expect(contentTeamsHref("taylor", "publications")).toContain("tab=Shared");
    for (const id of ["web", "social", "media"]) {
      expect(contentDefaultTab(id)).toBe("Posts");
      expect(studioPosts[id].length).toBeGreaterThan(
        studioPosts.publications.length,
      );
    }
    expect(resolveContentChannel("video")?.focus).toBe("handoff");
    expect(studioPosts.video[0].handoff?.channel).toBe("coordination");
    expect(contentFilesForChannel("publications").length).toBeGreaterThan(
      studioPosts.publications.length,
    );
  });
  it("makes public topic metadata searchable without adding protected fixtures", () => {
    for (const topic of contentChannels.filter(
      (channel) => channel.kind === "topic",
    )) {
      const results = searchableContentFiles.filter((file) =>
        Object.values(file.metadata || {}).includes(topic.name),
      );
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((file) => filesById.has(file.id))).toBe(true);
    }
    expect(
      searchableContentFiles.some((file) =>
        protectedTopics.some((topic) => topic.id === file.id),
      ),
    ).toBe(false);
  });
  it("links every desk/thread attachment to a real file included in that desk's Shared context", () => {
    for (const channel of contentChannels)
      for (const post of studioPosts[channel.id] || []) {
        if (post.attachment)
          expect(
            contentFilesForChannel(channel.id).some(
              (file) => file.id === post.attachment,
            ),
          ).toBe(true);
        if (post.handoff)
          expect(resolveContentChannel(post.handoff.channel)).toBeTruthy();
      }
  });
  it("removes old visible coverage subjects from channels, production files, metadata and posts", () => {
    const visible = JSON.stringify({
      channels: contentChannels.map((channel) => ({
        name: channel.name,
        purpose: channel.purpose,
      })),
      packages: packages.map((item) => ({
        name: item.name,
        purpose: item.purpose,
      })),
      files: files.map((file) => ({
        name: file.name,
        folder: file.folder,
        campaign: file.campaign,
        metadata: documentFor(file).metadata,
      })),
      posts: Object.values(studioPosts)
        .flat()
        .map((post) => ({ text: post.text, reply: post.reply?.text })),
    });
    expect(visible).not.toMatch(
      /coastal flooding|clean water week|community week|Content Room/i,
    );
    expect(
      contentChannels
        .filter((channel) => channel.kind === "temporary")
        .map((channel) => channel.name),
    ).toEqual([
      "Rapid Coverage · Major Transport Disruption",
      "Special Coverage · City Innovation Summit",
      "Campaign · Future Skills Week",
    ]);
    expect(
      resolveContentChannel("Rapid Response · Coastal Flooding")?.name,
    ).toBe("Rapid Coverage · Major Transport Disruption");
  });
});
