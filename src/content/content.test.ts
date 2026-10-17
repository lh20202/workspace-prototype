import { describe, it, expect } from "vitest";
import {
  packages,
  packagesById,
  files,
  filesById,
  queryPackages,
  sharedFiles,
  partnerShares,
  protectedTopics,
  filesForChannel,
  teamChannels,
  tools,
  quickToolIds,
  calendarEntries,
  updateStage,
  releaseBlockers,
} from "./data";
import { prototypeForPath, pageTitle } from "../utils/routes";
import { systems as serviceSystems } from "../services/data";
describe("Connected content production", () => {
  it("adds routes without replacing the existing prototypes", () => {
    for (const suffix of [
      "",
      "/pipeline",
      "/editorial",
      "/creative",
      "/channels",
      "/digital",
      "/partners",
      "/calendar",
      "/teams",
      "/tools",
    ])
      expect(prototypeForPath("/content-delivery" + suffix)).toBe("content");
    expect(pageTitle("/content-delivery")).toBe("Content Room");
    expect(prototypeForPath("/audience-innovation")).toBe("audience");
    expect(prototypeForPath("/services")).toBe("services");
    expect(prototypeForPath("/logistics/teams")).toBe("logistics");
  });
  it("uses canonical packages in pipeline views, review queues and milestones", () => {
    const video = packagesById.get("PKG-103")!;
    expect(queryPackages(packages, "Needs Review")).toContain(video);
    expect(queryPackages(packages, "External Partner Work")).toContain(video);
    expect(
      calendarEntries(packages).filter((e) => e.packageId === video.id).length,
    ).toBeGreaterThan(1);
    expect(new Set(packages.map((p) => p.id)).size).toBe(packages.length);
  });
  it("filters channels, formats and completed work without duplicate stores", () => {
    expect(queryPackages(packages, "Completed").map((p) => p.id)).toEqual([
      "PKG-112",
    ]);
    expect(
      queryPackages(packages, "All Packages", "", "Live / virtual").map(
        (p) => p.id,
      ),
    ).toEqual(["PKG-104"]);
    expect(queryPackages(packages, "All Packages", "mobile")[0]).toBe(
      packagesById.get("PKG-105"),
    );
  });
  it("resolves Teams and partner files to the same SharePoint objects", () => {
    for (const c of teamChannels)
      for (const f of filesForChannel(c.id))
        expect(f).toBe(filesById.get(f.id));
    for (const share of partnerShares) {
      for (const f of sharedFiles(share.packageId)) {
        expect(f).toBe(filesById.get(f.id));
        expect(f.packageId).toBe(share.packageId);
      }
    }
    expect(sharedFiles("PKG-105").some((f) => f.id === "mobile-product")).toBe(
      false,
    );
  });
  it("does not seed protected personal, medical or security payloads", () => {
    for (const p of protectedTopics) {
      expect(files.some((f) => f.id === p.id)).toBe(false);
      expect(packagesById.has(p.packageId)).toBe(true);
    }
    expect(files.every((f) => f.sensitivity === "Internal")).toBe(true);
    expect(
      files.some((f) => f.name.toLowerCase().includes("participant")),
    ).toBe(false);
  });
  it("blocks release when reviews or rights are incomplete", () => {
    const video = packagesById.get("PKG-103")!;
    expect(updateStage(video, "Scheduled").blockers).toContain(
      "Required reviews are not all approved",
    );
    const expired = packagesById.get("PKG-112")!;
    expect(releaseBlockers(expired, "Live")).toContain("Rights: Expired");
    expect(
      releaseBlockers({ ...video, rights: "Do not publish" }, "Live"),
    ).toContain("Rights: Do not publish");
    const story = packagesById.get("PKG-107")!;
    expect(releaseBlockers(story, "Ready for delivery")).toContain(
      "Required reviews are not all approved",
    );
  });
  it("honours embargo and channel restrictions while allowing cleared production", () => {
    const media = packagesById.get("PKG-109")!;
    expect(releaseBlockers(media, "Live")).toContain(
      "Embargo until 2026-10-25",
    );
    expect(releaseBlockers(media, "Scheduled")).toHaveLength(0);
    const print = packagesById.get("PKG-110")!;
    expect(
      releaseBlockers({ ...print, channels: ["Website"] }, "Live"),
    ).toContain("A planned channel is outside permitted use");
    const ready = packagesById.get("PKG-106")!;
    expect(updateStage(ready, "Live").package.status).toBe("Delivered");
    expect(ready.stage).toBe("Ready for delivery");
  });
  it("connects tools and references without copying source-system data", () => {
    expect(quickToolIds).toHaveLength(3);
    expect(tools).toHaveLength(10);
    for (const p of packages)
      for (const r of p.refs)
        expect(tools.some((t) => t.id === r.tool)).toBe(true);
    for (const f of files) expect(packagesById.has(f.packageId)).toBe(true);
  });
});
describe("Services and Content boundaries", () => {
  it("keeps technology and hiring tools with their new owners", () => {
    expect(serviceSystems.map((s) => s.name)).toEqual([
      "MaintainX",
      "Coupa",
      "TravelPerk",
      "Envoy",
    ]);
    expect(
      tools.some((t) =>
        ["github", "datadog", "staffbase", "openproject"].includes(t.id),
      ),
    ).toBe(false);
    expect(partnerShares.some((s) => s.packageId === "PKG-105")).toBe(false);
  });
});
