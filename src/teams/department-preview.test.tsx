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
});
