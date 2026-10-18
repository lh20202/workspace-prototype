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
  canAdministerSites,
  canManageSiteSettings,
  isWorkspacePinnedForRole,
  isChannelPinnedForRole,
  isProjectPinnedForRole,
  canAccessUnit,
  departmentPreviewFor,
} from "./policy";
import { workspaceRegistry } from "../workspaces/registry";
import { allProjects } from "../projects/data";
import { channelDefinitions } from "../content/channelDefinitions";
import { technicalChannelDefinitions } from "../workspaces/technicalChannelDefinitions";
import { channels } from "../logistics/data";
import { departments } from "../coordination/data";
import {
  peopleDirectory,
  resolveStaffPerson,
  staff,
} from "../intranet/catalog";
import { functionalConfigs } from "../workspaces/config";
import { protectedTopics } from "../content/data";
import { protectedSubjects } from "../finance/data";

describe("the nine role access matrix", () => {
  it("gives the information adviser normal readership and a small relevant Team scope", () => {
    for (const workspace of [
      "digital",
      "planning",
      "archives",
      "people",
      "audience",
      "content",
    ])
      expect(canAccessWorkspace("leonie", workspace)).toBe(true);
    for (const workspace of [
      "executive",
      "employment",
      "welfare",
      "publishing",
      "governance",
    ])
      expect(canAccessWorkspace("leonie", workspace)).toBe(false);
    expect(canAccessDepartment("leonie", "strategy-technology")).toBe(true);
    expect(canAccessArea("leonie", "digital", "information-architecture")).toBe(
      true,
    );
    for (const [workspace, area] of [
      ["digital", "security"],
      ["finance", "high-value-payment"],
      ["people", "network-membership"],
      ["planning", "restricted"],
    ])
      expect(canAccessArea("leonie", workspace, area)).toBe(false);
    expect(
      previewRoles.find((role) => role.id === "leonie")?.projectMemberships,
    ).toEqual([]);
    expect(
      previewRoles.find((role) => role.id === "leonie")?.emergencyMemberships,
    ).toEqual([]);
  });

  it("keeps nine distinct preview identities while the two site-management roles share the same entitlement profile", () => {
    expect(staff.map((role) => role.id)).toEqual([
      "taylor",
      "maya",
      "robin",
      "jamie",
      "devon",
      "leonie",
      "nadia",
      "sam",
      "elliot",
    ]);
    expect(defaultPreviewRoleId).toBe("taylor");
    expect(
      new Set(
        previewRoles.map((role) =>
          JSON.stringify([
            role.workspaceMemberships,
            role.restrictedAreas,
            role.teamChannels,
            canAdministerSites(role),
          ]),
        ),
      ).size,
    ).toBe(8);
    expect(new Set(staff.map((role) => role.id)).size).toBe(9);
    expect(peopleDirectory.some((person) => person.id === "alex")).toBe(true);
    expect(staff.some((person) => person.id === "alex")).toBe(false);
    expect(staff.some((person) => person.id === "nadia")).toBe(true);
    expect(resolveStaffPerson("alex").id).toBe("taylor");
    expect(canAccessWorkspace("alex", "content")).toBe(false);
  });
  it("grants the same delegated site-management capability to the two specified roles without broadening business access", () => {
    for (const person of previewRoles) {
      const elevated = ["leonie", "elliot"].includes(person.id);
      expect(canAdministerSites(person)).toBe(elevated);
      for (const workspace of ["planning", "content", "digital", "logistics"])
        expect(canManageSiteSettings(person, workspace)).toBe(
          elevated && canAccessWorkspace(person, workspace),
        );
      for (const workspace of [
        "executive",
        "employment",
        "welfare",
        "governance",
      ])
        if (elevated)
          expect(canManageSiteSettings(person, workspace)).toBe(false);
      if (elevated) {
        expect(person.restrictedAreas).toEqual({});
        expect(person.projectMemberships).toEqual([]);
        expect(person.emergencyMemberships).toEqual([]);
      }
    }
    expect(canManageSiteSettings("devon", "digital")).toBe(false);
  });
  it("gives ordinary staff internal exploration, ordinary Wiki and their own daily department without privilege", () => {
    for (const workspace of [
      "planning",
      "services",
      "quality",
      "people",
      "archives",
      "digital",
    ])
      expect(canAccessWorkspace("taylor", workspace)).toBe(true);
    expect(canAccessDepartment("taylor", "marketing-growth")).toBe(true);
    expect(canAccessDepartment("taylor", "people-culture")).toBe(false);
    expect(canAccessWikiArea("taylor", "foundations")).toBe(true);
    for (const workspace of [
      "executive",
      "employment",
      "welfare",
      "publishing",
    ])
      expect(canAccessWorkspace("taylor", workspace)).toBe(false);
    expect(canAccessArea("taylor", "planning", "restricted")).toBe(false);
    expect(canAccessArea("taylor", "customer", "platinum")).toBe(false);
  });
  it("keeps frontline relevance while opening normal workspaces, Portal and knowledge to all roles", () => {
    expect(canAccessPortal("maya")).toBe(true);
    expect(canAccessWikiArea("maya", "messaging")).toBe(true);
    expect(canAccessWikiArea("maya", "insight")).toBe(true);
    expect(canAccessWorkspace("maya", "logistics")).toBe(true);
    expect(canAccessArea("maya", "customer", "care")).toBe(true);
    for (const workspace of ["audience", "content", "digital"])
      expect(canAccessWorkspace("maya", workspace)).toBe(true);
    expect(canAccessWorkspace("maya", "executive")).toBe(false);
    expect(canAccessWorkspace("maya", "employment")).toBe(false);
    expect(canAccessChannel("maya", "logistics", "central-city")).toBe(true);
    expect(canAccessChannel("maya", "logistics", "north-city")).toBe(true);
    expect(canAccessChannel("maya", "content", "coastal-flooding")).toBe(true);
    for (const role of previewRoles) expect(canAccessPortal(role)).toBe(true);
  });
  it("keeps shared Wiki knowledge open for every role", () => {
    const areas = [
      "foundations",
      "messaging",
      "insight",
      "standards",
      "learning",
      "tools",
      "contacts",
      "a-z",
    ];
    for (const role of previewRoles)
      for (const area of areas)
        expect(canAccessWikiArea(role, area)).toBe(true);
    expect(canAccessWikiArea("devon", "not-a-knowledge-area")).toBe(false);
  });
  it("separates ordinary channel access from the role's curated daily channel pins", () => {
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
        expect(canAccessChannel(role, "logistics", channel)).toBe(true);
      for (const channel of ["north-city", "travel", "coaches"])
        expect(canAccessChannel(role, "logistics", channel)).toBe(true);
      expect(canAccessChannel(role, "logistics", "unknown")).toBe(false);
      expect(canAccessChannel(role, "content", "editorial")).toBe(true);
      expect(canAccessChannel(role, "digital", "Engineering")).toBe(true);
      expect(isChannelPinnedForRole(role, "content", "editorial")).toBe(
        role.id === "nadia",
      );
      expect(isChannelPinnedForRole(role, "digital", "Engineering")).toBe(
        role.id === "devon",
      );
      expect(canAccessChannel(role, "publishing", "Wiki Moderation")).toBe(
        false,
      );
      expect(
        canAccessChannel(role, "digital", "Workspace & Wiki Moderators"),
      ).toBe(true);
      expect(canAccessChannel(role, "planning", "Planning coordination")).toBe(
        true,
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
    expect(canAccessWorkspace("devon", "publishing")).toBe(false);
    expect(canAccessArea("devon", "digital", "security")).toBe(true);
    expect(canAccessChannel("devon", "digital", "Security Engineering")).toBe(
      true,
    );
    expect(
      canAccessChannel("devon", "digital", "Workspace & Wiki Moderators"),
    ).toBe(true);
    for (const workspace of ["executive", "employment", "welfare"])
      expect(canAccessWorkspace("devon", workspace)).toBe(false);
    expect(canAccessWorkspace("devon", "audience")).toBe(true);
    expect(canAccessWorkspace("devon", "content")).toBe(true);
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
    expect(canAccessProjectTeam("taylor", "PRJ-2026-021")).toBe(true);
    expect(isProjectPinnedForRole("taylor", "PRJ-2026-021")).toBe(false);
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

describe("ordinary discoverability is separate from membership and pinning", () => {
  it("opens every canonical ordinary workspace for every preview role, without adding memberships", () => {
    const originalMemberships = previewRoles.map((role) => [
      ...role.workspaceMemberships,
    ]);
    for (const role of previewRoles)
      for (const workspace of workspaceRegistry) {
        expect(canAccessWorkspace(role, workspace.id)).toBe(
          workspace.accessLevel === "internal" ||
            role.workspaceMemberships.includes(workspace.id),
        );
        expect(isWorkspacePinnedForRole(role, workspace.id)).toBe(
          role.workspaceMemberships.includes(workspace.id),
        );
      }
    expect(previewRoles.map((role) => role.workspaceMemberships)).toEqual(
      originalMemberships,
    );
    expect(isWorkspacePinnedForRole("taylor", "digital")).toBe(false);
    expect(canAccessWorkspace("taylor", "digital")).toBe(true);
    expect(canAccessWorkspace("taylor", "unknown-site")).toBe(false);
    expect(canAccessWorkspace("not-a-role", "digital")).toBe(false);
  });

  it("opens canonical ordinary channels without pinning them and protects private technical channels", () => {
    for (const role of previewRoles) {
      for (const channel of channelDefinitions)
        expect(canAccessChannel(role, "content", channel.id)).toBe(true);
      for (const channel of channels)
        expect(canAccessChannel(role, channel.team, channel.id)).toBe(true);
      for (const channel of technicalChannelDefinitions)
        expect(canAccessChannel(role, "digital", channel.name)).toBe(
          channel.privacy !== "private" || role.id === "devon",
        );
      for (const workspace of ["content", "digital", "logistics", "planning"])
        expect(canAccessChannel(role, workspace, "unknown-channel")).toBe(
          false,
        );
    }
    expect(isChannelPinnedForRole("taylor", "content", "editorial")).toBe(
      false,
    );
    expect(isChannelPinnedForRole("nadia", "content", "editorial")).toBe(true);
    expect(canAccessChannel("nadia", "content", "cities-mobility")).toBe(true);
    expect(isChannelPinnedForRole("nadia", "content", "cities-mobility")).toBe(
      false,
    );
    expect(canAccessChannel("not-a-role", "content", "editorial")).toBe(false);
  });

  it("opens every ordinary project without creating daily project pins, while preserving restricted entitlements", () => {
    for (const role of previewRoles)
      for (const project of allProjects) {
        expect(canAccessProject(role, project.code)).toBe(
          project.access === "Open Internal" ||
            role.projectMemberships.includes(project.code),
        );
        expect(canAccessProjectTeam(role, project.code)).toBe(
          project.access === "Open Internal" ||
            role.projectTeamMemberships.includes(project.code),
        );
        expect(isProjectPinnedForRole(role, project.code)).toBe(
          role.projectTeamMemberships.includes(project.code),
        );
      }
    expect(canAccessProject("taylor", "PRJ-unknown")).toBe(false);
    expect(canAccessProjectTeam("not-a-role", "PRJ-2026-014")).toBe(false);
  });

  it("scopes department previews for every role without conferring foreign unit membership", () => {
    for (const role of previewRoles)
      for (const department of departments) {
        const contextual = { id: role.id, departmentPreviewId: department.id };
        expect(departmentPreviewFor(contextual)).toBe(department.id);
        expect(canAccessDepartment(contextual, department.id)).toBe(true);
        for (const other of departments.filter(
          (item) => item.id !== department.id,
        ))
          expect(canAccessDepartment(contextual, other.id)).toBe(false);
        for (const unit of department.units)
          expect(
            canAccessUnit(
              contextual,
              department.id,
              unit.id,
              unit.access === "Unit-only",
            ),
          ).toBe(
            role.departmentId === department.id &&
              (unit.access !== "Unit-only" || role.unitId === unit.id),
          );
      }
    expect(
      departmentPreviewFor({ id: "taylor", departmentPreviewId: "unknown" }),
    ).toBeUndefined();
    expect(
      departmentPreviewFor({
        id: "not-a-role",
        departmentPreviewId: "communications",
      }),
    ).toBeUndefined();
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
  it("does not offer a false role signpost for ordinary research exploration", () => {
    const research = { kind: "workspace" as const, workspaceId: "audience" };
    expect(hasAlternativePreviewAccess(research, "maya")).toBe(false);
    expect(allowedPreviewRoles(research).map((role) => role.id)).toEqual([
      ...previewRoles.map((role) => role.id),
    ]);
    expect(canAccessWorkspace("maya", "audience")).toBe(true);
    expect(canAccessPortal("maya")).toBe(true);
  });
  it("offers no false role signpost for independent representation or unrepresented departments", () => {
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
          { kind: "department", departmentId: "communications" },
          role.id,
        ),
      ).toBe(false);
    }
  });
});
