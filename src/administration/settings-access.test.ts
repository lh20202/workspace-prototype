import { describe, expect, it } from "vitest";
import { siteSettingsOptions } from "../components/SiteSettingsButton";
import { getSiteAdminModel } from "./model";

const sites = ["/planning", "/content-delivery", "/digital-tech", "/logistics"];
const siteOptions = [
  "Site contents",
  "Site information",
  "Site permissions",
  "Apply a site template",
  "Site usage",
  "Change the look",
];
const ownerOptions = ["information", "permissions", "templates", "appearance"];

describe("contextual site settings follow delegated access", () => {
  it("offers the same complete six site options to both delegated roles at every core site Home", () => {
    for (const path of sites) {
      const administrator = getSiteAdminModel("elliot", path, "")!;
      const adviser = getSiteAdminModel("leonie", path, "")!;
      expect(
        siteSettingsOptions(administrator).map((option) => option.name),
      ).toEqual(siteOptions);
      expect(siteSettingsOptions(adviser)).toEqual(
        siteSettingsOptions(administrator),
      );
      expect(
        siteSettingsOptions(adviser).some((option) =>
          ["library", "list"].includes(option.id),
        ),
      ).toBe(false);
    }
  });

  it("retains only ordinary contents and usage actions for business and engineering roles where they can enter", () => {
    for (const role of ["taylor", "devon", "maya", "sam"])
      for (const path of sites) {
        const site = getSiteAdminModel(role, path, "")!;
        const options = siteSettingsOptions(site);
        expect(
          options.some((option) => ownerOptions.includes(option.id)),
          `${role} ${path}`,
        ).toBe(false);
        expect(
          options.some((option) => ["library", "list"].includes(option.id)),
        ).toBe(false);
        expect(options.map((option) => option.id)).toEqual(
          site.canAccess ? ["contents", "usage"] : [],
        );
      }
  });

  it("inserts Library settings only for the permitted current library and retains the full site menu", () => {
    for (const role of ["leonie", "elliot"])
      for (const path of [
        "/planning/cycles",
        "/content-delivery/production",
        "/digital-tech/m365",
        "/logistics/operations",
      ]) {
        const site = getSiteAdminModel(role, path, "")!;
        const options = siteSettingsOptions(site);
        expect(site.current?.kind).toBe("library");
        expect(options.map((option) => option.name)).toEqual([
          "Site contents",
          "Library settings",
          ...siteOptions.slice(1),
        ]);
        expect(options.find((option) => option.id === "library")?.detail).toBe(
          site.current?.name,
        );
        expect(options.some((option) => option.id === "list")).toBe(false);
      }
  });

  it("inserts List settings for actual lists without offering Library settings", () => {
    for (const role of ["leonie", "elliot"])
      for (const path of [
        "/logistics/locations",
        "/content-delivery/production-register",
      ]) {
        const site = getSiteAdminModel(role, path, "")!;
        const options = siteSettingsOptions(site);
        expect(site.current?.kind).toBe("list");
        expect(options.map((option) => option.name)).toEqual([
          "Site contents",
          "List settings",
          ...siteOptions.slice(1),
        ]);
        expect(options.find((option) => option.id === "list")?.detail).toBe(
          site.current?.name,
        );
        expect(options.some((option) => option.id === "library")).toBe(false);
      }
  });

  it("offers no menu through a denied business site or protected route, regardless of technical site-management capability", () => {
    for (const role of ["leonie", "elliot"])
      for (const path of [
        "/planning/restricted",
        "/executive",
        "/employment-admin",
        "/welfare-representation",
        "/digital-tech/security",
        "/financial-operations/income/high-value-payment",
      ]) {
        const site = getSiteAdminModel(role, path, "")!;
        expect(site.canAccess).toBe(false);
        expect(siteSettingsOptions(site)).toEqual([]);
      }
  });
});
