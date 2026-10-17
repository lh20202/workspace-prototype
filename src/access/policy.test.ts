import { describe, expect, it } from "vitest";
import {
  previewRoles,
  defaultPreviewRoleId,
  canAccessWorkspace,
  canAccessArea,
  canAccessWikiArea,
  canAccessPortal,
  canAccessProject,
  canAccessProjectTeam,
  canAccessDepartment,
  canAccessChannel,
  canAccessEmergency,
  allowedPreviewRoles,
  hasAlternativePreviewAccess,
} from "./policy";
import {
  peopleDirectory,
  resolveStaffPerson,
  staff,
} from "../intranet/catalog";
import { functionalConfigs } from "../workspaces/config";
import { protectedTopics } from "../content/data";
import { protectedSubjects } from "../finance/data";

describe("the five role access matrix", () => {
  it("has exactly five distinct access archetypes and retains authors without hidden preview identities", () => {
    expect(staff.map((role) => role.id)).toEqual([
      "taylor",
      "maya",
      "robin",
      "jamie",
      "devon",
    ]);
    expect(defaultPreviewRoleId).toBe("taylor");
    expect(
      new Set(
        previewRoles.map((role) =>
          JSON.stringify([role.workspaceMemberships, role.restrictedAreas]),
        ),
      ).size,
    ).toBe(5);
    expect(peopleDirectory.some((person) => person.id === "alex")).toBe(true);
    expect(staff.some((person) => person.id === "alex")).toBe(false);
    expect(resolveStaffPerson("alex").id).toBe("taylor");
    expect(canAccessWorkspace("alex", "content")).toBe(false);
  });
  it("gives ordinary staff internal collaboration, ordinary Wiki and their own department without privilege", () => {
    for (const workspace of [
      "planning",
      "services",
      "quality",
      "people",
      "archives",
    ])
      expect(canAccessWorkspace("taylor", workspace)).toBe(true);
    expect(canAccessDepartment("taylor", "marketing-growth")).toBe(true);
    expect(canAccessDepartment("taylor", "people-culture")).toBe(false);
    expect(canAccessWikiArea("taylor", "foundations")).toBe(true);
    for (const workspace of [
      "executive",
      "employment",
      "welfare",
      "digital",
      "publishing",
    ])
      expect(canAccessWorkspace("taylor", workspace)).toBe(false);
    expect(canAccessArea("taylor", "planning", "restricted")).toBe(false);
    expect(canAccessArea("taylor", "customer", "platinum")).toBe(false);
  });
  it("gives the frontline role its Portal, approved knowledge and selected operational collaboration", () => {
    expect(canAccessPortal("maya")).toBe(true);
    expect(canAccessWikiArea("maya", "messaging")).toBe(true);
    expect(canAccessWikiArea("maya", "insight")).toBe(false);
    expect(canAccessWorkspace("maya", "logistics")).toBe(true);
    expect(canAccessArea("maya", "customer", "care")).toBe(true);
    for (const workspace of [
      "audience",
      "content",
      "digital",
      "executive",
      "employment",
    ])
      expect(canAccessWorkspace("maya", workspace)).toBe(false);
    expect(canAccessChannel("maya", "logistics", "central-city")).toBe(true);
    expect(canAccessChannel("maya", "logistics", "north-city")).toBe(false);
    expect(canAccessChannel("maya", "content", "coastal-flooding")).toBe(false);
    for (const role of previewRoles.filter((role) => role.id !== "maya"))
      expect(canAccessPortal(role)).toBe(false);
  });
  it("keeps functional Teams participation separate from ordinary SharePoint readership", () => {
    const companyChannels = [
      "important",
      "bulletin",
      "office",
      "pets",
      "learning",
      "socials",
    ];
    const mayaLogistics = ["general", "street", "central-city", "telephone"];
    for (const role of previewRoles) {
      expect(canAccessWorkspace(role, "logistics")).toBe(true);
      for (const channel of companyChannels)
        expect(canAccessChannel(role, "company", channel)).toBe(true);
      for (const channel of mayaLogistics)
        expect(canAccessChannel(role, "logistics", channel)).toBe(
          role.id === "maya",
        );
      for (const channel of ["north-city", "travel", "coaches", "unknown"])
        expect(canAccessChannel(role, "logistics", channel)).toBe(false);
      expect(canAccessChannel(role, "content", "editorial")).toBe(false);
      expect(canAccessChannel(role, "digital", "Engineering")).toBe(
        role.id === "devon",
      );
      expect(canAccessChannel(role, "publishing", "Wiki Moderation")).toBe(
        role.id === "devon",
      );
      expect(canAccessChannel(role, "planning", "Planning coordination")).toBe(
        role.id === "robin",
      );
      expect(canAccessChannel(role, "employment", "General")).toBe(false);
    }
    expect(canAccessWorkspace("taylor", "content")).toBe(true);
    expect(canAccessWorkspace("robin", "content")).toBe(true);
  });
  it("gives executive, personnel and technology roles their own controlled work, never universal access", () => {
    expect(canAccessWorkspace("robin", "executive")).toBe(true);
    expect(canAccessArea("robin", "executive", "leadership")).toBe(true);
    expect(canAccessArea("robin", "executive", "SI-01")).toBe(true);
    expect(canAccessArea("robin", "executive", "SI-05")).toBe(false);
    expect(canAccessArea("robin", "planning", "restricted")).toBe(true);
    expect(canAccessArea("robin", "governance", "liaison")).toBe(true);
    expect(canAccessArea("robin", "governance", "committee")).toBe(false);
    expect(canAccessWorkspace("robin", "employment")).toBe(false);
    expect(canAccessArea("robin", "digital", "security")).toBe(false);
    expect(canAccessWorkspace("jamie", "employment")).toBe(true);
    expect(canAccessArea("jamie", "employment", "employee-records")).toBe(true);
    expect(canAccessArea("jamie", "employment", "candidate-assessments")).toBe(
      true,
    );
    expect(canAccessArea("jamie", "employment", "placement")).toBe(false);
    expect(canAccessArea("jamie", "welfare", "welfare-support")).toBe(true);
    expect(canAccessWorkspace("jamie", "executive")).toBe(false);
    expect(canAccessWorkspace("devon", "digital")).toBe(true);
    expect(canAccessWorkspace("devon", "publishing")).toBe(true);
    expect(canAccessArea("devon", "digital", "security")).toBe(true);
    expect(canAccessChannel("devon", "digital", "Security Engineering")).toBe(
      true,
    );
    expect(canAccessChannel("devon", "publishing", "Wiki Moderation")).toBe(
      true,
    );
    for (const workspace of [
      "executive",
      "employment",
      "welfare",
      "audience",
      "content",
    ])
      expect(canAccessWorkspace("devon", workspace)).toBe(false);
    expect(canAccessArea("devon", "legal", "privileged")).toBe(false);
  });
  it("uses the central policy for portfolio control and review permissions", () => {
    for (const role of previewRoles) {
      expect(canAccessArea(role, "projects", "control")).toBe(
        role.id === "robin",
      );
      expect(canAccessArea(role, "projects", "reviews")).toBe(
        role.id === "robin",
      );
      expect(canAccessArea(role, "projects", "support")).toBe(true);
    }
    expect(
      allowedPreviewRoles({
        kind: "area",
        workspaceId: "projects",
        areaId: "control",
      }).map((role) => role.id),
    ).toEqual(["robin"]);
  });
  it("keeps project files, project conversation and incidents explicitly scoped", () => {
    for (const role of previewRoles)
      for (const projectId of role.projectTeamMemberships)
        expect(canAccessProject(role, projectId)).toBe(true);
    expect(canAccessProject("taylor", "PRJ-2026-021")).toBe(true);
    expect(canAccessProjectTeam("taylor", "PRJ-2026-021")).toBe(false);
    expect(canAccessProject("maya", "PRJ-2026-014")).toBe(true);
    expect(canAccessProjectTeam("maya", "PRJ-2026-014")).toBe(true);
    expect(canAccessProject("maya", "PRJ-2026-027")).toBe(false);
    expect(canAccessProject("robin", "PRJ-2026-027")).toBe(true);
    expect(canAccessProject("robin", "PRJ-2026-045")).toBe(false);
    expect(canAccessProjectTeam("jamie", "PRJ-2026-034")).toBe(true);
    expect(canAccessProjectTeam("devon", "PRJ-2026-042")).toBe(true);
    expect(canAccessEmergency("devon", "INC-104")).toBe(true);
    expect(canAccessEmergency("devon", "INC-107")).toBe(false);
    expect(canAccessEmergency("jamie", "INC-107")).toBe(true);
  });
});

