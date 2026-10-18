import { describe, expect, it } from "vitest";
import {
  architectureDestinationById,
  architectureDestinations,
  destinationsForHub,
  financeJumpLinks,
  orgCentralGroups,
  personnelDestinations,
} from "./architectureDestinations";
import {
  environmentsForHub,
  workspaceById,
  workspaceRegistry,
} from "../workspaces/registry";
import { configById, filesForWorkspace } from "../workspaces/config";

describe("task-oriented architecture destinations", () => {
  it("signposts two canonical Personnel sections without duplicating their files", () => {
    expect(
      personnelDestinations.normal.map(({ label, href }) => [label, href]),
    ).toEqual([
      ["Workforce", "/people-culture/culture"],
      ["Edu", "/people-culture/learning"],
    ]);
    const areas = configById.get("people")!.areas;
    for (const destination of personnelDestinations.normal) {
      expect(destination).toMatchObject({
        hub: "personnel",
        type: "workspace-section",
        accessLevel: "internal",
        parentWorkspaceId: "people",
        icon: "workspace",
      });
      expect(
        areas.some((area) => destination.href === `/people-culture/${area.id}`),
      ).toBe(true);
      expect(workspaceById.has(destination.id)).toBe(false);
    }
    expect(filesForWorkspace("people")).toBe(configById.get("people")!.files);
    expect(architectureDestinationById.has("people")).toBe(false);
  });

  it("keeps personnel administration, independent representation and welfare boundaries separate", () => {
    expect(
      personnelDestinations.controlled.map(({ label, href }) => [label, href]),
    ).toEqual([
      ["Personnel", "/employment-admin"],
      ["Workers' Union", "/welfare-representation/employee-representation"],
      ["Welfare", "/welfare-representation/welfare-support"],
    ]);
    expect(
      personnelDestinations.controlled.every(
        ({ accessLevel }) => accessLevel === "strictly-confidential",
      ),
    ).toBe(true);
    expect(destinationsForHub("personnel")).toEqual([
      ...personnelDestinations.normal,
      ...personnelDestinations.controlled,
      architectureDestinationById.get("taskforce"),
    ]);
  });

  it("retires the publishing site and keeps canonical environment identifiers unique", () => {
    expect(workspaceRegistry).toHaveLength(16);
    expect(workspaceById.has("publishing")).toBe(false);
    expect(architectureDestinationById.has("publishing")).toBe(false);
    expect(new Set(architectureDestinations.map(({ id }) => id)).size).toBe(
      architectureDestinations.length,
    );
    expect(new Set(architectureDestinations.map(({ href }) => href)).size).toBe(
      architectureDestinations.length,
    );
  });

  it("groups East and uses one finance site for every jump link", () => {
    expect(orgCentralGroups).toEqual([
      {
        label: "Direction & assurance",
        ids: ["executive", "planning", "projects", "quality", "legal"],
      },
      { label: "Shared services", ids: ["digital", "services", "archives"] },
    ]);
    for (const id of ["sales-marketing", "infrastructure"] as const) {
      expect(
        destinationsForHub(id).map(({ id, label, href }) => [id, label, href]),
      ).toEqual(
        environmentsForHub(id).map(({ id, hubLabel, href }) => [
          id,
          hubLabel,
          href,
        ]),
      );
    }
    expect(architectureDestinationById.get("finance")).toMatchObject({
      label: "South",
      href: "/financial-operations",
      type: "workspace",
    });
    expect(financeJumpLinks).toEqual([
      { label: "-> $", href: "/financial-operations/income" },
      {
        label: "$ ->",
        href: "/financial-operations/reconciliation",
      },
      { label: "Value", href: "/financial-operations/planning" },
      { label: "Vault", href: "/financial-operations/treasury" },
    ]);
    expect(workspaceRegistry.filter(({ id }) => id === "finance")).toHaveLength(
      1,
    );
  });
});
