import { afterEach, describe, expect, it, vi } from "vitest";
import {
  staff,
  workspaces,
  resolveStaffPerson,
  selectedStaffId,
} from "../intranet/catalog";
import { channels } from "../logistics/data";
import { contentChannels, visibleContentChannels } from "../content/channels";
import { initialIncidents } from "../executive/incidentData";
import { currentProjects } from "../projects/data";
import { departments } from "../coordination/data";
import {
  teamsGroups,
  teamsPreviewHrefForStaff,
  teamsStaffForWorkspace,
} from "./navigation";
import {
  canSeeDepartment,
  canSeeLogisticsChannel,
  canSeeProject,
  canSeeWorkspace,
  canSeeWorkspaceChannel,
  visibleWorkspaceChannels,
  workspaceMemberships,
} from "./visibility";

const person = (id: string) => staff.find((s) => s.id === id)!;
afterEach(() => vi.unstubAllGlobals());

describe("Teams membership follows the selected staff context", () => {
  it("removes the information-manager preview and safely resolves stale links and stored selection to Maya", () => {
    expect(staff.some((member) => member.id === "morgan")).toBe(false);
    expect(
      staff.some((member) =>
        /Information Management Specialist|administrator/i.test(member.role),
      ),
    ).toBe(false);
    vi.stubGlobal("sessionStorage", { getItem: () => "devon" });
    expect(resolveStaffPerson("morgan").id).toBe("maya");
    expect(resolveStaffPerson("unknown").id).toBe("maya");
    vi.stubGlobal("sessionStorage", { getItem: () => "morgan" });
    expect(selectedStaffId()).toBe("maya");
    expect(resolveStaffPerson().id).toBe("maya");
    expect(teamsStaffForWorkspace("archives", "morgan")).toBe("maya");
    expect(teamsStaffForWorkspace("content", "maya")).toBe("maya");
    expect(teamsStaffForWorkspace("digital", "sam")).toBe("sam");
    vi.stubGlobal("sessionStorage", { getItem: () => "sam" });
    expect(teamsStaffForWorkspace("digital")).toBe("sam");
    expect(teamsStaffForWorkspace("content")).toBe("sam");
    expect(visibleContentChannels("morgan")).toEqual([]);
    expect(
      canSeeWorkspaceChannel(
        { id: "morgan" },
        "digital",
        "Security Engineering",
      ),
    ).toBe(false);
    expect(canSeeProject({ id: "morgan" }, "PRJ-2026-014")).toBe(false);
  });
  it("puts company channels and logistics General first in every staff view", () => {
    for (const member of staff) {
      const groups = teamsGroups(member);
      expect(groups.slice(0, 2).map((g) => g.id)).toEqual([
        "company",
        "logistics",
      ]);
      expect(groups[0].channels.map((c) => c.id)).toEqual(
        channels
          .filter((channel) => channel.team === "company")
          .map((channel) => `company:${channel.id}`),
      );
      expect(groups[1].channels.map((c) => c.id)).toContain(
        "logistics:general",
      );
      expect(
        new Set(
          groups.flatMap((group) =>
            group.channels.map((channel) => channel.id),
          ),
        ).size,
      ).toBe(groups.flatMap((group) => group.channels).length);
    }
  });
  it("keeps ordinary memberships to one or two workspaces and one engineering role broader", () => {
    for (const member of staff.filter((s) => s.id !== "devon")) {
      expect(workspaceMemberships[member.id].length).toBeGreaterThanOrEqual(1);
      expect(workspaceMemberships[member.id].length).toBeLessThanOrEqual(2);
    }
    expect(workspaceMemberships.devon.length).toBe(4);
  });
  it("grants each logistics colleague a relevant subset rather than every operational channel", () => {
    const operational = channels.filter(
      (channel) => channel.team === "logistics",
    );
    for (const member of staff) {
      const visible = operational.filter((channel) =>
        canSeeLogisticsChannel(member, channel),
      );
      expect(visible.length).toBeLessThan(operational.length);
      expect(visibleWorkspaceChannels(member, "logistics")).toEqual(
        visible.map((channel) => channel.name),
      );
    }
    expect(
      operational
        .filter((channel) => canSeeLogisticsChannel(person("maya"), channel))
        .map((channel) => channel.id),
    ).toEqual(["general", "street", "central-city", "telephone"]);
    expect(
      operational
        .filter((channel) => canSeeLogisticsChannel(person("sam"), channel))
        .map((channel) => channel.id),
    ).toEqual(["general"]);
    expect(
      operational
        .filter((channel) => canSeeLogisticsChannel(person("jordan"), channel))
        .map((channel) => channel.id),
    ).toEqual(["general", "travel"]);
    expect(
      operational
        .filter((channel) => canSeeLogisticsChannel(person("elena"), channel))
        .map((channel) => channel.id),
    ).toEqual(["general", "onboarding"]);
  });
  it("uses the same grants for every sidebar, direct workspace/channel URL and department", () => {
    for (const member of staff) {
      const groups = teamsGroups(member);
      for (const workspace of workspaces.filter(
        (workspace) => workspace.teams && workspace.id !== "logistics",
      )) {
        const group = groups.find((item) => item.id === workspace.id);
        expect(group?.channels.map((channel) => channel.label) || []).toEqual(
          visibleWorkspaceChannels(member, workspace.id),
        );
        for (const channel of group?.channels || [])
          expect(
            canSeeWorkspaceChannel(member, workspace.id, channel.label),
          ).toBe(true);
      }
      for (const department of departments)
        expect(groups.some((group) => group.id === department.id)).toBe(
          canSeeDepartment(member, department.id),
        );
      for (const channel of contentChannels)
        expect(canSeeWorkspaceChannel(member, "content", channel.name)).toBe(
          channel.members.includes(member.id),
        );
      expect(
        canSeeWorkspaceChannel(member, "digital", "Security Engineering"),
      ).toBe(false);
    }
    expect(canSeeWorkspace(person("maya"), "finance")).toBe(false);
    expect(
      canSeeWorkspaceChannel(person("devon"), "digital", "Web & CRM DevOps"),
    ).toBe(false);
    expect(
      canSeeWorkspaceChannel(person("devon"), "digital", "Platform Operations"),
    ).toBe(true);
    expect(canSeeDepartment(person("maya"), "finance-services")).toBe(false);
  });
  it("shows project and incident channels only to their assigned participants", () => {
    const projectMembers = staff.filter((member) =>
      currentProjects.some((project) => canSeeProject(member, project.code)),
    );
    expect(projectMembers.map((member) => member.id).sort()).toEqual([
      "devon",
      "jordan",
    ]);
    for (const member of staff) {
      const groups = teamsGroups(member);
      for (const project of currentProjects)
        expect(groups.some((group) => group.id === project.code)).toBe(
          canSeeProject(member, project.code),
        );
      expect(
        groups
          .find((group) => group.id === "emergency")
          ?.channels.map((channel) => channel.id) || [],
      ).toEqual(
        initialIncidents
          .filter((incident) =>
            incident.participants.some(
              (participant) => participant.name === member.name,
            ),
          )
          .map((incident) => `emergency:${incident.id}`),
      );
    }
  });
  it("switches personas without retaining someone else's channel, file or unit context", () => {
    expect(
      teamsPreviewHrefForStaff(
        person("sam"),
        "/logistics/teams",
        "?staff=maya&channel=central-city&document=central-schedule&tab=Shared",
      ),
    ).toBe("/logistics/teams?staff=sam&channel=important&tab=Posts");
    expect(
      teamsPreviewHrefForStaff(
        person("sam"),
        "/teams",
        "?staff=alex&workspace=content&channel=Web+Desk&file=landing-copy",
      ),
    ).toBe("/teams?staff=sam");
    const next = new URL(
      teamsPreviewHrefForStaff(
        person("jamie"),
        "/teams",
        "?staff=elena&department=pac&unit=learning-and-capability&folder=Unit+Meetings&file=private-unit&tab=Shared",
      ),
      "https://example.test",
    );
    expect(next.searchParams.get("department")).toBe("pac");
    for (const key of ["unit", "folder", "file"])
      expect(next.searchParams.has(key)).toBe(false);
    expect(
      teamsPreviewHrefForStaff(
        person("maya"),
        "/projects/PRJ-2026-014/teams",
        "?staff=devon&tab=Shared",
      ),
    ).toBe("/teams?staff=maya");
    expect(
      teamsPreviewHrefForStaff(
        person("maya"),
        "/emergency-response/incidents/INC-104",
        "?staff=harper",
      ),
    ).toBe("/teams?staff=maya");
  });
});
