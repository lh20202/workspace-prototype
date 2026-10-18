import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  previewRoles,
  previewRoleGroups,
  canAdministerSites,
  canAccessArea,
  canAccessWorkspace,
  canAccessProject,
  canAccessWikiArea,
  hasAlternativePreviewAccess,
} from "./policy";
import SiteSettingsButton, {
  siteAdministrationOptions,
} from "../components/SiteSettingsButton";
import { teamsGroups } from "../teams/navigation";
import { visibleWorkspaceChannels } from "../teams/visibility";
import { resolveStaffPerson } from "../intranet/catalog";
import { sharepointDestination } from "../teams/sharepointDestination";
import FinanceApp from "../finance/FinanceApp";

afterEach(() => vi.unstubAllGlobals());

describe("business and delegated site administration roles", () => {
  it("offers nine roles once in two clear native-select groups", () => {
    const grouped = previewRoleGroups.flatMap((group) => [...group.roleIds]);
    expect(grouped).toHaveLength(9);
    expect(new Set(grouped).size).toBe(9);
    expect(new Set(grouped)).toEqual(
      new Set(previewRoles.map((role) => role.id)),
    );
  });
  it("gives Sales ordinary shared knowledge and three useful Studio desks", () => {
    for (const workspace of ["audience", "content", "logistics", "customer"])
      expect(canAccessWorkspace("nadia", workspace)).toBe(true);
    expect(canAccessWikiArea("nadia", "insight")).toBe(true);
    expect(
      canAccessArea("nadia", "audience", "participant-administration"),
    ).toBe(false);
    expect(canAccessArea("nadia", "content", "pre-release-briefing")).toBe(
      false,
    );
    expect(
      visibleWorkspaceChannels(resolveStaffPerson("nadia"), "content"),
    ).toEqual(["Editorial Desk", "Social Desk", "Production Coordination"]);
    expect(
      teamsGroups(resolveStaffPerson("nadia")).map((group) => group.id),
    ).toEqual(["company", "content", "marketing-growth"]);
  });
  it("gives Finance normal operations and selected exception handling without protected authority", () => {
    for (const area of [
      "income",
      "reconciliation",
      "payments",
      "planning",
      "accounting",
      "treasury",
      "payment-exceptions",
      "refund-chargeback",
    ])
      expect(canAccessArea("sam", "finance", area)).toBe(true);
    for (const area of [
      "payroll",
      "bank-mandates",
      "signatories",
      "banking-security",
      "high-value-payment",
      "exceptional-authorisation",
    ])
      expect(canAccessArea("sam", "finance", area)).toBe(false);
    expect(
      teamsGroups(resolveStaffPerson("sam")).map((group) => group.id),
    ).toEqual(["company", "planning", "finance-services"]);
    vi.stubGlobal(
      "location",
      new URL(
        "/financial-operations/income/payment-exceptions?staff=sam",
        "https://example.test",
      ),
    );
    const html = renderToStaticMarkup(<FinanceApp />);
    expect(html).toContain(
      "Individual payment details and live financial records are not held in this demonstration.",
    );
    expect(
      html.match(/class="finance-breadcrumb">[\s\S]*?<\/div>/)?.[0],
    ).toContain("Customer Payment Exceptions");
    expect(
      html.match(/class="finance-breadcrumb">[\s\S]*?<\/div>/)?.[0],
    ).not.toContain("Access required");
  });
  it("opens delegated site settings while keeping business security separate", () => {
    expect(canAdministerSites("elliot")).toBe(true);
    expect(canAdministerSites("leonie")).toBe(true);
    for (const role of previewRoles.filter(
      (role) => !["elliot", "leonie"].includes(role.id),
    ))
      expect(canAdministerSites(role)).toBe(false);
    for (const [workspace, area] of [
      ["executive", "leadership"],
      ["employment", "employee-records"],
      ["welfare", "welfare-support"],
      ["legal", "privileged"],
      ["finance", "bank-mandates"],
      ["digital", "security"],
    ])
      expect(canAccessArea("elliot", workspace, area)).toBe(false);
    expect(canAccessProject("elliot", "PRJ-2026-014")).toBe(true);
    expect(canAccessProject("elliot", "PRJ-2026-027")).toBe(false);
    expect(
      teamsGroups(resolveStaffPerson("elliot")).map((group) => group.id),
    ).toEqual(["company", "digital", "strategy-technology"]);
    expect(
      visibleWorkspaceChannels(resolveStaffPerson("elliot"), "digital"),
    ).toEqual([
      "M365 & SPFx",
      "Architecture & Governance",
      "Workspace & Wiki Moderators",
    ]);
    vi.stubGlobal(
      "location",
      new URL("/digital-tech?staff=elliot", "https://example.test"),
    );
    expect(
      renderToStaticMarkup(<SiteSettingsButton onMessage={() => {}} />),
    ).toContain('aria-label="Site settings"');
    vi.stubGlobal(
      "location",
      new URL("/executive?staff=elliot", "https://example.test"),
    );
    expect(
      renderToStaticMarkup(<SiteSettingsButton onMessage={() => {}} />),
    ).not.toContain('aria-label="Site settings"');
    expect(siteAdministrationOptions.map((option) => option.name)).toEqual([
      "Site contents",
      "Site information",
      "Site permissions",
      "Apply a site template",
      "Site usage",
      "Change the look",
    ]);
  });
  it("bases role help on precise real participation and protected permissions", () => {
    expect(
      hasAlternativePreviewAccess(
        { kind: "channel", workspaceId: "content", channelId: "editorial" },
        "maya",
      ),
    ).toBe(false);
    expect(
      hasAlternativePreviewAccess(
        { kind: "channel", workspaceId: "content", channelId: "media" },
        "maya",
      ),
    ).toBe(false);
    expect(
      hasAlternativePreviewAccess(
        { kind: "department", departmentId: "finance-services" },
        "robin",
      ),
    ).toBe(true);
    expect(
      hasAlternativePreviewAccess(
        { kind: "department", departmentId: "communications" },
        "robin",
      ),
    ).toBe(false);
  });
  it("returns workspace Teams to their actual canonical SharePoint parents", () => {
    expect(sharepointDestination("content")).toBe("/content-delivery");
    expect(sharepointDestination("digital")).toBe("/digital-tech");
    expect(sharepointDestination("logistics")).toBe("/logistics");
    expect(sharepointDestination("planning")).toBe("/planning");
    expect(sharepointDestination("projects")).toBe("/projects");
  });
});
