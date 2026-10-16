import { describe, it, expect } from "vitest";
import {
  divisions,
  divisionFolders,
  unitFolders,
  canOpenDivision,
  canOpenUnit,
  accessibleFiles,
  searchCoordination,
  divisionHref,
} from "./data";
import { staff, workspaces } from "../intranet/catalog";
import { documents, divisions as planningDivisions } from "../data/workspace";
const maya = staff.find((p) => p.id === "maya")!,
  sam = staff.find((p) => p.id === "sam")!,
  robin = staff.find((p) => p.id === "robin")!;
const marketing = divisions[0],
  finance = divisions[2];
describe("division coordination architecture", () => {
  it("has exactly six divisions, 33 units and no additional business workspaces", () => {
    expect(divisions.map((d) => d.fullName)).toEqual([
      "Marketing & Customer Growth Division",
      "Communications & Public Affairs Division",
      "Finance & Corporate Services Division",
      "Strategy, Technology & Transformation Division",
      "People & Culture Division",
      "Executive Office Division",
    ]);
    expect(divisions.reduce((n, d) => n + d.units.length, 0)).toBe(33);
    expect(workspaces).toHaveLength(7);
    expect(planningDivisions).toEqual(divisions.map((d) => d.fullName));
    expect(
      documents.every(
        (d) =>
          d.area === "Organisation-wide" || planningDivisions.includes(d.area),
      ),
    ).toBe(true);
    expect(JSON.stringify(documents)).not.toMatch(/department/i);
  });
  it("maps every retained staff persona to an actual division and unit", () => {
    for (const p of staff) {
      const d = divisions.find((d) => d.id === p.divisionId)!;
      expect(d).toBeDefined();
      expect(d.units.some((u) => u.id === p.unitId)).toBe(true);
    }
  });
  it("distinguishes organisation-wide and division-only channel access", () => {
    expect(canOpenDivision(marketing, sam)).toBe(true);
    expect(canOpenDivision(finance, maya)).toBe(false);
    expect(canOpenDivision(finance, sam)).toBe(true);
    expect(canOpenDivision(divisions[5], robin)).toBe(true);
    expect(canOpenDivision(divisions[4], maya)).toBe(false);
  });
  it("uses the same local administration folder structure everywhere", () => {
    expect(divisionFolders).toHaveLength(9);
    expect(unitFolders).toHaveLength(6);
    for (const d of divisions)
      for (const u of d.units)
        expect(u.calendarItems.every((c) => c.person !== c.cover)).toBe(true);
    for (const d of divisions) {
      expect(new Set(d.library.map((f) => f.folder)).size).toBe(8);
      for (const u of d.units) {
        expect(
          u.files.every(
            (f) =>
              unitFolders.includes(f.folder) &&
              f.unitId === u.id &&
              f.divisionId === d.id,
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
    expect(canOpenUnit(marketing, insight, sam)).toBe(false);
    expect(canOpenUnit(marketing, income, maya)).toBe(false);
    expect(
      accessibleFiles(marketing, maya).some((f) => f.unitId === income.id),
    ).toBe(false);
    expect(accessibleFiles(finance, maya)).toEqual([]);
    expect(canOpenUnit(divisions[5], divisions[5].units[0], robin)).toBe(true);
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
    for (const d of divisions) {
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
  it("uses only implemented functional destinations and omits a missing People workspace redirect", () => {
    expect(
      divisions.flatMap((d) =>
        d.posts.flatMap((p) => (p.upload ? [p.upload.destination] : [])),
      ),
    ).toEqual([
      "/audience-innovation/analytics",
      "/content-delivery/creative",
      "/financial-operations/planning",
      "/services/procurement",
      "/executive/initiatives",
    ]);
    expect(divisions[4].posts.some((p) => p.upload)).toBe(false);
    const route = new URL(
      divisionHref("maya", "marketing-growth"),
      "https://example.test",
    );
    expect(route.searchParams.get("staff")).toBe("maya");
    expect(route.searchParams.get("tab")).toBe("Posts");
  });
});
