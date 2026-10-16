import { describe, it, expect } from "vitest";
import { archiveRecords } from "../workspaces/archiveData";
import {
  currentProjects,
  archivedProjects,
  allProjects,
  canOpenProject,
  projectHref,
  projectTitle,
  projectFiles,
  projectAccessHref,
  archivePeriods,
} from "./data";
import { configById } from "../workspaces/config";
import { resolveLegacy, workspaceRegistry } from "../workspaces/registry";
import {
  departments,
  departmentHref,
  resolveDepartment,
  canOpenDepartment,
  canOpenUnit,
} from "../coordination/data";
import { staff } from "../intranet/catalog";
describe("Projects ownership and access", () => {
  it("has one main tile and consistent formal identifiers on distinct project routes", () => {
    expect(workspaceRegistry.filter((w) => w.id === "projects")).toHaveLength(
      1,
    );
    expect(currentProjects).toHaveLength(8);
    expect(new Set(allProjects.map((p) => p.code)).size).toBe(
      allProjects.length,
    );
    for (const p of allProjects) {
      expect(p.code).toMatch(/^PRJ-\d{4}-\d{3}$/);
      expect(projectTitle(p).startsWith(p.code + " · ")).toBe(true);
      expect(projectHref(p)).toContain(p.code);
    }
  });
  it("preserves separate project membership across SharePoint and Teams", () => {
    const restricted = currentProjects.filter((p) => p.access === "Restricted");
    expect(restricted).toHaveLength(3);
    for (const p of restricted) expect(canOpenProject(p, "maya")).toBe(false);
    expect(
      canOpenProject(
        currentProjects.find((p) => p.code.endsWith("038"))!,
        "sam",
      ),
    ).toBe(true);
    expect(
      canOpenProject(
        currentProjects.find((p) => p.code.endsWith("027"))!,
        "sam",
      ),
    ).toBe(false);
    expect(
      canOpenProject(
        currentProjects.find((p) => p.code.endsWith("031"))!,
        "maya",
      ),
    ).toBe(true);
  });
  it("passes project and requester into the existing service desk without granting membership", () => {
    const p = currentProjects[2],
      url = new URL(projectAccessHref(p, "maya"), "https://example.test");
    expect(url.pathname).toBe("/service-desk/access-request");
    expect(url.searchParams.get("project")).toBe(p.code);
    expect(url.searchParams.get("person")).toBe("maya");
    expect(canOpenProject(p, "maya")).toBe(false);
  });
  it("keeps sparse canonical project files outside the central directory and closed work read-only", () => {
    for (const p of allProjects) {
      expect(projectFiles(p)).toHaveLength(6);
      expect(projectFiles(p)).toEqual(projectFiles(p));
      expect(projectFiles(p).every((f) => f.projectCode === p.code)).toBe(true);
    }
    expect(
      archiveRecords.find((r) => r.id === "ARC-PRJ-2024-018")?.name,
    ).toContain(archivedProjects[0].code);
    expect(archivePeriods).toHaveLength(4);
    expect(
      archivedProjects.every((p) => p.archived && p.stage === "Closed"),
    ).toBe(true);
  });
  it("moves project support ownership out of Quality and Services with redirects", () => {
    expect(
      configById.get("quality")!.areas.some((a) => a.id === "change"),
    ).toBe(false);
    expect(resolveLegacy("/quality-monitoring/change")).toBe(
      "/projects/support",
    );
    expect(resolveLegacy("/services/projects")).toBe("/projects");
  });
});
describe("Department identity compatibility", () => {
  it("uses exactly six short names and compatible department URLs", () => {
    expect(departments.map((d) => d.name)).toEqual([
      "MCG Department",
      "CPA Department",
      "FCS Department",
      "STT Department",
      "PAC Department",
      "EAO Department",
    ]);
    for (const d of departments) {
      const url = new URL(departmentHref("maya", d.id), "https://example.test");
      expect(resolveDepartment(url.searchParams.get("department"))?.id).toBe(
        d.id,
      );
      expect(resolveDepartment(d.id)?.id).toBe(d.id);
      expect(d.coordinator.role).toBe(d.name + " Assistant");
    }
  });
  it("retains department-only and unit-only boundaries", () => {
    const maya = staff.find((s) => s.id === "maya")!,
      sam = staff.find((s) => s.id === "sam")!;
    expect(canOpenDepartment(departments[2], maya)).toBe(false);
    expect(canOpenDepartment(departments[2], sam)).toBe(true);
    expect(
      canOpenUnit(
        departments[0],
        departments[0].units.find((u) => u.access === "Unit-only")!,
        sam,
      ),
    ).toBe(false);
  });
});
