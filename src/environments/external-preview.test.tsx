import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ExternalEnvironmentPreview from "./ExternalEnvironmentPreview";
import {
  adminPlatforms,
  externalEnvironments,
  externalPreviewHref,
} from "./catalog";
import {
  canReturnToReferrer,
  externalPreviewForPath,
  externalReturnHref,
} from "./previewRoutes";
import GovernanceApp from "../executive/GovernanceApp";
import { pageTitle } from "../utils/routes";
import { functionalConfigs } from "../workspaces/config";
import { workspaceById } from "../workspaces/registry";
import { tools as studioTools } from "../content/data";
import { systems as financeSystems } from "../finance/data";

afterEach(() => vi.unstubAllGlobals());
describe("shared external boundary", () => {
  it("retires every currently linked tool simulation through the common boundary", () => {
    const paths = [
      ...functionalConfigs.flatMap((config) =>
        config.tools.map(
          (tool) => `${workspaceById.get(config.id)!.href}/systems/${tool.id}`,
        ),
      ),
      ...studioTools.map((tool) => `/content-delivery/tools/${tool.id}`),
      ...financeSystems.map(
        (tool) => `/financial-operations/systems/${tool.id}`,
      ),
    ];
    for (const path of paths)
      expect(externalPreviewForPath(path), path).toBeTruthy();
  });
  it.each([...externalEnvironments, ...adminPlatforms])(
    "uses one accessible, current-tab preview for $name",
    (environment) => {
      vi.stubGlobal(
        "location",
        new URL(
          externalPreviewHref(environment.id) + "?staff=leonie",
          "https://example.test",
        ),
      );
      const html = renderToStaticMarkup(
        createElement(ExternalEnvironmentPreview, {
          environmentId: environment.id,
        }),
      );
      expect(externalPreviewForPath(`/external/${environment.id}`)).toBe(
        environment,
      );
      expect(html).toContain(`data-environment="${environment.id}"`);
      expect(html).toContain('class="external-backdrop" aria-hidden="true"');
      expect(html).toContain('href="/architecture?staff=leonie"');
      expect(html).toContain("Back to demo");
      if (environment.logo) expect(html).toContain(`src="${environment.logo}"`);
      expect(html).not.toMatch(
        /target="_blank"|<nav|m365-header|hub-navigation|teams-shell|workspace-icon/,
      );
      expect(html).not.toMatch(/unsupported|not included|unfinished|missing/i);
      expect(html).toContain(
        environment.variant
          ? "COMING SOON"
          : "This linked environment is represented at a high level in this demo.",
      );
      if (!environment.variant) expect(html).not.toContain("COMING SOON");
    },
  );
  it("retains Governance and Frontline compatibility without their detailed applications", () => {
    for (const route of [
      "/governance",
      "/governance/approved",
      "/governance/meeting-papers",
    ]) {
      expect(externalPreviewForPath(route)?.id).toBe("members");
      expect(pageTitle(route)).toBe("Membership Portal | Demo");
    }
    for (const route of ["/frontline-sales", "/frontline-sales/briefing"])
      expect(externalPreviewForPath(route)?.variant).toBe("frontline");
    vi.stubGlobal(
      "location",
      new URL(
        "https://example.test/governance/approved?record=GOV-2026-04&staff=robin",
      ),
    );
    const html = renderToStaticMarkup(createElement(GovernanceApp));
    expect(html).toContain('data-environment="members"');
    expect(html).not.toContain("Authoritative governance records");
  });
  it("resolves contextual legacy systems to the same canonical brand", () => {
    for (const route of [
      "/customer-relations/systems/hubspot",
      "/digital-tech/systems/salesforce",
      "/financial-operations/systems/salesforce",
      "/content-delivery/tools/salesforce",
    ])
      expect(externalPreviewForPath(route)?.id).toBe("relovia");
    expect(
      externalPreviewForPath("/financial-operations/systems/netsuite")?.id,
    ).toBe("velora");
    expect(
      externalPreviewForPath("/audience-innovation/systems/website-analytics")
        ?.name,
    ).toBe("Website Analytics");
    expect(
      externalPreviewForPath("/audience-innovation/systems/performance")?.name,
    ).toBe("Performance Analysis");
    expect(externalPreviewForPath("/digital-tech/systems/github")?.name).toBe(
      "GitHub Enterprise",
    );
    expect(externalPreviewForPath("/content-delivery/tools")).toBeUndefined();
  });
  it("returns to the originating demo context without open redirects or preview loops", () => {
    const origin = "https://example.test";
    expect(
      externalReturnHref(
        "?returnTo=%2Fcustomer-relations%2Fcare%3Fstaff%3Dtaylor",
        "",
        origin,
      ),
    ).toBe("/customer-relations/care?staff=taylor");
    expect(
      externalReturnHref("", origin + "/architecture?staff=maya", origin),
    ).toBe("/architecture?staff=maya");
    for (const destination of [
      "https://outside.test/private",
      "//outside.test",
      "/external/velora",
      "/governance/approved",
      "/frontline-sales",
      "/financial-operations/systems/netsuite",
    ])
      expect(
        externalReturnHref(
          `?returnTo=${encodeURIComponent(destination)}`,
          "",
          origin,
        ),
      ).toBe("/architecture");
  });
  it("uses browser history only for a same-site non-preview referrer", () => {
    const origin = "https://example.test";
    expect(
      canReturnToReferrer(`${origin}/financial-operations/income`, origin),
    ).toBe(true);
    expect(canReturnToReferrer(`${origin}/external/velora`, origin)).toBe(
      false,
    );
    expect(
      canReturnToReferrer(
        `${origin}/financial-operations/systems/netsuite`,
        origin,
      ),
    ).toBe(false);
    expect(canReturnToReferrer("https://outside.test/page", origin)).toBe(
      false,
    );
    expect(canReturnToReferrer("", origin)).toBe(false);
  });
});
