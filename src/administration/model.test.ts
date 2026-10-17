import { describe, expect, it } from "vitest";
import { getSiteAdminModel } from "./model";
import { previewRoles, canAccessArea } from "../access/policy";
import { documents as planningDocuments } from "../data/workspace";
import {
  definitions as contentDefinitions,
  libraryFor as contentLibrary,
  documentFor,
} from "../content/libraries";
import {
  files as contentFiles,
  packages,
  pipelineViews,
} from "../content/data";
import { functionalLibraries } from "../workspaces/siteArchitecture";
import { configById } from "../workspaces/config";
import { files as logisticsFiles, permits } from "../logistics/data";
import { savedViews, locationViews } from "../logistics/query";
import { wikiLibrary } from "../wiki/content";

describe("site administration resolves permitted canonical content", () => {
  it("gives the two delegated roles identical controls while ordinary and technical roles remain ordinary", () => {
    for (const path of [
      "/planning",
      "/content-delivery",
      "/digital-tech",
      "/logistics",
    ]) {
      const adviser = getSiteAdminModel("leonie", path, "")!;
      const administrator = getSiteAdminModel("elliot", path, "")!;
      expect(adviser.canManage).toBe(true);
      expect(adviser.canAccess).toBe(true);
      expect(administrator.canManage).toBe(true);
      expect(adviser.contents.map((entry) => entry.id)).toEqual(
        administrator.contents.map((entry) => entry.id),
      );
      expect(getSiteAdminModel("devon", path, "")?.canManage).toBe(false);
      expect(getSiteAdminModel("taylor", path, "")?.canManage).toBe(false);
    }
  });

  it("uses the existing Studio and Digital definitions and working file identities", () => {
    const studio = getSiteAdminModel(
      "leonie",
      "/content-delivery/production",
      "",
    )!;
    expect(studio.current?.definition).toBe(contentDefinitions.production);
    expect(studio.current?.documents).toEqual(
      contentFiles
        .filter((file) => contentLibrary(file) === "production")
        .map(documentFor),
    );
    expect(studio.current?.items).toBe(studio.current?.documents?.length);
    const digital = getSiteAdminModel("elliot", "/digital-tech/m365", "")!;
    const source = functionalLibraries.digital.find((library) =>
      library.areas.includes("m365"),
    )!;
    expect(digital.current?.definition).toBe(source);
    expect(digital.current?.views).toEqual(source.views);
    for (const file of digital.current?.documents || []) {
      expect(file).toBe(
        configById.get("digital")!.files.find((item) => item.id === file.id),
      );
      expect(
        canAccessArea(
          "elliot",
          "digital",
          configById.get("digital")!.files.find((item) => item.id === file.id)!
            .area,
        ),
      ).toBe(true);
    }
    expect(
      digital.current?.columns.some((field) => field.key === "sensitivity"),
    ).toBe(true);
    expect(digital.contentTypes).toEqual(
      expect.arrayContaining(source.contentTypes || []),
    );
  });

  it("adapts Planning and Logistics metadata without introducing new canonical files or invented views", () => {
    const planning = getSiteAdminModel("leonie", "/planning/cycles", "")!;
    expect(planning.current?.id).toBe("planning");
    expect(planning.current?.documents?.map((file) => file.id)).toEqual(
      planningDocuments
        .filter((file) => file.library === "planning")
        .map((file) => file.id),
    );
    expect(planning.contents.some((entry) => entry.id === "restricted")).toBe(
      false,
    );
    const logistics = getSiteAdminModel("elliot", "/logistics/operations", "")!;
    expect(logistics.current?.documents?.map((file) => file.id)).toEqual(
      logisticsFiles
        .filter((file) => file.library === "operations")
        .map((file) => file.id),
    );
    expect(logistics.current?.views.map((view) => view.name)).toEqual([
      ...savedViews,
    ]);
    expect(logistics.current?.definition?.contentTypes).toBeUndefined();
    for (const document of logistics.current?.documents || [])
      expect(document.sensitivity).toBe(
        logisticsFiles.find((file) => file.id === document.id)!.sensitivity,
      );
  });

  it("selects actual list contexts and keeps document-only settings off them", () => {
    const locations = getSiteAdminModel("leonie", "/logistics/locations", "")!;
    expect(locations.current?.kind).toBe("list");
    expect(locations.current?.items).toBe(permits.length);
    expect(locations.current?.views.map((view) => view.name)).toEqual([
      ...locationViews,
    ]);
    expect(locations.current?.documents).toBeUndefined();
    expect(locations.current?.defaultSensitivity).toBeUndefined();
    const productions = getSiteAdminModel(
      "elliot",
      "/content-delivery/production-register",
      "",
    )!;
    expect(productions.current?.kind).toBe("list");
    expect(productions.current?.items).toBe(packages.length);
    expect(productions.current?.views.map((view) => view.name)).toEqual(
      pipelineViews,
    );
    expect(
      getSiteAdminModel(
        "elliot",
        "/content-delivery/pipeline",
        "?view=All+Packages",
      )?.current?.id,
    ).toBe("production-register");
  });

  it("does not offer management or contents through a denied business route or direct file parameter", () => {
    const restricted = planningDocuments.find(
      (file) => file.library === "restricted",
    )!;
    const paths = [
      ["/planning/restricted", ""],
      ["/planning/cycles", `?document=${restricted.id}`],
      ["/digital-tech/protected/credentials", ""],
      ["/digital-tech/protected/unknown-subject", ""],
      ["/digital-tech/security", ""],
      [
        "/content-delivery/packages/PKG-107/protected/participant-administration",
        "",
      ],
      ["/content-delivery/packages/PKG-107/protected/unknown-subject", ""],
      [
        "/audience-innovation/research/website-usability/participant-administration",
        "",
      ],
      ["/financial-operations/income/high-value-payment", ""],
      ["/projects/PRJ-2026-014", ""],
      ["/executive", ""],
      ["/employment-admin", ""],
      ["/welfare-representation", ""],
    ];
    for (const person of ["leonie", "elliot"])
      for (const [pathname, search] of paths) {
        const model = getSiteAdminModel(person, pathname, search);
        expect(model?.canAccess || false, `${person} ${pathname}`).toBe(false);
        expect(model?.canManage || false, `${person} ${pathname}`).toBe(false);
        expect(model?.current).toBeUndefined();
        expect(model?.contents || []).toEqual([]);
      }
    for (const person of previewRoles) {
      if (!["leonie", "elliot"].includes(person.id)) continue;
      expect(person.restrictedAreas).toEqual({});
      expect(person.projectMemberships).toEqual([]);
    }
  });

  it("exposes only the two intentionally configured defaults and never relabels existing files", () => {
    const before = JSON.stringify(
      contentFiles.map((file) => [file.id, file.sensitivity]),
    );
    const studio = getSiteAdminModel(
      "leonie",
      "/content-delivery/production",
      "",
    )!;
    const wiki = getSiteAdminModel("elliot", "/sales-marketing/wiki/a-z", "")!;
    expect(studio.current?.defaultSensitivity).toBe("Internal");
    expect(wiki.current?.definition).toBe(wikiLibrary);
    expect(wiki.current?.defaultSensitivity).toBe("Internal");
    const defaults = [
      studio,
      wiki,
      getSiteAdminModel("elliot", "/planning", "")!,
      getSiteAdminModel("elliot", "/digital-tech", "")!,
      getSiteAdminModel("elliot", "/logistics", "")!,
    ].flatMap((site) =>
      site.contents.filter((entry) => entry.defaultSensitivity),
    );
    expect(defaults.map((entry) => entry.id).sort()).toEqual(
      ["production", wikiLibrary.id].sort(),
    );
    expect(
      JSON.stringify(contentFiles.map((file) => [file.id, file.sensitivity])),
    ).toBe(before);
    expect(
      contentFiles.find((file) => file.id === "community-final")?.sensitivity,
    ).toBe("Public");
  });

  it("retains real site destinations and does not build a channel or external admin backdoor", () => {
    for (const path of [
      "/planning",
      "/content-delivery",
      "/digital-tech",
      "/logistics",
    ])
      for (const entry of getSiteAdminModel("elliot", path, "")!.contents) {
        const destination = getSiteAdminModel("elliot", entry.href, "");
        expect(destination?.id).toBe(getSiteAdminModel("elliot", path, "")?.id);
        expect(destination?.current?.id).toBe(entry.id);
      }
    expect(
      getSiteAdminModel("elliot", "/teams", "?workspace=digital"),
    ).toBeUndefined();
    expect(getSiteAdminModel("elliot", "/logistics/teams", "")).toBeUndefined();
    expect(
      getSiteAdminModel("elliot", "/external/systems", ""),
    ).toBeUndefined();
    expect(
      getSiteAdminModel("elliot", "/projects/support", "")?.canAccess,
    ).toBe(true);
    expect(
      getSiteAdminModel("elliot", "/projects/control", "")?.canAccess,
    ).toBe(false);
  });
});