describe("truthful access demonstration signposts", () => {
  it("covers every actual protected subject and fails unknown area IDs closed", () => {
    const resources = [
      ...functionalConfigs.flatMap((config) =>
        config.protected.map((subject) => ({
          workspaceId: config.id,
          areaId: subject.id,
        })),
      ),
      ...protectedTopics.map((subject) => ({
        workspaceId: "content",
        areaId: subject.id,
      })),
      ...Object.values(protectedSubjects)
        .flat()
        .map(([areaId]) => ({ workspaceId: "finance", areaId })),
      { workspaceId: "audience", areaId: "participant-administration" },
      { workspaceId: "finance", areaId: "restricted-planning" },
    ];
    for (const resource of resources)
      for (const role of previewRoles)
        expect(canAccessArea(role, resource.workspaceId, resource.areaId)).toBe(
          !!role.restrictedAreas[resource.workspaceId]?.includes(
            resource.areaId,
          ),
        );
    for (const workspaceId of [
      "digital",
      "employment",
      "welfare",
      "audience",
      "content",
      "finance",
    ])
      for (const role of previewRoles) {
        expect(
          canAccessArea(role, workspaceId, "nonexistent-private-area"),
        ).toBe(false);
        expect(
          hasAlternativePreviewAccess(
            { kind: "area", workspaceId, areaId: "nonexistent-private-area" },
            role.id,
          ),
        ).toBe(false);
      }
  });
  it("supports denied-to-authorised executive and technical role changes", () => {
    const executive = { kind: "workspace" as const, workspaceId: "executive" };
    const security = {
      kind: "area" as const,
      workspaceId: "digital",
      areaId: "security",
    };
    expect(hasAlternativePreviewAccess(executive, "taylor")).toBe(true);
    expect(allowedPreviewRoles(executive).map((role) => role.id)).toEqual([
      "robin",
    ]);
    expect(hasAlternativePreviewAccess(executive, "robin")).toBe(false);
    expect(hasAlternativePreviewAccess(security, "taylor")).toBe(true);
    expect(allowedPreviewRoles(security).map((role) => role.id)).toEqual([
      "devon",
    ]);
    expect(hasAlternativePreviewAccess(security, "devon")).toBe(false);
  });
  it("does not imply the frontline role is a specialist access workaround", () => {
    const research = { kind: "workspace" as const, workspaceId: "audience" };
    expect(hasAlternativePreviewAccess(research, "maya")).toBe(true);
    expect(allowedPreviewRoles(research).map((role) => role.id)).toEqual([
      "taylor",
    ]);
    expect(canAccessWorkspace("maya", "audience")).toBe(false);
    expect(canAccessPortal("maya")).toBe(true);
  });
  it("offers no false role signpost for independent representation or ordinary team membership", () => {
    const representation = {
      kind: "area" as const,
      workspaceId: "welfare",
      areaId: "employee-representation",
    };
    expect(allowedPreviewRoles(representation)).toEqual([]);
    for (const role of previewRoles) {
      expect(canAccessArea(role, "welfare", "employee-representation")).toBe(
        false,
      );
      expect(hasAlternativePreviewAccess(representation, role.id)).toBe(false);
      expect(
        hasAlternativePreviewAccess(
          { kind: "department", departmentId: "people-culture" },
          role.id,
        ),
      ).toBe(false);
    }
  });
});
