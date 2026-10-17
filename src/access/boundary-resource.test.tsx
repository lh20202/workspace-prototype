import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import FunctionalApp from "../workspaces/FunctionalApp";
import AudienceApp from "../audience/AudienceApp";
import ContentApp from "../content/ContentApp";
import AccessBoundary from "./AccessBoundary";
import { PreviewRoleProvider } from "../components/PreviewRoleContext";
import type { AccessResource } from "./policy";

afterEach(() => vi.unstubAllGlobals());
const prompt = "Try another preview role";

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
    (path, _workspaceId, _areaId, alternative) => {
      vi.stubGlobal("location", new URL(path, "https://example.test"));
      vi.stubGlobal("sessionStorage", { getItem: () => "taylor" });
      const html = renderToStaticMarkup(
        <PreviewRoleProvider>
          <FunctionalApp />
        </PreviewRoleProvider>,
      );
      expect(html).toContain("Access required");
      expect(html.includes(prompt)).toBe(alternative);
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
    (path, _workspaceId, App) => {
      vi.stubGlobal("location", new URL(path, "https://example.test"));
      vi.stubGlobal("sessionStorage", { getItem: () => "maya" });
      const html = renderToStaticMarkup(
        <PreviewRoleProvider>
          <App />
        </PreviewRoleProvider>,
      );
      expect(html).toContain("Access required");
      expect(html).not.toContain(prompt);
    },
  );

  it("places the action directly after the access box, before the sales alternative", () => {
    vi.stubGlobal(
      "location",
      new URL("/content-delivery?staff=maya", "https://example.test"),
    );
    vi.stubGlobal("sessionStorage", { getItem: () => "maya" });
    const html = renderToStaticMarkup(
      <PreviewRoleProvider>
        <ContentApp />
      </PreviewRoleProvider>,
    );
    expect(html).toContain('aria-controls="preview-role"');
    expect(html.indexOf("</section>")).toBeLessThan(html.indexOf(prompt));
    expect(html.indexOf(prompt)).toBeLessThan(html.indexOf("<aside"));
  });

  it.each<AccessResource>([
    { kind: "area", workspaceId: "welfare", areaId: "employee-representation" },
    {
      kind: "area",
      workspaceId: "digital",
      areaId: "nonexistent-private-area",
    },
    { kind: "department", departmentId: "communications" },
  ])(
    "does not suggest role access when no role can open the destination",
    (resource) => {
      const html = renderToStaticMarkup(
        <PreviewRoleProvider>
          <AccessBoundary
            workspaceId="welfare"
            area="Protected area"
            personId="taylor"
            resource={resource}
          />
        </PreviewRoleProvider>,
      );
      expect(html).not.toContain(prompt);
    },
  );

  it.each([
    [{ kind: "channel", workspaceId: "logistics", channelId: "general" }, true],
    [{ kind: "channel", workspaceId: "digital", channelId: "AI Lab" }, true],
    [
      {
        kind: "channel",
        workspaceId: "digital",
        channelId: "Workspace & Wiki Moderators",
      },
      true,
    ],
    [{ kind: "channel", workspaceId: "content", channelId: "editorial" }, true],
    [
      { kind: "channel", workspaceId: "logistics", channelId: "north-city" },
      false,
    ],
    [{ kind: "project-team", projectId: "PRJ-2026-021" }, false],
    [{ kind: "project-team", projectId: "PRJ-2026-027" }, true],
  ] as [AccessResource, boolean][])(
    "offers a Teams role cue only for actual participation: %j",
    (resource, alternative) => {
      const html = renderToStaticMarkup(
        <PreviewRoleProvider>
          <AccessBoundary
            workspaceId="logistics"
            area="Team conversation"
            personId="taylor"
            resource={resource}
          />
        </PreviewRoleProvider>,
      );
      expect(html.includes(prompt)).toBe(alternative);
    },
  );
});
