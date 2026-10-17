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
  defaultTeamsContext,
} from "./navigation";
import TeamsPreview from "../intranet/TeamsPreview";

afterEach(() => vi.unstubAllGlobals());

describe("Architecture Department introductions", () => {
  it("opens all six departments as General Staff regardless of the previous role", () => {
    expect(departments).toHaveLength(6);
    for (const previous of staff) {
      vi.stubGlobal("sessionStorage", { getItem: () => previous.id });
      for (const department of departments) {
        const url = new URL(
          departmentPreviewHref(department.id),
          "https://example.test",
        );
        vi.stubGlobal("location", url);
        const person = teamsPersonForSearch(url.search);
        expect(person.id).toBe("taylor");
        expect(person.role).toBe("General Staff Member");
        expect(defaultTeamsContext(person).departmentId).toBe(department.id);
        const groups = teamsGroups(person);
        expect(groups.map((group) => group.id)).toEqual([
          "company",
          department.id,
        ]);
        expect(groups[1].channels.map((channel) => channel.label)).toEqual([
          "General",
        ]);
        expect(accessibleFiles(department, person)).toEqual(department.library);
        for (const unit of department.units.filter(
          (unit) => unit.access === "Unit-only",
        ))
          expect(canOpenUnit(department, unit, person)).toBe(false);
        const html = renderToStaticMarkup(<TeamsPreview />);
        expect(html).toContain(`<h1>General</h1>`);
        expect(html).not.toContain("Access required");
        expect(html).not.toContain('class="coord-moderator-badge">ADMIN');
      }
    }
  });

  it("keeps the selected Department beside Company Updates until an explicit role change", () => {
    const url = new URL(
      departmentPreviewHref("communications"),
      "https://example.test",
    );
    vi.stubGlobal("sessionStorage", { getItem: () => "robin" });
    const person = teamsPersonForSearch(url.search);
    const assign = vi.fn();
    vi.stubGlobal("location", { assign });
    teamsGroups(person)[0].channels[0].onSelect();
    const company = new URL(assign.mock.calls[0][0], "https://example.test");
    expect(company.searchParams.get("departmentPreview")).toBe(
      "communications",
    );
    expect(
      teamsGroups(teamsPersonForSearch(company.search)).map(
        (group) => group.id,
      ),
    ).toEqual(["company", "communications"]);
    for (const next of staff) {
      const target = new URL(
        teamsPreviewHrefForStaff(next, url.pathname, url.search),
        "https://example.test",
      );
      expect(target.searchParams.get("departmentPreview")).toBeNull();
      expect(target.searchParams.get("staff")).toBe(next.id);
      expect(
        teamsGroups(teamsPersonForSearch(target.search)).map(
          (group) => group.id,
        ),
      ).toEqual(teamsGroups(next).map((group) => group.id));
    }
  });

  it("does not apply a generic context to another role or an unknown department", () => {
    expect(
      readDepartmentPreview("?staff=robin&departmentPreview=communications"),
    ).toBeUndefined();
    expect(
      readDepartmentPreview("?staff=taylor&departmentPreview=unknown"),
    ).toBeUndefined();
    expect(departmentPreviewHref("unknown")).toBe("/architecture");
  });
});
