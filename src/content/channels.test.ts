import { describe, expect, it } from "vitest";
import {
  contentChannels,
  visibleContentChannels,
  canSeeContentChannel,
  contentChannelReadOnly,
  contentFilesForChannel,
  resolveContentChannel,
  contentTeamsHref,
} from "./channels";
import {
  files,
  filesById,
  partnerShares,
  protectedTopics,
  sharedFiles,
} from "./data";
import { documentFor, folderFor, libraryFor, definitions } from "./libraries";
import { canSeeWorkspace, canSeeWorkspaceChannel } from "../teams/visibility";
import { teamsGroups } from "../teams/navigation";
import { staff } from "../intranet/catalog";

describe("Content Room desk and temporary coverage membership", () => {
  it("uses six durable desks and three finite coverage channels", () => {
    expect(
      contentChannels
        .filter((channel) => channel.kind === "desk")
        .map((channel) => channel.name),
    ).toEqual([
      "Editorial Desk",
      "Web Desk",
      "Social Desk",
      "Media Desk",
      "Video & Multimedia",
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
    expect(contentChannelReadOnly("Special Coverage · Community Week")).toBe(
      true,
    );
    expect(contentChannelReadOnly("Campaign Room · Clean Water Week")).toBe(
      false,
    );
  });
  it("limits cross-disciplinary collaborators to the coverage they joined", () => {
    expect(visibleContentChannels("maya").map((channel) => channel.id)).toEqual(
      ["coastal-flooding"],
    );
    expect(canSeeContentChannel("maya", "Production Coordination")).toBe(false);
    expect(canSeeContentChannel("maya", "Web Desk")).toBe(false);
    expect(canSeeContentChannel("sam", "coastal-flooding")).toBe(false);
    expect(canSeeWorkspace({ id: "maya" }, "content")).toBe(true);
    expect(canSeeWorkspaceChannel({ id: "maya" }, "content", "Web Desk")).toBe(
      false,
    );
    expect(
      visibleContentChannels("taylor").every(
        (channel) => channel.id !== "media",
      ),
    ).toBe(true);
    expect(visibleContentChannels("morgan")).toHaveLength(
      contentChannels.length,
    );
  });
  it("keeps safe company teams first and distinguishes temporary and archived channels", () => {
    const alex = staff.find((person) => person.id === "alex")!;
    const groups = teamsGroups(alex);
    expect(groups.slice(0, 2).map((group) => group.id)).toEqual([
      "company",
      "logistics",
    ]);
    const room = groups.find((group) => group.id === "content")!;
    expect(room.label).toBe("Content Room");
    expect(
      room.channels.find((channel) =>
        channel.label.includes("Coastal Flooding"),
      )?.cue,
    ).toBe("Temporary");
    expect(
      room.channels.find((channel) => channel.label.includes("Community Week"))
        ?.cue,
    ).toBe("Archived");
  });
  it("keeps old entry names compatible without creating duplicate channels", () => {
    expect(resolveContentChannel("General")?.name).toBe(
      "Production Coordination",
    );
    expect(resolveContentChannel("Digital Content & Experience")?.name).toBe(
      "Web Desk",
    );
    expect(contentTeamsHref("alex", "editorial")).toContain(
      "channel=Editorial+Desk",
    );
    expect(new Set(contentChannels.map((channel) => channel.id)).size).toBe(
      contentChannels.length,
    );
  });
});

describe("Content Room canonical lifecycle files", () => {
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
    expect(files.every((file) => file.sensitivity === "Internal")).toBe(true);
  });
});
