import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import WelfareWorkspace from "./WelfareWorkspace";
import { staff, peopleDirectory } from "../intranet/catalog";
import { accessFocalPoint, accessWorkspace } from "../access/model";
import { configById, filesForWorkspace, functionalConfigs } from "./config";
import {
  functionalLibraries,
  functionalLibraryDocuments,
} from "./siteArchitecture";
import { resolveLegacy, workspaceById } from "./registry";
import { prototypeForPath } from "../utils/routes";
import {
  canSeeWelfareArea,
  canSeeWelfareWorkspace,
  legacyWelfareDestination,
  visibleWelfareAreas,
  welfareConfig,
  welfareFilesForPerson,
} from "./welfare";

afterEach(() => vi.unstubAllGlobals());
function render(path: string, personId: string) {
  vi.stubGlobal("location", new URL(path, "https://example.test"));
  vi.stubGlobal("sessionStorage", { getItem: () => personId });
  return renderToStaticMarkup(createElement(WelfareWorkspace));
}

describe("Welfare has one protected owner", () => {
  it("registers one controlled site while retaining independent focal points outside preview roles", () => {
    expect(workspaceById.get("welfare")?.href).toBe("/welfare-representation");
    expect(workspaceById.get("welfare")?.teams).toBe(false);
    expect(
      prototypeForPath("/welfare-representation/employee-representation"),
    ).toBe("functional");
    expect(
      functionalConfigs.filter((config) => config.id === "welfare"),
    ).toEqual([welfareConfig]);
    expect(staff.filter((person) => person.workspace === "welfare")).toEqual(
      [],
    );
    expect(
      peopleDirectory.find((person) => person.id === "skyler")?.departmentId,
    ).toBe("");
    expect(
      staff.some((person) => ["riley", "skyler"].includes(person.id)),
    ).toBe(false);
  });

  it("gives Personnel selected support but preserves safeguarding and representation independence", () => {
    expect(visibleWelfareAreas("jamie").map((area) => area.id)).toEqual([
      "welfare-support",
    ]);
    expect(canSeeWelfareArea("jamie", "approved-consultation")).toBe(true);
    for (const person of staff) {
      expect(canSeeWelfareArea(person.id, "employee-representation")).toBe(
        false,
      );
      expect(canSeeWelfareArea(person.id, "safeguarding-complaints")).toBe(
        false,
      );
      if (person.id !== "jamie") {
        expect(canSeeWelfareWorkspace(person.id)).toBe(false);
        expect(welfareFilesForPerson(person.id)).toEqual([]);
      }
    }
    for (const stale of ["riley", "skyler"])
      expect(canSeeWelfareWorkspace(stale)).toBe(false);
  });

  it("keeps method files and aggregate coordination behind both whole-site and area gates", () => {
    for (const path of [
      "/welfare-representation",
      "/welfare-representation/welfare-support?file=welfare-methods",
      "/welfare-representation/employee-representation?file=representation-methods",
      "/welfare-representation/approved-consultation?file=consultation-output",
    ]) {
      const html = render(path, "maya");
      expect(html).toContain("Access required");
      expect(html).toContain("Strictly confidential");
      expect(html).toContain("Contact focal point");
      expect(html).not.toContain("Support Pathways — Working Method.docx");
      expect(html).not.toContain(
        "Independent Consultation — Preparation Method.docx",
      );
      expect(html).not.toContain("Agreed Consultation Principles.docx");
      expect(html).not.toContain("Your protected areas");
      expect(html).not.toContain("Document preview");
    }
    expect(
      render(
        "/welfare-representation/employee-representation?file=representation-methods",
        "jamie",
      ),
    ).toContain("Access required");
    expect(
      render(
        "/welfare-representation/welfare-support?file=welfare-methods",
        "skyler",
      ),
    ).toContain("Access required");
    const guessedFile = render(
      "/welfare-representation/welfare-support?file=representation-methods",
      "jamie",
    );
    expect(guessedFile).toContain("Access required");
    expect(guessedFile).not.toContain(
      "Independent Consultation — Preparation Method.docx",
    );
    for (const person of staff)
      expect(
        render("/welfare-representation/employee-representation", person.id),
      ).toContain("Access required");
    expect(
      render(
        "/welfare-representation/welfare-support?file=welfare-methods",
        "jamie",
      ),
    ).toContain("Support Pathways — Working Method.docx");
  });

  it("preserves independent representation contacts through direct, migrated and denied-file routes", () => {
    const representationRoute =
      "/welfare-representation/employee-representation";
    const migratedCouncilRoute = resolveLegacy(
      "/employee-council/internal/former-record",
    )!;
    for (const personId of ["maya", "jamie"]) {
      for (const route of [representationRoute, migratedCouncilRoute]) {
        const html = render(route, personId);
        expect(html).toContain("Access required");
        expect(html).toContain("<strong>Skyler Lane</strong>");
        expect(html).not.toContain("<strong>Riley Quinn</strong>");
        expect(html).not.toContain(
          "Independent Consultation — Preparation Method.docx",
        );
      }
    }
    const welfare = render("/welfare-representation/welfare-support", "skyler");
    expect(welfare).toContain("<strong>Riley Quinn</strong>");
    for (const route of [
      "/welfare-representation/unknown?file=representation-methods",
      "/welfare-representation/welfare-support?file=representation-methods",
      "/welfare-representation/employee-representation/unknown?file=representation-methods",
    ]) {
      const html = render(route, "jamie");
      expect(html).toContain("Access required");
      expect(html).toContain("<strong>Skyler Lane</strong>");
      expect(html).not.toContain(
        "Independent Consultation — Preparation Method.docx",
      );
      expect(html).not.toContain("Document preview");
    }
    for (const route of [
      "/welfare-representation/unknown?file=representation-methods",
      "/welfare-representation/employee-representation/unknown?file=representation-methods",
    ]) {
      const html = render(route, "skyler");
      expect(html).toContain("Access required");
      expect(html).not.toContain(
        "Independent Consultation — Preparation Method.docx",
      );
    }
  });

  it("does not aggregate protected methods into ordinary discovery collections", () => {
    expect(filesForWorkspace("welfare")).toEqual([]);
    expect(filesForWorkspace("welfare", "taylor")).toEqual([]);
    for (const library of functionalLibraries.welfare)
      expect(functionalLibraryDocuments(welfareConfig, library)).toEqual([]);
    expect(
      filesForWorkspace("welfare", "jamie").map((file) => file.id),
    ).toEqual(["welfare-methods", "consultation-output"]);
    expect(
      filesForWorkspace("welfare", "skyler").map((file) => file.id),
    ).toEqual([]);
    expect(
      welfareConfig.files.every(
        (file) => file.sensitivity === "Strictly confidential",
      ),
    ).toBe(true);
    expect(
      welfareConfig.files.every(
        (file) => !/case|dossier|personal record/i.test(file.name),
      ),
    ).toBe(true);
    expect(
      welfareConfig.items.every(
        (item) => !/case|dossier|personal record/i.test(item.name),
      ),
    ).toBe(true);
  });

  it("migrates sensitive ownership out of employment and retains open People programme work", () => {
    for (const owner of ["people", "employment"]) {
      const config = configById.get(owner)!;
      expect(
        config.protected.some((subject) =>
          [
            "welfare",
            "complaints",
            "employee-relations",
            "employee-representation",
          ].includes(subject.id),
        ),
      ).toBe(false);
    }
    const wellbeing = configById
      .get("people")!
      .areas.find((area) => area.id === "wellbeing")!;
    expect(wellbeing.name).toBe("Wellbeing Programmes");
    expect(wellbeing.summary).toContain(
      "confidential support and duty-of-care follow-up belong to Welfare",
    );
    expect(
      configById
        .get("people")!
        .files.filter((file) => file.area === "wellbeing")
        .map((file) => file.id)
        .sort(),
    ).toEqual(["people-F18", "people-R16"]);
  });

  it("migrates council and former sensitive routes while preserving broad programme routes", () => {
    const routes = {
      "/employee-council": "/welfare-representation/employee-representation",
      "/employee-council/internal/former-record":
        "/welfare-representation/employee-representation",
      "/employment-admin/protected/welfare":
        "/welfare-representation/welfare-support",
      "/people-culture/wellbeing/duty-of-care":
        "/welfare-representation/welfare-support",
      "/people-culture/protected/welfare/former-record":
        "/welfare-representation/welfare-support",
      "/employment-admin/protected/complaints":
        "/welfare-representation/safeguarding-complaints",
      "/people-culture/protected/employee-relations":
        "/welfare-representation/safeguarding-complaints",
      "/services/protected/representation":
        "/welfare-representation/employee-representation",
    };
    for (const [path, destination] of Object.entries(routes)) {
      expect(legacyWelfareDestination(path)).toBe(destination);
      expect(resolveLegacy(path)).toBe(destination);
    }
    expect(
      legacyWelfareDestination("/people-culture/wellbeing"),
    ).toBeUndefined();
    expect(
      legacyWelfareDestination("/customer-relations/complaints"),
    ).toBeUndefined();
  });

  it("uses the independent representative contact for representation and welfare contact elsewhere", () => {
    expect(
      accessFocalPoint({
        workspaceId: "welfare",
        area: "Employee Representation",
      }).name,
    ).toBe("Skyler Lane");
    expect(
      accessFocalPoint({
        workspaceId: "welfare",
        area: "Welfare & Psychosocial Support",
      }).name,
    ).toBe("Riley Quinn");
    expect(accessWorkspace({ workspaceId: "council" }).href).toBe(
      "/welfare-representation",
    );
  });
});
