import { describe, expect, it } from "vitest";
import { protectedSubjects as financeSubjects } from "../finance/data";
import { functionalConfigs } from "../workspaces/config";
import {
  workspaceSeed,
  workspaceAccessLevels,
} from "../workspaces/accessClassification";
import { technicalChannelDefinitions } from "../workspaces/technicalChannelDefinitions";
import { channelDefinitions } from "../content/channelDefinitions";
import { planningChannels } from "../planning/channels";
import { channels } from "../logistics/data";
import { departments } from "../coordination/data";
import { channelNavigationFor } from "../teams/navigation";
import {
  canAccessArea,
  canAccessChannel,
  canAccessWorkspace,
  canAdministerSites,
  hasAlternativePreviewAccess,
  previewRoles,
  resourceAccess,
} from "./policy";
import {
  ordinaryAreaDefinitions,
  protectedAreaDefinitions,
} from "./areaDefinitions";
import {
  accessMatrixIntegrityIssues,
  controlledResourceAccess,
  controlledResourceInventory,
  unitBusinessExpectation,
} from "./controlledResources";

const entry = (id: string) =>
  controlledResourceInventory.find((resource) => resource.id === id)!;

describe("canonical controlled-resource matrix integrity", () => {
  it("checks every preview identity against every controlled resource and its independent business expectation", () => {
    expect(previewRoles).toHaveLength(9);
    expect(controlledResourceInventory.length).toBeGreaterThan(130);
    expect(accessMatrixIntegrityIssues()).toEqual([]);
    for (const resource of controlledResourceInventory) {
      expect(
        previewRoles
          .filter((role) => controlledResourceAccess(role, resource))
          .map((role) => role.id)
          .sort(),
        resource.id,
      ).toEqual([...resource.expectedRoleIds].sort());
    }
  });

  it("enumerates all 23 Finance subjects and every canonical functional protected subject", () => {
    const inventoryAreas = controlledResourceInventory.flatMap((item) =>
      item.resource?.kind === "area"
        ? [`${item.resource.workspaceId}:${item.resource.areaId}`]
        : [],
    );
    expect(Object.values(financeSubjects).flat()).toHaveLength(23);
    for (const [id] of Object.values(financeSubjects).flat())
      expect(inventoryAreas).toContain(`finance:${id}`);
    for (const config of functionalConfigs)
      for (const subject of config.protected)
        expect(inventoryAreas).toContain(`${config.id}:${subject.id}`);
    expect(
      controlledResourceInventory
        .filter((item) => item.category === "workspace")
        .map((item) => item.id)
        .sort(),
    ).toEqual([
      "workspace:employment",
      "workspace:executive",
      "workspace:welfare",
    ]);
  });

  it("distinguishes Finance operations work from banking mandates, payroll and executive scenarios", () => {
    for (const id of [
      "payment-exceptions",
      "refund-chargeback",
      "high-value-payment",
      "payment-data-correction",
      "disputed-supplier-payment",
      "draft-scenarios",
      "workforce-cost",
      "investment-affordability",
      "external-audit",
      "pre-issue-statements",
      "liquidity-stress",
    ]) {
      expect(canAccessArea("sam", "finance", id), id).toBe(true);
    }
    for (const id of [
      "payroll-settlement",
      "employee-reimbursements",
      "exceptional-authorisation",
      "bank-mandates",
      "signatories",
      "banking-security",
      "transfer-authorisation",
      "restructuring-cost",
      "pre-decision",
    ]) {
      expect(canAccessArea("sam", "finance", id), id).toBe(false);
    }
    expect(canAccessArea("robin", "finance", "restructuring-cost")).toBe(true);
    expect(canAccessArea("robin", "finance", "pre-decision")).toBe(true);
    expect(canAccessArea("robin", "finance", "banking-security")).toBe(false);
  });

  it("meaningfully unlocks each specialist without conflating administration with business access", () => {
    expect(canAccessArea("jamie", "employment", "employee-records")).toBe(true);
    expect(canAccessArea("jamie", "employment", "candidate-assessments")).toBe(
      true,
    );
    expect(canAccessArea("jamie", "welfare", "safeguarding-complaints")).toBe(
      false,
    );
    expect(canAccessArea("jamie", "legal", "privileged")).toBe(false);
    expect(canAccessArea("devon", "digital", "production")).toBe(true);
    expect(canAccessArea("devon", "digital", "recovery")).toBe(true);
    expect(canAccessArea("devon", "digital", "credentials")).toBe(false);
    expect(canAccessArea("devon", "digital", "privileged-access")).toBe(false);
    expect(canAdministerSites("devon")).toBe(false);
    expect(canAccessArea("nadia", "content", "commercial-proposal")).toBe(true);
    expect(canAccessArea("nadia", "customer", "commercial-account")).toBe(true);
    expect(
      canAccessArea("nadia", "audience", "participant-administration"),
    ).toBe(false);
    expect(canAccessArea("nadia", "content", "embargoed-distribution")).toBe(
      false,
    );
    for (const role of ["leonie", "elliot"]) {
      expect(canAdministerSites(role)).toBe(true);
      expect(canAccessArea(role, "employment", "employee-records")).toBe(false);
      expect(canAccessArea(role, "finance", "workforce-cost")).toBe(false);
      expect(canAccessArea(role, "digital", "security")).toBe(false);
    }
    expect(canAccessArea("robin", "planning", "restricted")).toBe(true);
    expect(canAccessWorkspace("robin", "executive")).toBe(true);
    expect(canAccessArea("robin", "employment", "employee-records")).toBe(
      false,
    );
    expect(canAccessArea("robin", "digital", "credentials")).toBe(false);
    for (const role of ["taylor", "maya"]) {
      expect(
        controlledResourceInventory.some(
          (resource) =>
            resource.genuinelyRestricted &&
            resource.category !== "unit" &&
            controlledResourceAccess(role, resource),
        ),
        role,
      ).toBe(false);
    }
  });

  it("offers a role-switch alternative only when another selectable role can open that precise resource", () => {
    for (const resource of controlledResourceInventory) {
      if (!resource.resource || resource.contextualDepartmentId) continue;
      for (const role of previewRoles) {
        const access = resourceAccess(role, resource.resource);
        const alternatives = previewRoles.filter((candidate) =>
          resourceAccess(candidate, resource.resource!),
        );
        expect(
          hasAlternativePreviewAccess(resource.resource, role.id),
          `${resource.id} ${role.id}`,
        ).toBe(!access && alternatives.length > 0);
        if (resource.outOfScopeReason)
          expect(alternatives, resource.id).toEqual([]);
      }
    }
  });

  it("fails on orphaned resources, omitted canonical policy IDs and stale policy entries", () => {
    const workforce = entry("area:finance:workforce-cost");
    expect(
      accessMatrixIntegrityIssues({
        inventory: [
          { ...workforce, expectedRoleIds: [], outOfScopeReason: undefined },
        ],
        access: () => false,
      }),
    ).toContain("Orphaned controlled resource: area:finance:workforce-cost");
    expect(
      accessMatrixIntegrityIssues({
        policyAreas: {
          ...protectedAreaDefinitions,
          finance: protectedAreaDefinitions.finance.filter(
            (id) => id !== "workforce-cost",
          ),
        },
      }),
    ).toContain(
      "Canonical resource has no policy area: area:finance:workforce-cost",
    );
    expect(
      accessMatrixIntegrityIssues({
        policyAreas: {
          ...protectedAreaDefinitions,
          finance: [
            ...protectedAreaDefinitions.finance,
            "obsolete-bank-fixture",
          ],
        },
      }),
    ).toContain(
      "Policy area has no canonical resource: finance:obsolete-bank-fixture",
    );
  });

  it("fails when an intended specialist is denied or an explicit restriction becomes universal", () => {
    const workforce = entry("area:finance:workforce-cost");
    expect(
      accessMatrixIntegrityIssues({
        inventory: [workforce],
        access: () => false,
      }),
    ).toContain("Expected specialist denied: area:finance:workforce-cost sam");
    expect(
      accessMatrixIntegrityIssues({
        inventory: [workforce],
        access: () => true,
      }),
    ).toContain("Over-broad restricted resource: area:finance:workforce-cost");
    expect(
      accessMatrixIntegrityIssues({
        roles: previewRoles.map((role) =>
          role.id === "sam"
            ? {
                ...role,
                restrictedAreas: {
                  ...role.restrictedAreas,
                  finance: [
                    ...role.restrictedAreas.finance,
                    "nonexistent-subject",
                  ],
                },
              }
            : role,
        ),
      }),
    ).toContain("Unknown policy grant: sam finance:nonexistent-subject");
  });

  it("detects stale workspace, channel, department and unit assignments", () => {
    const roles = previewRoles.map((role) =>
      role.id === "devon"
        ? {
            ...role,
            workspaceMemberships: [
              ...role.workspaceMemberships,
              "retired-workspace",
            ],
            departmentId: "retired-department",
            teamChannels: {
              ...role.teamChannels,
              digital: [
                ...role.teamChannels.digital,
                "Retired private channel",
              ],
            },
          }
        : role.id === "sam"
          ? { ...role, unitId: "retired-unit" }
          : role,
    );
    expect(accessMatrixIntegrityIssues({ roles })).toEqual(
      expect.arrayContaining([
        "Unknown workspace membership: devon retired-workspace",
        "Unknown channel grant: devon digital:Retired private channel",
        "Unknown department assignment: devon retired-department",
        "Unknown unit assignment: sam retired-unit",
      ]),
    );
  });

  it("requires review for new private units instead of silently assigning an outside-scope exemption", () => {
    expect(
      unitBusinessExpectation("people-culture", "people-operations", true)
        ?.expectedRoleIds,
    ).toEqual(["jamie"]);
    expect(
      unitBusinessExpectation("people-culture", "reward-and-employment", true)
        ?.expectedRoleIds,
    ).toEqual([]);
    expect(
      unitBusinessExpectation("people-culture", "new-private-unit", true),
    ).toBeUndefined();
    expect(
      unitBusinessExpectation(
        "communications",
        "new-unrepresented-unit",
        false,
      ),
    ).toBeUndefined();
    expect(
      unitBusinessExpectation("new-department", "new-unit", false),
    ).toBeUndefined();
  });
});

