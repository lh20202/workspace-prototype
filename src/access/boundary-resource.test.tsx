import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import FunctionalApp from "../workspaces/FunctionalApp";
import AudienceApp from "../audience/AudienceApp";
import ContentApp from "../content/ContentApp";
import { hasAlternativePreviewAccess, type AccessResource } from "./policy";

const captured = vi.hoisted(() => ({ resources: [] as AccessResource[] }));
vi.mock("../components/PreviewRoleContext", () => ({
  useDeniedPreviewResource: (resource?: AccessResource) => {
    if (resource) captured.resources.push(resource);
  },
}));
afterEach(() => {
  captured.resources.length = 0;
  vi.unstubAllGlobals();
});

/** Whole-site membership must not advertise access to a narrower closed subject. */
describe("the role signpost uses the actual denied destination", () => {
  it.each([
    [
      "/digital-tech/protected/credentials?staff=taylor",
      "digital",
      "credentials",
      false,
    ],
    [
      "/digital-tech/protected/security?staff=taylor",
      "digital",
      "security",
      true,
    ],
    [
      "/employment-admin/protected/payroll-inputs?staff=taylor",
      "employment",
      "payroll-inputs",
      false,
    ],
    [
      "/employment-admin/protected/employee-records?staff=taylor",
      "employment",
      "employee-records",
      true,
    ],
  ] as const)(
    "checks the precise protected subject at %s",
    (path, workspaceId, areaId, alternative) => {
      vi.stubGlobal("location", new URL(path, "https://example.test"));
      vi.stubGlobal("sessionStorage", { getItem: () => "taylor" });
      expect(renderToStaticMarkup(<FunctionalApp />)).toContain(
        "Access required",
      );
      expect(captured.resources).toEqual([
        { kind: "area", workspaceId, areaId },
      ]);
      expect(hasAlternativePreviewAccess(captured.resources[0], "taylor")).toBe(
        alternative,
      );
    },
  );
  it.each([
    [
      "/audience-innovation/research/website-usability/participant-administration?staff=maya",
      "audience",
      AudienceApp,
    ],
    [
      "/content-delivery/packages/PKG-107/protected/participant-administration?staff=maya",
      "content",
      ContentApp,
    ],
  ] as const)(
    "does not offer specialist-workspace membership as access to closed participant administration",
    (path, workspaceId, App) => {
      vi.stubGlobal("location", new URL(path, "https://example.test"));
      vi.stubGlobal("sessionStorage", { getItem: () => "maya" });
      expect(renderToStaticMarkup(<App />)).toContain("Access required");
      expect(captured.resources).toEqual([
        { kind: "area", workspaceId, areaId: "participant-administration" },
      ]);
      expect(hasAlternativePreviewAccess(captured.resources[0], "maya")).toBe(
        false,
      );
    },
  );
});
