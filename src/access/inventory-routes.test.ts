import { afterEach, describe, expect, it, vi } from "vitest";
import { controlledResourceInventory } from "./controlledResources";
import { prototypeForPath } from "../utils/routes";
import { externalPreviewForPath } from "../environments/previewRoutes";
import { siteAdministrationPage } from "../administration/routes";
import { getSiteAdminModel } from "../administration/model";
import { siteSettingsOptions } from "../components/SiteSettingsButton";
import { workspaceSeed } from "../workspaces/accessClassification";
import { allProjects, projectHref } from "../projects/data";
import { initialIncidents } from "../executive/incidentData";
import { previewRoles } from "./policy";
import { readChannelEntryContext } from "../teams/context";

afterEach(() => vi.unstubAllGlobals());

describe("inventory destinations resolve through the real application routes", () => {
  it("sends every inventory entry to its actual owning application or administration/external surface", () => {
    for (const entry of controlledResourceInventory) {
      const url = new URL(entry.href, "https://example.test");
      const family = prototypeForPath(url.pathname);
      if (entry.category === "external-governance") {
        expect(externalPreviewForPath(url.pathname)?.id, entry.id).toBe(
          "members",
        );
        continue;
      }
      expect(externalPreviewForPath(url.pathname), entry.id).toBeUndefined();
      if (entry.administrationWorkspaceId) {
        expect(siteAdministrationPage(url.search), entry.id).toBe(
          "permissions",
        );
        const model = getSiteAdminModel("leonie", url.pathname, url.search);
        expect(model?.id, entry.id).toBe(
          entry.administrationSiteId || entry.administrationWorkspaceId,
        );
        expect(model?.canManage, entry.id).toBe(true);
        continue;
      }
      expect(siteAdministrationPage(url.search), entry.id).toBeUndefined();
      const resource = entry.resource;
      if (
        entry.category === "project-security" ||
        resource?.kind === "project" ||
        resource?.kind === "project-team"
      ) {
        expect(family, entry.id).toBe("projects");
        const projectId =
          entry.securityProjectId ||
          (resource?.kind === "project" || resource?.kind === "project-team"
            ? resource.projectId
            : undefined);
        const project = allProjects.find(
          (project) => project.code === projectId,
        )!;
        expect(project, entry.id).toBeTruthy();
        const root = projectHref(project);
        expect(url.pathname, entry.id).toBe(
          entry.category === "project-security"
            ? `${root}/security`
            : resource?.kind === "project-team"
              ? `${root}/teams`
              : root,
        );
        if (resource?.kind === "project-team")
          expect(
            readChannelEntryContext(url.pathname, url.search),
            entry.id,
          ).toEqual({ kind: "project", id: project.code });
        continue;
      }
      if (resource?.kind === "emergency") {
        expect(family, entry.id).toBe("emergency");
        const incident = initialIncidents.find(
          (incident) => incident.id === resource.incidentId,
        );
        expect(incident, entry.id).toBeTruthy();
        expect(url.pathname.split("/").filter(Boolean), entry.id).toEqual([
          "emergency-response",
          "incidents",
          incident!.id,
        ]);
        expect(
          readChannelEntryContext(url.pathname, url.search),
          entry.id,
        ).toEqual({ kind: "incident", id: incident!.id });
        continue;
      }
      if (resource?.kind === "department" || resource?.kind === "unit") {
        expect(family, entry.id).toBe("teams");
        expect(
          readChannelEntryContext(url.pathname, url.search),
          entry.id,
        ).toEqual({ kind: "department", id: resource.departmentId });
        if (resource.kind === "unit") {
          expect(url.searchParams.get("unit"), entry.id).toBe(resource.unitId);
          expect(url.searchParams.get("tab"), entry.id).toBe("Shared");
          expect(url.searchParams.get("folder"), entry.id).toBe(
            "Unit Coordination",
          );
        }
        continue;
      }
      if (resource?.kind === "channel") {
        expect(family, entry.id).toBe("teams");
        expect(
          readChannelEntryContext(url.pathname, url.search),
          entry.id,
        ).toEqual({ kind: "workspace", id: resource.workspaceId });
        expect(url.searchParams.get("channel"), entry.id).toBe(
          resource.channelId,
        );
        continue;
      }
      if (resource?.kind === "workspace" || resource?.kind === "area") {
        const workspace = workspaceSeed.find(
          ([id]) => id === resource.workspaceId,
        )!;
        expect(workspace, entry.id).toBeTruthy();
        expect(family, entry.id).toBe(prototypeForPath(workspace[2]));
        expect(
          url.pathname === workspace[2] ||
            url.pathname.startsWith(workspace[2] + "/"),
          entry.id,
        ).toBe(true);
        continue;
      }
      throw new Error(
        `Inventory destination lacks route coverage: ${entry.id}`,
      );
    }
  });
});

