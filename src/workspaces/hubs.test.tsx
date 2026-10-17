import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import {
  architectureSections,
  environmentsForHub,
  hubDefinitions,
  strictlyConfidentialWorkspaceIds,
  workspaceById,
  workspaceRegistry,
  environmentRegistry,
  environmentById,
  resolveLegacy,
} from "./registry";
import Directory from "../intranet/Directory";
import { personnelDestinations } from "../intranet/architectureDestinations";
import HubNavigation from "../components/HubNavigation";
import { getHubNavigationModel } from "../components/hubNavigationModel";
import ExecutiveApp from "../executive/ExecutiveApp";
import TeamsPreview from "../intranet/TeamsPreview";
import {
  staff,
  peopleDirectory,
  resolveStaffPerson,
} from "../intranet/catalog";
import { defaultTeamsContext, teamsGroups } from "../teams/navigation";
import { prototypeForPath, pageTitle } from "../utils/routes";
import { accessFocalPoint, accessWorkspaceId } from "../access/model";

function at(path: string, person = "maya") {
  vi.stubGlobal("location", new URL(path, "https://example.test"));
  vi.stubGlobal("sessionStorage", { getItem: () => person });
}
function directoryWorkspaceLink(html: string, href: string) {
  return html.match(
    new RegExp(
      `<a(?=[^>]*class="directory-workspace-link[^"]*")(?=[^>]*href="${href}")[^>]*>[\\s\\S]*?<\\/a>`,
    ),
  )?.[0];
}
afterEach(() => vi.unstubAllGlobals());