describe("controlled access does not undo ordinary exploration or curated channels", () => {
  it("preserves ordinary internal Homes and all explicitly ordinary children for every role", () => {
    for (const [id] of workspaceSeed.filter(
      ([id]) => workspaceAccessLevels[id] === "internal",
    )) {
      for (const role of previewRoles)
        expect(canAccessWorkspace(role, id), `${id} ${role.id}`).toBe(true);
      for (const areaId of ordinaryAreaDefinitions[id] || [])
        for (const role of previewRoles)
          expect(
            canAccessArea(role, id, areaId),
            `${id} ${areaId} ${role.id}`,
          ).toBe(true);
    }
    for (const role of previewRoles)
      for (const id of [
        "relationships",
        "premium",
        "accounts",
        "partnerships",
        "stakeholders",
        "meetings",
      ]) {
        expect(canAccessArea(role, "customer", id), `${role.id} ${id}`).toBe(
          true,
        );
      }
  });

  it("keeps global General Staff Company-only and context focused for all channel-enabled workspaces", () => {
    const baseline = channelNavigationFor({
      person: previewRoles.find((role) => role.id === "taylor")!,
    });
    expect(baseline.groups.map((group) => group.id)).toEqual(["company"]);
    expect(baseline.showRoleDiscovery).toBe(true);
    for (const role of previewRoles)
      for (const workspaceId of [
        "planning",
        "logistics",
        "content",
        "digital",
      ]) {
        const navigation = channelNavigationFor({
          person: role,
          entryContext: { kind: "workspace", id: workspaceId },
        });
        expect(
          navigation.groups.map((group) => group.id),
          `${role.id} ${workspaceId}`,
        ).toEqual(["company", workspaceId]);
      }
  });

  it("retains unpinned ordinary channels and private security membership for all nine roles", () => {
    const ordinary = [
      ...channelDefinitions.map((channel) => ["content", channel.id]),
      ...planningChannels.map((name) => ["planning", name]),
      ...channels
        .filter((channel) => channel.team === "logistics")
        .map((channel) => ["logistics", channel.id]),
      ...technicalChannelDefinitions
        .filter((channel) => channel.privacy === "standard")
        .map((channel) => ["digital", channel.name]),
    ];
    for (const role of previewRoles) {
      for (const [workspaceId, channelId] of ordinary)
        expect(
          canAccessChannel(role, workspaceId, channelId),
          `${role.id} ${workspaceId} ${channelId}`,
        ).toBe(true);
      expect(canAccessChannel(role, "digital", "Security Engineering")).toBe(
        role.id === "devon",
      );
    }
    for (const department of departments)
      for (const role of previewRoles) {
        const navigation = channelNavigationFor({
          person: role,
          entryContext: { kind: "department", id: department.id },
        });
        expect(
          navigation.groups.map((group) => group.id),
          `${role.id} ${department.id}`,
        ).toEqual(["company", department.id]);
      }
  });
});