describe("delegated library and list administration follows every canonical content context", () => {
  it("checks every ordinary site's actual library/list settings context against all nine roles", () => {
    const contexts = new Map<
      string,
      { href: string; id: string; kind: string; siteId: string }
    >();
    for (const entry of controlledResourceInventory.filter(
      (entry) => entry.administrationWorkspaceId,
    )) {
      const id = entry.administrationSiteId || entry.administrationWorkspaceId!;
      const href = new URL(entry.href, "https://example.test").pathname;
      for (const administrator of ["leonie", "elliot"]) {
        const home = getSiteAdminModel(administrator, href, "")!;
        expect(home.canManage, `${id} ${administrator}`).toBe(true);
        for (const content of home.contents.filter(
          (content) => content.kind !== "page",
        ))
          contexts.set(`${id}:${content.id}`, {
            href: content.href,
            id: content.id,
            kind: content.kind,
            siteId: id,
          });
      }
    }
    expect(contexts.size).toBe(42);
    for (const context of contexts.values()) {
      const url = new URL(context.href, "https://example.test");
      for (const role of previewRoles) {
        const model = getSiteAdminModel(role, url.pathname, url.search)!;
        const expected = ["leonie", "elliot"].includes(role.id);
        expect(model?.id, `${context.href} ${role.id}`).toBe(context.siteId);
        expect(model.canAccess, `${context.href} ${role.id}`).toBe(true);
        expect(model.current?.id, `${context.href} ${role.id}`).toBe(
          context.id,
        );
        expect(model.current?.kind, `${context.href} ${role.id}`).toBe(
          context.kind,
        );
        expect(model.canManage, `${context.href} ${role.id}`).toBe(expected);
        const setting = siteSettingsOptions(model).find(
          (option) => option.id === context.kind,
        );
        expect(!!setting, `${context.href} ${role.id} settings`).toBe(expected);
        if (setting) expect(setting.detail).toBe(model.current?.name);
      }
    }
  });

  it("never offers delegated management through a protected business destination or an unknown suffix", () => {
    for (const entry of controlledResourceInventory.filter(
      (entry) => entry.genuinelyRestricted && !entry.administrationWorkspaceId,
    )) {
      const url = new URL(entry.href, "https://example.test");
      for (const role of previewRoles)
        expect(
          getSiteAdminModel(role, url.pathname, url.search)?.canManage || false,
          `${entry.id} ${role.id}`,
        ).toBe(false);
    }
    const roots = new Set([
      ...workspaceSeed.map(([, , href]) => href),
      ...controlledResourceInventory
        .filter((entry) => entry.administrationWorkspaceId)
        .map((entry) => new URL(entry.href, "https://example.test").pathname),
    ]);
    for (const href of roots) {
      for (const role of previewRoles) {
        const model = getSiteAdminModel(
          role,
          `${href}/unknown-controlled-context`,
          "",
        );
        expect(model?.canManage || false, `${href} ${role.id}`).toBe(false);
        expect(model?.contents || [], `${href} ${role.id} contents`).toEqual(
          [],
        );
      }
    }
  });
});
