import { describe, it, expect } from "vitest";
import {
  workspaceRegistry,
  primaryDestinations,
  crossWorkspaceHandoffs,
  resolveLegacy,
} from "./registry";
import { functionalConfigs, configById, filesForWorkspace } from "./config";
import {
  searchArchive,
  archiveRecords,
  retentionSchedule,
  regions,
} from "./archiveData";
import { technicalChannels, technicalPosts, gitHref } from "./technicalTeams";
import {
  tools as contentTools,
  files as contentFiles,
  partnerShares,
} from "../content/data";
import { prototypeForPath } from "../utils/routes";
describe("canonical functional ownership", () => {
  it("registers 17 business purposes with separate confidential welfare ownership", () => {
    expect(workspaceRegistry).toHaveLength(17);
    expect(new Set(workspaceRegistry.map((w) => w.href)).size).toBe(
      workspaceRegistry.length,
    );
    expect(
      workspaceRegistry.every(
        (w) =>
          w.purpose &&
          w.description &&
          w.accessModel &&
          typeof w.teams === "boolean",
      ),
    ).toBe(true);
    expect(workspaceRegistry.some((w) => w.title.endsWith("Department"))).toBe(
      false,
    );
  });
  it("gives every ambiguity example one explicit primary destination", () => {
    expect(Object.keys(primaryDestinations)).toHaveLength(21);
    for (const route of Object.values(primaryDestinations)) {
      expect(
        workspaceRegistry.filter(
          (w) => route === w.href || route.startsWith(w.href + "/"),
        ),
      ).toHaveLength(1);
      expect(prototypeForPath(route)).not.toBe("launcher");
    }
  });
  it("links handoffs to real functional owners", () => {
    for (const h of crossWorkspaceHandoffs)
      for (const s of h.steps)
        expect(
          workspaceRegistry.some(
            (w) => s.href === w.href || s.href.startsWith(w.href + "/"),
          ),
        ).toBe(true);
    expect(crossWorkspaceHandoffs).toHaveLength(5);
  });
  it("keeps canonical files scoped to their owning register and Teams view", () => {
    for (const cfg of functionalConfigs) {
      if (cfg.id === "welfare") expect(filesForWorkspace(cfg.id)).toEqual([]);
      else expect(filesForWorkspace(cfg.id)).toBe(cfg.files);
      for (const f of cfg.files) {
        expect(cfg.areas.some((a) => a.id === f.area)).toBe(true);
        expect(f.sensitivity).toBe(
          cfg.id === "welfare" ? "Strictly confidential" : "Internal",
        );
      }
      expect(new Set(cfg.files.map((f) => f.id)).size).toBe(cfg.files.length);
    }
  });
  it("does not seed protected employee, technical, legal or historical records", () => {
    for (const cfg of functionalConfigs)
      for (const p of cfg.protected)
        expect(cfg.files.some((f) => f.id === p.id)).toBe(false);
    expect(JSON.stringify(configById.get("people")?.files)).not.toMatch(
      /salary|candidate assessment|employee contract|member list/i,
    );
    expect(JSON.stringify(configById.get("digital")?.files)).not.toMatch(
      /employee contract|candidate|credentials|vulnerabilit/i,
    );
  });
  it("removes technical production ownership and external developer scope from Content", () => {
    expect(contentTools.some((t) => ["github", "datadog"].includes(t.id))).toBe(
      false,
    );
    expect(partnerShares.some((p) => p.packageId === "PKG-105")).toBe(false);
    expect(
      contentFiles.some((f) =>
        /source code|devops|api contract|deployment/i.test(f.name),
      ),
    ).toBe(false);
    expect(resolveLegacy("/content-delivery/packages/PKG-105/shared")).toBe(
      "/digital-tech/web-crm/partner-review",
    );
  });
  it("keeps sensitive legacy matters protected when moved", () => {
    expect(resolveLegacy("/services/technology/matters/PRIV-01")).toContain(
      "/digital-tech/protected/",
    );
    expect(resolveLegacy("/services/legal/matters/INV-008")).toContain(
      "/legal-compliance/protected/",
    );
    expect(resolveLegacy("/services/hiring/recruitment/REC-221")).toContain(
      "/employment-admin/protected/",
    );
  });
});
describe("archive discovery and technical engineering are distinct", () => {
  it("searches and filters actual catalogue objects", () => {
    expect(searchArchive("Annual Report", {}).map((r) => r.id)).toContain(
      "ARC-001",
    );
    expect(
      searchArchive("", { year: "2012" }).every((r) => r.year === "2012"),
    ).toBe(true);
    expect(searchArchive("", { format: "Image" })).toHaveLength(1);
    expect(archiveRecords.some((r) => r.access !== "Open internally")).toBe(
      false,
    );
  });
  it("has distinct global collections and records-owned retention", () => {
    expect(regions.map((r) => r.name)).toEqual([
      "Mexico City Archive",
      "Tokyo Archive",
      "Washington Archive",
      "Cape Town Archive",
    ]);
    for (const r of regions)
      expect(archiveRecords.some((a) => a.region === r.id)).toBe(true);
    expect(
      retentionSchedule.every(
        (r) => r.owner && r.trigger && r.action && r.basis,
      ),
    ).toBe(true);
    expect(
      configById.get("digital")?.areas.some((a) => a.id === "retention"),
    ).toBe(false);
  });
  it("has technical discussions and only fictional Company Git destinations", () => {
    expect(technicalChannels).toContain("AI Lab");
    expect(technicalChannels).toContain("M365 & SPFx");
    expect(
      technicalPosts.filter((p) => p.channel === "Innovators").length,
    ).toBeGreaterThan(1);
    expect(technicalPosts.some((p) => p.text.includes("Qwen3"))).toBe(true);
    for (const p of technicalPosts.filter((post) => !!post.repo))
      expect(gitHref(p.repo!, p.kind, p.ref)).toMatch(
        /^\/digital-tech\/systems\/github\?/,
      );
  });
});