describe("hub families retain one canonical owner for every environment", () => {
  it("defines the three hub families and keeps finance outside a multi-site hub", () => {
    expect(hubDefinitions.map((hub) => [hub.name, hub.workspaceIds])).toEqual([
      ["Marketing & Sales", ["audience", "content", "logistics", "customer"]],
      [
        "Org Central",
        [
          "executive",
          "planning",
          "projects",
          "quality",
          "legal",
          "services",
          "digital",
          "archives",
        ],
      ],
      ["Personnel", ["people", "employment", "welfare"]],
    ]);
    expect(architectureSections).toEqual([
      { type: "hub", id: "sales-marketing" },
      { type: "hub", id: "infrastructure" },
      { type: "hub", id: "personnel" },
      { type: "workspace", id: "finance" },
    ]);
    expect(workspaceById.get("finance")?.hubId).toBeUndefined();
    expect(
      workspaceRegistry.filter((workspace) => workspace.id === "finance"),
    ).toHaveLength(1);
  });
  it("has no missing, duplicate or orphan environments and keeps routes stable", () => {
    const grouped = hubDefinitions.flatMap((hub) => environmentsForHub(hub.id));
    const independent = architectureSections
      .filter((section) => section.type === "workspace")
      .map((section) => workspaceById.get(section.id)!);
    expect([...grouped, ...independent].map((item) => item.id).sort()).toEqual(
      environmentRegistry.map((item) => item.id).sort(),
    );
    for (const hub of hubDefinitions)
      for (const environment of environmentsForHub(hub.id)) {
        expect(environment.hubId).toBe(hub.id);
        if (environment.environmentType === "wiki")
          expect(hub.id).toBe("sales-marketing");
      }
    expect(
      environmentsForHub("sales-marketing").map((item) => item.hubLabel),
    ).toEqual([
      "Research & Insight",
      "Creative Studio",
      "Acquisition Logistics",
      "Customer Relations",
      "Sales & Marketing Wiki",
      "Frontline Crew Portal",
      "Global Media Library",
    ]);
    expect(workspaceById.get("services")).toMatchObject({
      title: "Purchasing & Office",
      href: "/services",
    });
    expect(workspaceById.get("welfare")?.href).toBe("/welfare-representation");
    expect(
      prototypeForPath("/welfare-representation/employee-representation"),
    ).toBe("functional");
    expect(pageTitle("/welfare-representation")).toBe(
      "Welfare & Employee Representation",
    );
    expect(accessWorkspaceId("Organisation Services")).toBe("services");
    expect(
      accessFocalPoint({
        workspaceId: accessWorkspaceId(null, "council"),
        area: "Council participation",
      }).id,
    ).toBe("skyler");
  });
  it("surfaces only the Sales Wiki and Frontline Portal as distinct environments", () => {
    expect(
      hubDefinitions
        .filter((hub) => hub.wiki || hub.portal)
        .map((hub) => hub.id),
    ).toEqual(["sales-marketing"]);
    expect(
      workspaceRegistry.every(
        (workspace) => workspace.environmentType === "workspace",
      ),
    ).toBe(true);
    at("/architecture");
    const html = renderToStaticMarkup(createElement(Directory));
    for (const id of ["sales-wiki", "frontline-sales"]) {
      const environment = environmentById.get(id)!;
      expect(html).toContain(`href="${environment.href}"`);
      expect(html).not.toContain(
        `class="directory-workspace-link" href="${environment.href}"`,
      );
      expect(prototypeForPath(environment.href)).toBe(
        id === "sales-wiki" ? "wiki" : "frontline",
      );
    }
    expect(html).not.toMatch(
      /Infrastructure Wiki|Personnel Wiki|Financial Wiki/,
    );
  });
  it("renders four distinct hub panels, one workspace mark and a separate Department channels rail", () => {
    at("/architecture");
    const html = renderToStaticMarkup(createElement(Directory));
    for (const hub of hubDefinitions)
      expect(html).toContain(`aria-labelledby="hub-${hub.id}"`);
    expect(html).toContain('aria-labelledby="hub-finance"');
    expect(html).toContain('aria-label="Department channels"');
    expect(html).not.toContain('class="directory-teams"');
    expect(html).not.toContain("Open my Teams");
    expect(html).not.toContain("Direction &amp; assurance");
    expect(html).not.toContain("Shared services");
    expect(html.match(/class="workspace-icon"/g)).toHaveLength(15);
    expect(html.match(/data-environment="workspace"/g)).toHaveLength(16);
    expect(html.match(/title="Controlled access"/g)).toHaveLength(4);
    expect(strictlyConfidentialWorkspaceIds.slice().sort()).toEqual([
      "employment",
      "executive",
      "welfare",
    ]);
    expect(html).not.toMatch(
      /Support pathway review|Reporting route review|Representative consultation cycle/,
    );
  });
  it("renders three ordinary Personnel entrances followed by quiet protected text links", () => {
    at("/architecture");
    const html = renderToStaticMarkup(createElement(Directory));
    expect(html).not.toContain("Controlled environments");
    expect(html).not.toContain("People &amp; organisation</h3>");
    for (const destination of personnelDestinations.normal) {
      const tile = directoryWorkspaceLink(html, destination.href);
      expect(tile).toBeDefined();
      expect(tile).toContain(destination.label.replace(/&/g, "&amp;"));
      expect(tile).toContain('class="workspace-icon"');
      expect(tile).not.toContain("Controlled access");
    }
    expect(directoryWorkspaceLink(html, "/people-culture")).toBeUndefined();
    for (const destination of personnelDestinations.controlled) {
      expect(directoryWorkspaceLink(html, destination.href)).toBeUndefined();
      expect(html).toContain(`href="${destination.href}"`);
    }
    expect(personnelDestinations.controlled).toHaveLength(3);
    expect(html).toContain("Personnel Admin");
    expect(html).toContain("Workers&#x27; Union");
    expect(html).toContain("Welfare &amp; Safeguarding");
  });
  it("keeps the Personnel hub at environment level for every functional entrance", () => {
    at("/people-culture/workforce?staff=jamie", "jamie");
    for (const destination of personnelDestinations.normal) {
      const html = renderToStaticMarkup(
        createElement(HubNavigation, {
          pathname: destination.href,
          search: "?staff=jamie",
        }),
      );
      const model = getHubNavigationModel({
        pathname: destination.href,
        search: "?staff=jamie",
      })!;
      expect(html.match(/<a\b/g)).toHaveLength(1);
      expect(html).toContain("Workspaces");
      expect(html).toContain("Company intranet");
      expect(model.workspaces.map(({ id }) => id)).toEqual([
        "people",
        "employment",
        "welfare",
      ]);
      expect(
        model.workspaces
          .filter(({ isCurrent }) => isCurrent)
          .map(({ destinationHref }) => destinationHref),
      ).toEqual(["/people-culture?staff=jamie"]);
      expect(model.related.map(({ id }) => id)).toEqual(["taskforce"]);
      for (const normal of personnelDestinations.normal)
        expect(model.workspaces.some(({ href }) => href === normal.href)).toBe(
          false,
        );
    }
  });
});

