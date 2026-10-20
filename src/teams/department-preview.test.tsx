import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { staff } from "../intranet/catalog";
import {
  departments,
  accessibleFiles,
  canOpenUnit,
} from "../coordination/data";
import {
  departmentPreviewHref,
  readDepartmentPreview,
  teamsPersonForSearch,
} from "./departmentPreview";
import {
  teamsGroups,
  teamsPreviewHrefForStaff,
  readChannelEntryContext,
} from "./navigation";
import TeamsPreview from "../intranet/TeamsPreview";
import { PreviewRoleProvider } from "../components/PreviewRoleContext";

afterEach(() => vi.unstubAllGlobals());

describe("deliberate Department introductions", () => {
  it("opens each Department for every selected role without changing its identity or membership", () => {
    expect(departments).toHaveLength(6);
    for (const previous of staff) {
      vi.stubGlobal("sessionStorage", { getItem: () => previous.id });
      vi.stubGlobal(
        "location",
        new URL(`/architecture?staff=${previous.id}`, "https://example.test"),
      );
      for (const department of departments) {
        const url = new URL(
          departmentPreviewHref(department.id),
          "https://example.test",
        );
        vi.stubGlobal("location", url);
        const person = teamsPersonForSearch(url.search);
        expect(person.id).toBe(previous.id);
        expect(person.departmentId).toBe(previous.departmentId);
        expect(person.unitId).toBe(previous.unitId);
        const context = readChannelEntryContext(url.pathname, url.search);
        expect(context).toEqual({ kind: "department", id: department.id });
        expect(teamsGroups(person, context).map((group) => group.id)).toEqual([
          "company",
          department.id,
        ]);
        if (previous.departmentId !== department.id) {
          expect(accessibleFiles(department, person)).toEqual(
            department.library,
          );
          for (const unit of department.units)
            expect(canOpenUnit(department, unit, person)).toBe(false);
        }
        const html = renderToStaticMarkup(<TeamsPreview />);
        expect(html).toContain("<h1>General</h1>");
        expect(html).not.toContain("Access required");
      }
    }
  });
  it("keeps the selected Department beside company conversations and during role changes", () => {
    vi.stubGlobal(
      "location",
      new URL("/architecture?staff=robin", "https://example.test"),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => "robin" });
    const url = new URL(
      departmentPreviewHref("communications"),
      "https://example.test",
    );
    const person = teamsPersonForSearch(url.search);
    const assign = vi.fn();
    vi.stubGlobal("location", { assign });
    teamsGroups(
      person,
      readChannelEntryContext(url.pathname, url.search),
    )[0].channels[0].onSelect();
    const company = new URL(assign.mock.calls[0][0], "https://example.test");
    expect(company.searchParams.get("context")).toBe(
      "department:communications",
    );
    expect(
      teamsGroups(
        teamsPersonForSearch(company.search),
        readChannelEntryContext(company.pathname, company.search),
      ).map((group) => group.id),
    ).toEqual(["company", "communications"]);
    for (const next of staff) {
      const target = new URL(
        teamsPreviewHrefForStaff(next, url.pathname, url.search),
        "https://example.test",
      );
      expect(target.searchParams.get("staff")).toBe(next.id);
      expect(readChannelEntryContext(target.pathname, target.search)).toEqual({
        kind: "department",
        id: "communications",
      });
      expect(
        teamsGroups(
          teamsPersonForSearch(target.search),
          readChannelEntryContext(target.pathname, target.search),
        ).map((group) => group.id),
      ).toEqual(["company", "communications"]);
    }
  });
  it("shows the same generic Unit 1, Unit 2 folder labels without exposing unit names", () => {
    vi.stubGlobal(
      "location",
      new URL(
        "/teams?staff=maya&department=marketing-growth&context=department:marketing-growth&tab=Shared&folder=Planning+Cycle+Coordination",
        "https://example.test",
      ),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => "maya" });
    const html = renderToStaticMarkup(<TeamsPreview />);
    expect(html).toContain("Unit 1");
    expect(html).toContain("Unit 2");
    expect(html).not.toContain("Acquisition &amp; Direct Engagement");
    expect(html).not.toContain("Marketing Insight &amp; Performance");
  });
  it("validates context and clears Department preview when global channels are explicitly opened", () => {
    expect(
      readDepartmentPreview("?staff=robin&context=department:communications")
        ?.id,
    ).toBe("communications");
    expect(
      readDepartmentPreview("?staff=taylor&departmentPreview=unknown"),
    ).toBeUndefined();
    expect(
      readDepartmentPreview(
        "?staff=robin&department=communications&context=global",
      ),
    ).toBeUndefined();
    expect(departmentPreviewHref("unknown")).toBe("/architecture");
  });

  it("keeps the exact unit destination when the role cue is used and rechecks access in both directions", () => {
    const department = departments.find(
      (department) => department.id === "people-culture",
    )!;
    const unit = department.units.find(
      (unit) => unit.id === "people-operations",
    )!;
    let url = new URL(
      "/teams?staff=taylor&department=PAC&context=department:people-culture&tab=Shared&folder=Planning+Cycle+Coordination&unit=people-operations&section=Unit+Meetings&file=stale-file&post=stale-post",
      "https://example.test",
    );
    for (const id of ["taylor", "jamie", "taylor"]) {
      const next = staff.find((person) => person.id === id)!;
      url = new URL(
        teamsPreviewHrefForStaff(next, url.pathname, url.search),
        url.origin,
      );
      expect(url.searchParams.get("department")).toBe(department.id);
      expect(url.searchParams.get("context")).toBe(
        `department:${department.id}`,
      );
      expect(url.searchParams.get("folder")).toBe(
        "Planning Cycle Coordination",
      );
      expect(url.searchParams.get("unit")).toBe(unit.id);
      expect(url.searchParams.get("section")).toBe("Unit Meetings");
      expect(url.searchParams.get("tab")).toBe("Shared");
      expect(url.searchParams.has("file")).toBe(false);
      expect(url.searchParams.has("post")).toBe(false);
      vi.stubGlobal("location", url);
      vi.stubGlobal("sessionStorage", { getItem: () => id });
      const html = renderToStaticMarkup(
        <PreviewRoleProvider>
          <TeamsPreview />
        </PreviewRoleProvider>,
      );
      const permitted = id === "jamie";
      expect(html.includes("Access required")).toBe(!permitted);
      expect(html.includes("Reveal restricted content")).toBe(!permitted);
      expect(html.includes(unit.files[0].name)).toBe(permitted);
    }
  });

  it("preserves each canonical unit across role changes without treating the route as membership", () => {
    for (const department of departments)
      for (const unit of department.units)
        for (const next of staff) {
          const source = new URL(
            `/teams?staff=taylor&department=${department.id}&context=department:${department.id}&tab=Shared&folder=Planning+Cycle+Coordination&unit=${unit.id}&section=Absence+%26+Cover+Calendar`,
            "https://example.test",
          );
          const target = new URL(
            teamsPreviewHrefForStaff(next, source.pathname, source.search),
            source.origin,
          );
          expect(target.searchParams.get("staff")).toBe(next.id);
          expect(target.searchParams.get("unit")).toBe(unit.id);
          expect(target.searchParams.get("section")).toBe(
            "Absence & Cover Calendar",
          );
          const person = teamsPersonForSearch(target.search);
          expect(person.departmentId).toBe(next.departmentId);
          expect(person.unitId).toBe(next.unitId);
          expect(canOpenUnit(department, unit, person)).toBe(
            canOpenUnit(department, unit, next),
          );
        }
  });

  it("clears stale, foreign or invalid unit state and keeps file and post selections transient", () => {
    const next = staff.find((person) => person.id === "jamie")!;
    for (const query of [
      "department=PAC&context=department:people-culture&tab=Shared&folder=Planning+Cycle+Coordination&unit=unknown",
      "department=PAC&context=department:people-culture&tab=Shared&folder=Planning+Cycle+Coordination&unit=it-services",
      "department=PAC&context=department:people-culture&tab=Posts&folder=Planning+Cycle+Coordination&unit=people-operations",
      "department=PAC&context=global&tab=Shared&folder=Planning+Cycle+Coordination&unit=people-operations",
    ]) {
      const target = new URL(
        teamsPreviewHrefForStaff(
          next,
          "/teams",
          `?staff=taylor&${query}&file=old&post=old`,
        ),
        "https://example.test",
      );
      for (const field of ["folder", "unit", "section", "file", "post"])
        expect(target.searchParams.has(field)).toBe(false);
    }
  });
});
