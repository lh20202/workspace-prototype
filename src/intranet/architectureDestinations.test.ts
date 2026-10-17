import { describe, expect, it } from "vitest";
import {
  architectureDestinationById,
  architectureDestinations,
  destinationsForHub,
  personnelDestinations,
} from "./architectureDestinations";
import {
  environmentsForHub,
  hubById,
  workspaceById,
  workspaceRegistry,
} from "../workspaces/registry";
import { configById, filesForWorkspace } from "../workspaces/config";

describe("task-oriented architecture destinations", () => {
  it("signposts six canonical People & Culture sections within one existing workspace", () => {
    expect(
      personnelDestinations.normal.map(({ label, href }) => [label, href]),
    ).toEqual([
      ["Workforce & Organisation", "/people-culture/workforce"],
      ["Leadership, Culture & Inclusion", "/people-culture/culture"],
      ["Learning & Capability", "/people-culture/learning"],
      [
        "Internal Communications & Staff Engagement",
        "/people-culture/communications",
      ],
      ["Reward & Working Conditions", "/people-culture/frameworks"],
      ["Staff Communities & Events", "/people-culture/communities"],
    ]);
    const areas = configById.get("people")!.areas;
    for (const destination of personnelDestinations.normal) {
      expect(destination).toMatchObject({
        hub: "personnel",
        type: "workspace-section",
        accessLevel: "internal",
        parentWorkspaceId: "people",
      });
      expect(
        areas.some((area) => destination.href === `/people-culture/${area.id}`),
      ).toBe(true);
    }
    expect(
      new Set(personnelDestinations.normal.map(({ icon }) => icon)).size,
    ).toBe(6);
    expect(architectureDestinationById.has("people")).toBe(false);
  });

  it("keeps the two confidential personnel workspaces distinct and after normal destinations", () => {
    expect(
      personnelDestinations.controlled.map(({ label, href }) => [label, href]),
    ).toEqual([
      ["Employment & Hiring Administration", "/employment-admin"],
      ["Welfare & Employee Representation", "/welfare-representation"],
    ]);
    for (const destination of personnelDestinations.controlled) {
      expect(destination.type).toBe("workspace");
      expect(destination.accessLevel).toBe("strictly-confidential");
      expect(destination.parentWorkspaceId).toBeUndefined();
    }
    expect(destinationsForHub("personnel")).toEqual([
      ...personnelDestinations.normal,
      ...personnelDestinations.controlled,
    ]);
  });

  it("keeps actual workspaces, canonical content and environment-level hub navigation intact", () => {
    expect(workspaceRegistry).toHaveLength(17);
    expect(workspaceRegistry.filter(({ id }) => id === "people")).toHaveLength(
      1,
    );
    expect(workspaceById.get("people")?.href).toBe("/people-culture");
    expect(hubById.get("personnel")?.workspaceIds).toEqual([
      "people",
      "employment",
      "welfare",
    ]);
    expect(filesForWorkspace("people")).toBe(configById.get("people")!.files);
    for (const destination of personnelDestinations.normal)
      expect(workspaceById.has(destination.id)).toBe(false);
    expect(new Set(architectureDestinations.map(({ id }) => id)).size).toBe(
      architectureDestinations.length,
    );
    expect(new Set(architectureDestinations.map(({ href }) => href)).size).toBe(
      architectureDestinations.length,
    );
  });

  it("leaves other hub destinations and the single finance environment unchanged", () => {
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
      label: "Income & Financial Operations",
      href: "/financial-operations",
      type: "workspace",
    });
    expect(architectureDestinationById.get("finance")?.hub).toBeUndefined();
  });
});
