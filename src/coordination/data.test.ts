import { describe, it, expect } from "vitest";
import {
  departments,
  departmentFolders,
  unitFolders,
  canOpenDepartment,
  canOpenUnit,
  accessibleFiles,
  searchCoordination,
  departmentHref,
} from "./data";
import { staff, peopleDirectory, workspaces } from "../intranet/catalog";
import {
  documents,
  departments as planningDepartments,
} from "../data/workspace";
const maya = staff.find((p) => p.id === "maya")!,
  jamie = staff.find((p) => p.id === "jamie")!,
  robin = staff.find((p) => p.id === "robin")!;
const marketing = departments[0],
  finance = departments[2];
describe("department coordination architecture", () => {
  it("has exactly six departments, 33 units and no additional business workspaces", () => {
    expect(departments.map((d) => d.fullName)).toEqual([
      "MCG Department",
      "CPA Department",
      "FCS Department",
      "STT Department",
      "PAC Department",
      "EAO Department",
    ]);
    expect(departments.reduce((n, d) => n + d.units.length, 0)).toBe(33);
    expect(workspaces.some((workspace) => workspace.id === "employment")).toBe(
      true,
    );
    expect(planningDepartments).toEqual(departments.map((d) => d.fullName));
    expect(
      documents.every(
        (d) =>
          d.area === "Organisation-wide" ||
          planningDepartments.includes(d.area),
      ),
    ).toBe(true);
    expect(JSON.stringify(documents)).not.toMatch(/division/i);
  });
  it("maps organisational staff to a department and keeps the representative independent", () => {
    const representative = peopleDirectory.find(
      (person) => person.id === "skyler",
    )!;
    expect(representative.departmentId).toBe("");
    expect(representative.unitId).toBe("");
    for (const p of staff) {
      const d = departments.find((d) => d.id === p.departmentId)!;
      expect(d).toBeDefined();
      expect(d.units.some((u) => u.id === p.unitId)).toBe(true);
    }
  });
  it("distinguishes organisation-wide and department-only channel access", () => {
    expect(canOpenDepartment(marketing, jamie)).toBe(false);
    expect(canOpenDepartment(finance, maya)).toBe(false);
    expect(canOpenDepartment(finance, jamie)).toBe(false);
    expect(canOpenDepartment(departments[4], jamie)).toBe(true);
    expect(canOpenDepartment(departments[5], robin)).toBe(true);
    expect(canOpenDepartment(departments[4], maya)).toBe(false);
  });
  it("uses the same local administration folder structure everywhere", () => {
    expect(departmentFolders).toHaveLength(9);
    expect(unitFolders).toHaveLength(6);
    for (const d of departments)
      for (const u of d.units)
        expect(u.calendarItems.every((c) => c.person !== c.cover)).toBe(true);
    for (const d of departments) {
      expect(new Set(d.library.map((f) => f.folder)).size).toBe(8);
      for (const u of d.units) {
        expect(
          u.files.every(
            (f) =>
              unitFolders.includes(f.folder) &&
              f.unitId === u.id &&
              f.departmentId === d.id,
          ),
        ).toBe(true);
        expect(
          u.calendarItems.every(
            (c) =>
              Object.keys(c).sort().join(",") ===
              "availability,cover,dates,person",
          ),
        ).toBe(true);
      }
    }
  });
  it("enforces unit folder boundaries without exposing denied file content", () => {
    const insight = marketing.units.find(
        (u) => u.name === "Marketing Insight & Performance",
      )!,
      income = marketing.units.find((u) => u.name === "Income Administration")!;
    expect(canOpenUnit(marketing, insight, maya)).toBe(true);
    expect(canOpenUnit(marketing, insight, jamie)).toBe(false);
    expect(canOpenUnit(marketing, income, maya)).toBe(false);
    expect(
      accessibleFiles(marketing, maya).some((f) => f.unitId === income.id),
    ).toBe(false);
    expect(accessibleFiles(finance, maya)).toEqual([]);
    expect(canOpenUnit(departments[5], departments[5].units[0], robin)).toBe(
      true,
    );
  });
  it("searches only accessible coordination files and posts", () => {
    expect(searchCoordination(finance, maya, "")).toEqual({
      files: [],
      posts: [],
    });
    const visible = accessibleFiles(marketing, maya);
    for (const f of searchCoordination(marketing, maya, "Meeting").files)
      expect(visible.includes(f)).toBe(true);
    expect(searchCoordination(marketing, maya, "bank mandate").files).toEqual(
      [],
    );
  });
  it("resolves post attachments to original admin objects and keeps misplaced uploads out of Files", () => {
    for (const d of departments) {
      for (const p of d.posts) {
        if (p.attachmentId)
          expect(d.library.find((f) => f.id === p.attachmentId)).toBeDefined();
        if (p.upload) {
          expect(d.library.some((f) => f.name === p.upload?.name)).toBe(false);
          expect(p.moderatorReply).toBeTruthy();
        }
      }
      expect(d.posts.filter((p) => !p.upload).length).toBeGreaterThan(
        d.posts.filter((p) => p.upload).length,
      );
    }
  });
  it("uses only implemented functional destinations including People learning", () => {
    expect(
      departments.flatMap((d) =>
        d.posts.flatMap((p) => (p.upload ? [p.upload.destination] : [])),
      ),
    ).toEqual([
      "/audience-innovation/analytics",
      "/content-delivery/creative",
      "/financial-operations/planning",
      "/services/purchasing",
      "/digital-tech/systems-engineering",
      "/people-culture/learning",
      "/employment-admin/recruitment-administration",
      "/projects/PRJ-2026-014/decisions",
    ]);
    expect(
      departments[4].posts.some(
        (p) => p.upload?.destination === "/people-culture/learning",
      ),
    ).toBe(true);
    const route = new URL(
      departmentHref("maya", "marketing-growth"),
      "https://example.test",
    );
    expect(route.searchParams.get("staff")).toBe("maya");
    expect(route.searchParams.get("tab")).toBe("Posts");
  });
});
