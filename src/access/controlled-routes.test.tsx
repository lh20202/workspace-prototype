import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement, type ComponentType } from "react";
import { controlledResourceInventory } from "./controlledResources";
import { previewRoles, type AccessResource } from "./policy";
import { PreviewRoleProvider } from "../components/PreviewRoleContext";
import FinanceApp from "../finance/FinanceApp";
import FunctionalApp from "../workspaces/FunctionalApp";
import ContentApp from "../content/ContentApp";
import AudienceApp from "../audience/AudienceApp";
import ExecutiveApp from "../executive/ExecutiveApp";
import EmergencyApp from "../executive/EmergencyApp";
import ProjectsApp from "../projects/ProjectsApp";
import TeamsPreview from "../intranet/TeamsPreview";
import PlanningApp from "../App";
import { initiatives } from "../executive/data";
import { departments } from "../coordination/data";
import { initialIncidents } from "../executive/incidentData";
import { getSiteAdminModel } from "../administration/model";
import {
  protectedReviewItemIds,
  protectedReviewSummaries,
} from "../finance/protectedReviews";
import { items as financeItems, protectedSubjects } from "../finance/data";

afterEach(() => vi.unstubAllGlobals());
const boundary = /<section class="access-boundary(?: |")/;
const revealAction = "Reveal restricted content";

function routeApp(resource: AccessResource): ComponentType {
  if (["department", "unit", "channel"].includes(resource.kind))
    return TeamsPreview;
  if (resource.kind === "emergency") return EmergencyApp;
  if (
    resource.kind === "project" ||
    resource.kind === "project-team" ||
    resource.kind === "project-security"
  )
    return ProjectsApp;
  if (resource.kind !== "workspace" && resource.kind !== "area")
    throw new Error(`Unsupported route ${resource.kind}`);
  return (
    (
      {
        finance: FinanceApp,
        content: ContentApp,
        audience: AudienceApp,
        planning: PlanningApp,
        executive: ExecutiveApp,
        projects: ProjectsApp,
      } as Record<string, ComponentType>
    )[resource.workspaceId] || FunctionalApp
  );
}

function renderRoute(href: string, personId: string, App: ComponentType) {
  const url = new URL(href, "https://example.test");
  url.searchParams.set("staff", personId);
  vi.stubGlobal("location", url);
  vi.stubGlobal("sessionStorage", {
    getItem: () => personId,
    setItem: () => {},
  });
  return renderToStaticMarkup(
    createElement(PreviewRoleProvider, null, createElement(App)),
  );
}