describe("confidential membership remains separate from hub association", () => {
  it("retains the explicitly selected colleague when returning to Architecture", () => {
    at("/architecture?staff=devon", "maya");
    const html = renderToStaticMarkup(createElement(Directory));
    expect(html).toContain('<option value="devon" selected=""');
    expect(html).toContain('href="/digital-tech?staff=devon"');
    expect(html).toContain('href="/sales-marketing/wiki?staff=devon"');
    expect(html).toContain(
      'href="/teams?staff=taylor&amp;department=stt&amp;departmentPreview=strategy-technology&amp;tab=Posts"',
    );
  });
  it("denies ordinary CEO entry without exposing executive working files", () => {
    at("/executive?staff=maya");
    const denied = renderToStaticMarkup(createElement(ExecutiveApp));
    expect(denied).toContain("Access required");
    expect(denied).toContain("<strong>Robin Avery</strong>");
    expect(denied).not.toContain("Governance Submission Schedule.xlsx");
    at("/executive?staff=maya&preview=leadership");
    expect(renderToStaticMarkup(createElement(ExecutiveApp))).toContain(
      "Access required",
    );
    at("/executive?staff=robin", "robin");
    expect(renderToStaticMarkup(createElement(ExecutiveApp))).toContain(
      "Governance Submission Schedule.xlsx",
    );
    at("/executive/leadership?preview=leadership");
    const leadership = renderToStaticMarkup(createElement(ExecutiveApp));
    expect(leadership).toContain("Access required");
    expect(leadership).not.toContain('aria-label="Signed in as Avery Quinn"');
    at("/executive/leadership?staff=robin", "robin");
    expect(renderToStaticMarkup(createElement(ExecutiveApp))).not.toContain(
      'class="access-boundary',
    );
  });
  it("retains the independent representative as a contact without a hidden preview identity", () => {
    expect(peopleDirectory.find((person) => person.id === "skyler")?.role).toBe(
      "Independent Employee Representative",
    );
    expect(staff.some((person) => person.id === "skyler")).toBe(false);
    const fallback = resolveStaffPerson("skyler");
    expect(fallback.id).toBe("taylor");
    expect(defaultTeamsContext(fallback).departmentId).toBe(
      fallback.departmentId,
    );
    const groups = teamsGroups(fallback).map((group) => group.id);
    expect(groups).toContain("company");
    expect(groups).not.toContain("logistics");
    expect(groups).not.toContain("welfare");
    expect(groups).not.toContain("publishing");
    at("/teams?staff=skyler", "skyler");
    const html = renderToStaticMarkup(createElement(TeamsPreview));
    expect(html).toContain("Signed in as Taylor Brooks");
    expect(html).not.toContain("PAC Department");
    expect(html).not.toContain("Manage teams");
  });
  it("keeps legacy legal investigations with Legal when sensitive personnel routes move", () => {
    expect(resolveLegacy("/services/legal/investigations/INV-008")).toBe(
      "/legal-compliance/protected/formal-cases",
    );
    expect(resolveLegacy("/employee-council/deliberations/private-note")).toBe(
      "/welfare-representation/employee-representation",
    );
    expect(
      resolveLegacy("/employment-admin/protected/welfare/old-record"),
    ).toBe("/welfare-representation/welfare-support");
  });
});
