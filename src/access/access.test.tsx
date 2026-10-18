import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AccessBoundary from "./AccessBoundary";
import AccessRequest from "../service-desk/AccessRequest";
import { workspaceRegistry } from "../workspaces/registry";
import { configById } from "../workspaces/config";
import { staff } from "../intranet/catalog";
import {
  accessFocalPoint,
  accessWorkspace,
  accessWorkspaceId,
  safeAccessReturn,
  urgentAccessHref,
  isSalesAccessContext,
  frontlineSalesFocalPoint,
} from "./model";

afterEach(() => vi.unstubAllGlobals());
function renderRequest(path: string) {
  vi.stubGlobal("location", new URL(path, "https://example.test"));
  vi.stubGlobal("sessionStorage", { getItem: () => "maya" });
  return renderToStaticMarkup(createElement(AccessRequest));
}

describe("business focal point before technical access escalation", () => {
  it("offers the frontline alternative only for Sales & Marketing destinations", () => {
    for (const workspaceId of [
      "audience",
      "content",
      "logistics",
      "customer",
      "sales-wiki",
    ]) {
      expect(isSalesAccessContext({ workspaceId })).toBe(true);
      const html = renderToStaticMarkup(
        createElement(AccessBoundary, {
          workspaceId,
          area: "Specialist working material",
          personId: "maya",
        }),
      );
      expect(html).toContain("Are you frontline sales staff?");
      expect(html).toContain('href="/frontline-sales"');
      expect(html.indexOf("Access required")).toBeLessThan(
        html.indexOf("Are you frontline sales staff?"),
      );
      expect(html.indexOf("Open Frontline Crew Portal")).toBeLessThan(
        html.indexOf("Frontline sales focal point"),
      );
      expect(html.indexOf("Frontline sales focal point")).toBeLessThan(
        html.indexOf(
          workspaceId === "sales-wiki"
            ? "Need access to this Wiki area instead?"
            : "Need access to this workspace instead?",
        ),
      );
      expect(
        html.indexOf(
          workspaceId === "sales-wiki"
            ? "Contact Wiki focal point"
            : "Contact workspace focal point",
        ),
      ).toBeLessThan(html.indexOf("Raise urgent access request"));
    }
    for (const workspaceId of [
      "employment",
      "welfare",
      "digital",
      "finance",
      "projects",
      "planning",
    ]) {
      expect(isSalesAccessContext({ workspaceId })).toBe(false);
      const html = renderToStaticMarkup(
        createElement(AccessBoundary, {
          workspaceId,
          area: "Protected area",
        }),
      );
      expect(html).not.toContain("Frontline Sales Portal");
      expect(html).not.toContain("access-sales-alternative");
    }
    expect(
      staff.some((person) => person.id === frontlineSalesFocalPoint.id),
    ).toBe(false);
    expect(accessFocalPoint({ workspaceId: "frontline-sales" })).toEqual(
      frontlineSalesFocalPoint,
    );
  });

  it("describes the curated frontline Wiki view without implying general confidentiality", () => {
    const html = renderToStaticMarkup(
      createElement(AccessBoundary, {
        workspaceId: "sales-wiki",
        area: "Insight & Performance",
        personId: "maya",
        resource: { kind: "wiki", areaId: "insight" },
      }),
    );
    expect(html).toContain(
      "This knowledge area is outside the frontline view.",
    );
    expect(html).toContain("Need access to this Wiki area instead?");
    expect(html).toContain("is the focal point for this Wiki.");
    expect(html).toContain("Contact Wiki focal point");
    expect(html).toContain('class="environment-icon environment-icon-portal"');
    expect(html).toContain("access-lock access-boundary-lock");
    expect(html).not.toContain(
      "This area is limited to authorised participants.",
    );
    expect(html).not.toContain("Strictly confidential");
    expect(html).not.toContain("Need access to this workspace instead?");
  });

  it("gives every workspace one existing fictional contact and keeps special boundaries distinct", () => {
    for (const workspace of workspaceRegistry) {
      const focal = accessFocalPoint({ workspaceId: workspace.id });
      expect(focal.name).toBeTruthy();
      expect(focal.role).toBeTruthy();
      expect(accessWorkspace({ workspaceId: workspace.id }).title).toBe(
        workspace.title,
      );
    }
    expect(accessFocalPoint({ workspaceId: "employment" }).name).toBe(
      "Jamie Ellis",
    );
    expect(
      accessFocalPoint({
        workspaceId: "department",
        department: "people-culture",
      }).name,
    ).toBe("Clara Jensen");
    expect(accessFocalPoint({ workspaceId: "council" }).id).not.toBe(
      accessFocalPoint({ workspaceId: "people" }).id,
    );
    expect(accessWorkspaceId("Content Room")).toBe("content");
  });

  it("renders contact as the primary local action and urgent escalation as the smaller secondary link", () => {
    const html = renderToStaticMarkup(
      createElement(AccessBoundary, {
        workspaceId: "employment",
        area: "Employee Records & Contracts",
        personId: "maya",
        strict: true,
      }),
    );
    expect(html).toContain("Access required");
    expect(html).toContain("Jamie Ellis");
    expect(html.indexOf("Contact focal point")).toBeLessThan(
      html.indexOf("Raise urgent access request"),
    );
    expect(html).toContain("access-boundary-urgent");
    expect(html).toContain("access-boundary-strict");
    expect(html).not.toContain("poc-annotation");
    expect(html).not.toContain("<form");
    expect(html).not.toMatch(
      /href="(?:mailto:|https?:\/\/)|Request access through Freshservice/,
    );
  });

  it("carries only the intended access context into an urgent request", () => {
    const href = urgentAccessHref({
      workspaceId: "employment",
      area: "Employee Records & Contracts",
      location: "Employment / Employment Records & Contracts",
      personId: "jamie",
      returnHref: "/employment-admin",
      project: "PRJ-2026-034",
    });
    const params = new URL(href, "https://example.test").searchParams;
    expect(params.get("urgency")).toBe("urgent");
    expect(params.get("workspaceId")).toBe("employment");
    expect(params.get("workspace")).toBe("Personnel");
    expect(params.get("area")).toBe("Employee Records & Contracts");
    expect(params.get("location")).toBe(
      "Employment / Employment Records & Contracts",
    );
    expect(params.get("person")).toBe("jamie");
    expect(params.get("focalPoint")).toBe("alternate-people-culture");
    expect(params.get("reason")).toMatch(
      /time-sensitive.*focal point is unavailable/,
    );
    expect(params.get("project")).toBe("PRJ-2026-034");
    expect(params.has("files")).toBe(false);
    expect(params.has("record")).toBe(false);
    expect(safeAccessReturn("//external.test", "/employment-admin")).toBe(
      "/employment-admin",
    );
    expect(safeAccessReturn("/\\external.test", "/employment-admin")).toBe(
      "/employment-admin",
    );
    expect(safeAccessReturn("/\t/external.test", "/employment-admin")).toBe(
      "/employment-admin",
    );
  });

  it("keeps old non-urgent Service Desk links focal-point-first", () => {
    const html = renderRequest(
      "/service-desk/access-request?workspace=Employment%20%26%20Hiring%20Administration&area=Candidate%20Assessments&person=maya",
    );
    expect(html).toContain("Contact focal point");
    expect(html).toContain("Raise urgent access request");
    expect(html).not.toContain("access-ticket-form");
    expect(html).not.toContain("Prepare urgent access request");
  });

  it("prepopulates the urgent form and describes business authorisation without giving IT approval authority", () => {
    const href = urgentAccessHref({
      workspaceId: "employment",
      area: "Employee Records & Contracts",
      personId: "jamie",
      returnHref: "/employment-admin",
    });
    const html = renderRequest(href);
    expect(html).toContain("Urgent access request");
    expect(html).toContain("Urgent access escalation");
    expect(html).toContain("Jamie Ellis");
    expect(html).toContain("Clara Jensen");
    expect(html).toContain("Focal point");
    expect(html).toContain("Reason for urgent access");
    expect(html).toContain(
      "Service Desk will route the request for business authorisation and implement or escalate access where required.",
    );
    expect(html).toContain("Preview only.");
    expect(html).toContain("No ticket is sent.");
    expect(html).not.toMatch(
      /salary value|absence reason|candidate score|employee address/,
    );
  });

  it("does not populate protected records while adding contact and escalation actions", () => {
    const config = configById.get("employment")!;
    for (const subject of config.protected) {
      expect(config.files.some((file) => file.id === subject.id)).toBe(false);
      const html = renderToStaticMarkup(
        createElement(AccessBoundary, {
          workspaceId: "employment",
          area: subject.name,
          strict: true,
        }),
      );
      expect(html).toContain("Contact focal point");
      expect(html).toContain("Raise urgent access request");
      expect(html).not.toContain("Document preview");
      expect(html).not.toContain("Version history");
    }
  });

  it("uses the requester's existing department coordinator when they are the workspace's primary focal point", () => {
    for (const workspace of workspaceRegistry) {
      const primary = accessFocalPoint({ workspaceId: workspace.id });
      const alternate = accessFocalPoint({
        workspaceId: workspace.id,
        personId: primary.id,
      });
      if (!staff.some((person) => person.id === primary.id)) continue;
      expect(alternate.name).not.toBe(primary.name);
      expect(
        accessFocalPoint({
          workspaceId: workspace.id,
          personId: "unrelated-staff",
        }),
      ).toEqual(primary);
    }
    expect(
      accessFocalPoint({ workspaceId: "employment", personId: "jamie" }).name,
    ).toBe("Clara Jensen");
    expect(
      accessFocalPoint({ workspaceId: "digital", personId: "devon" }).name,
    ).toBe("Theo Walker");
    const href = urgentAccessHref({
      workspaceId: "digital",
      area: "Security Engineering",
      personId: "devon",
    });
    const html = renderRequest(href);
    expect(html).toContain("Theo Walker");
    expect(html).toContain("Devon Park");
    expect(html).not.toContain("Devon Park · Platform Engineer");
  });

  it("retains ordinary IT incident intake without treating it as a business access request", () => {
    const html = renderRequest("/service-desk/it-support?person=devon");
    expect(html).toContain("IT requests &amp; technical support");
    expect(html).toContain("Request or incident description");
    expect(html).not.toContain("Focal point");
    expect(html).not.toContain("Urgent access escalation");
  });
});