describe("canonical controlled destinations use the same boundary and role policy", () => {
  for (const entry of controlledResourceInventory.filter(
    (entry) => entry.resource && !entry.contentId,
  )) {
    it(`${entry.id} resolves for every role with a page-local reveal at restricted destinations`, () => {
      const resource = entry.resource!;
      const href = entry.href;
      for (const role of previewRoles) {
        const html = renderRoute(href, role.id, routeApp(resource));
        const expectedAllowed = entry.expectedRoleIds.includes(role.id);
        expect(boundary.test(html), `${entry.id} / ${role.id}`).toBe(
          !expectedAllowed,
        );
        expect(
          html.includes(revealAction),
          `${entry.id} reveal / ${role.id}`,
        ).toBe(!expectedAllowed);
        if (expectedAllowed)
          expect(html, `${entry.id} / ${role.id}`).not.toMatch(
            /Page not found|This location is unavailable|Opening channels/,
          );
        else {
          expect(html).not.toContain(
            "Controlled working methods for authorised participants.",
          );
          if (
            resource.kind === "area" &&
            resource.workspaceId === "finance" &&
            protectedReviewSummaries[resource.areaId]
          )
            expect(html).not.toContain(
              protectedReviewSummaries[resource.areaId],
            );
          if (resource.kind === "area" && resource.workspaceId === "content")
            expect(html).not.toContain(
              "Supplier payment approval remains with Finance.",
            );
          if (
            ["project", "project-team", "project-security"].includes(
              resource.kind,
            )
          )
            expect(html).not.toContain("Project Brief.docx");
          if (resource.kind === "emergency") {
            const incident = initialIncidents.find(
              (incident) => incident.id === resource.incidentId,
            )!;
            for (const file of incident.files)
              expect(html).not.toContain(file.name);
            for (const post of incident.posts)
              expect(html).not.toContain(post.text);
          }
        }
        if (resource.kind === "unit") {
          const unit = departments
            .find((department) => department.id === resource.departmentId)!
            .units.find((unit) => unit.id === resource.unitId)!;
          if (expectedAllowed)
            expect(html).toContain("Absence &amp; Cover Calendar");
          else
            for (const file of unit.files)
              expect(html).not.toContain(file.name);
        }
      }
    });
  }

  it("filters every strategic initiative row rather than advertising an invented child route", () => {
    for (const role of previewRoles) {
      const html = renderRoute("/executive/initiatives", role.id, ExecutiveApp);
      for (const initiative of initiatives) {
        const entry = controlledResourceInventory.find(
          (entry) => entry.contentId === initiative.id,
        )!;
        const expectedAllowed = entry.expectedRoleIds.includes(role.id);
        expect(
          html.includes(`aria-label="Initiative stage ${initiative.id}"`),
          `${role.id} / ${initiative.id}`,
        ).toBe(expectedAllowed);
      }
    }
  });

  it("offers only the precise project security role and preserves canonical documents and archived read-only access", () => {
    const securityEntries = controlledResourceInventory.filter(
      (entry) => entry.category === "project-security",
    );
    expect(securityEntries).toHaveLength(18);
    for (const entry of securityEntries)
      for (const role of previewRoles) {
        const html = renderRoute(entry.href, role.id, ProjectsApp);
        const expectedAllowed = entry.expectedRoleIds.includes(role.id);
        expect(boundary.test(html), `${entry.id} / ${role.id}`).toBe(
          !expectedAllowed,
        );
        expect(html).toContain("Production Security Review");
        expect(html.includes(revealAction)).toBe(!expectedAllowed);
        expect(html).not.toContain("Project Brief.docx");
        expect(html.includes("Design Options.pptx")).toBe(expectedAllowed);
        expect(html.includes("Transition Checklist.docx")).toBe(
          expectedAllowed,
        );
        if (expectedAllowed && entry.href.includes("/archive/")) {
          expect(html).toContain("Read-only");
          expect(html).not.toContain("New document");
          expect(html).not.toContain("Upload");
        }
        const url = new URL(entry.href, "https://example.test");
        const model = getSiteAdminModel(role.id, url.pathname, url.search);
        expect(model?.canAccess || false).toBe(expectedAllowed);
        expect(model?.canManage || false).toBe(false);
      }
  });

  it("gives every demonstrated Finance review a subject-specific scope and canonical supporting work", () => {
    for (const entry of controlledResourceInventory.filter(
      (entry) =>
        entry.resource?.kind === "area" &&
        entry.resource.workspaceId === "finance" &&
        entry.expectedRoleIds.length,
    )) {
      const resource = entry.resource as Extract<
        AccessResource,
        { kind: "area" }
      >;
      expect(protectedReviewSummaries[resource.areaId]).toBeTruthy();
      expect(protectedReviewItemIds[resource.areaId]?.length).toBeGreaterThan(
        0,
      );
      for (const id of protectedReviewItemIds[resource.areaId])
        expect(financeItems.some((item) => item.id === id)).toBe(true);
      const html = renderRoute(
        entry.href,
        entry.expectedRoleIds[0],
        FinanceApp,
      );
      expect(html).toContain("Supporting working documents");
      expect(html).toContain(protectedReviewSummaries[resource.areaId]);
      expect(html).not.toContain("Try another preview role");
    }
    expect(
      Object.values(protectedSubjects)
        .flat()
        .map(([id]) => id),
    ).toEqual(expect.arrayContaining(Object.keys(protectedReviewSummaries)));
  });

  it("keeps invalid protected IDs and path suffixes closed without a misleading role cue or admin contents", () => {
    const paths: [string, ComponentType][] = [
      ["/digital-tech/protected/unknown-subject", FunctionalApp],
      ["/digital-tech/protected/security/unknown", FunctionalApp],
      ["/employment-admin/protected/employee-records/unknown", FunctionalApp],
      ["/financial-operations/planning/unknown-subject", FinanceApp],
      ["/financial-operations/planning/workforce-cost/unknown", FinanceApp],
      [
        "/content-delivery/packages/PKG-103/protected/commercial-proposal/unknown",
        ContentApp,
      ],
      [
        "/content-delivery/packages/PKG-103/protected/unknown-subject",
        ContentApp,
      ],
      [
        "/audience-innovation/research/website-usability/participant-administration/unknown",
        AudienceApp,
      ],
      ["/executive/leadership/unknown", ExecutiveApp],
      ["/planning/restricted/unknown", PlanningApp],
      ["/projects/PRJ-2026-027/unknown", ProjectsApp],
      ["/projects/PRJ-2026-027/teams?channel=unknown", ProjectsApp],
      ["/projects/PRJ-unknown", ProjectsApp],
      ["/emergency-response/incidents/INC-104/unknown", EmergencyApp],
      [
        "/teams?department=marketing-growth&unit=unknown&context=department:marketing-growth&tab=Shared&folder=Unit+Coordination",
        TeamsPreview,
      ],
    ];
    for (const [path, App] of paths) {
      for (const role of previewRoles) {
        const html = renderRoute(path, role.id, App);
        expect(html, `${role.id} ${path}`).not.toContain(
          "Try another preview role",
        );
        expect(html, `${role.id} ${path}`).not.toContain(
          "Controlled working methods for authorised participants.",
        );
        expect(html, `${role.id} ${path}`).not.toContain(
          "Supporting working documents",
        );
        const url = new URL(path, "https://example.test");
        const admin = getSiteAdminModel(role.id, url.pathname, url.search);
        expect(admin?.canAccess || false, `admin ${role.id} ${path}`).toBe(
          false,
        );
        expect(
          admin?.contents || [],
          `admin contents ${role.id} ${path}`,
        ).toEqual([]);
      }
    }
  });
});
