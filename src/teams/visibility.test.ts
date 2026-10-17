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
import { technicalChannels } from "../workspaces/technicalTeams";
import { publishingChannels } from "../workspaces/publishingTeams";
import {
  canAccessEmergency,
  canAccessProjectTeam,
  canAccessChannel,
  canAccessWorkspace,
} from "../access/policy";
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
} from "./visibility";

const person = (id: string) => staff.find((s) => s.id === id)!;
afterEach(() => vi.unstubAllGlobals());

describe("all Teams surfaces follow the central five-role policy", () => {
  it("falls stale personas back to the ordinary default instead of retaining stored privilege", () => {
    expect(staff.map((member) => member.id)).toEqual([
      "taylor",
      "maya",
      "robin",
      "jamie",
      "devon",
    ]);
    vi.stubGlobal("sessionStorage", { getItem: () => "devon" });
    for (const stale of [
      "morgan",
      "unknown",
      "alex",
      "sam",
      "riley",
      "skyler",
    ]) {
      expect(resolveStaffPerson(stale).id).toBe("taylor");
      expect(teamsStaffForWorkspace("digital", stale)).toBe("taylor");
      expect(visibleContentChannels(stale)).toEqual([]);
      expect(
        canSeeWorkspaceChannel(
          { id: stale },
          "digital",
          "Security Engineering",
        ),
      ).toBe(false);
      expect(canSeeProject({ id: stale }, "PRJ-2026-014")).toBe(false);
    }
    vi.stubGlobal("sessionStorage", { getItem: () => "alex" });
    expect(selectedStaffId()).toBe("taylor");
    expect(resolveStaffPerson().id).toBe("taylor");
    expect(teamsStaffForWorkspace("content", "maya")).toBe("maya");
  });
  it("keeps Company Updates universal without joining every role to Logistics", () => {
    for (const member of staff) {
      const groups = teamsGroups(member);
      expect(groups[0].id).toBe("company");
      expect(groups[0].channels.map((c) => c.id)).toEqual(
        channels
          .filter((c) => c.team === "company")
          .map((c) => `company:${c.id}`),
      );
      expect(groups.some((group) => group.id === "logistics")).toBe(
        member.id === "maya",
      );
      expect(groups.every((group) => group.channels.length > 0)).toBe(true);
      const ids = groups.flatMap((g) => g.channels.map((c) => c.id));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("never shows every operational channel and gives the frontline role its actual subset", () => {
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
        .filter((c) => canSeeLogisticsChannel(person("maya"), c))
        .map((c) => c.id),
    ).toEqual(["general", "street", "central-city", "telephone"]);
    for (const id of ["taylor", "robin", "jamie", "devon"])
      expect(
        operational
          .filter((c) => canSeeLogisticsChannel(person(id), c))
          .map((c) => c.id),
      ).toEqual([]);
  });
  it("keeps the five-role Team matrix explicit and independent of SharePoint visibility", () => {
    const expected = {
      taylor: ["company", "marketing-growth"],
      maya: ["company", "logistics", "marketing-growth", "PRJ-2026-014"],
      robin: [
        "company",
        "planning",
        "executive-office",
        "PRJ-2026-027",
        "emergency",
      ],
      jamie: ["company", "people-culture", "PRJ-2026-034", "emergency"],
      devon: [
        "company",
        "digital",
        "publishing",
        "strategy-technology",
        "PRJ-2026-014",
        "PRJ-2026-042",
        "emergency",
      ],
    };
    for (const member of staff) {
      expect(teamsGroups(member).map((group) => group.id)).toEqual(
        expected[member.id as keyof typeof expected],
      );
      const ownDepartment = teamsGroups(member).filter((group) =>
        departments.some((department) => department.id === group.id),
      );
      expect(ownDepartment.map((group) => group.id)).toEqual([
        member.departmentId,
      ]);
      expect(canAccessWorkspace(member, "logistics")).toBe(true);
      expect(canSeeWorkspace(member, "logistics")).toBe(member.id === "maya");
      expect(canSeeWorkspace(member, "content")).toBe(false);
      expect(visibleWorkspaceChannels(member, "planning")).toEqual(
        member.id === "robin" ? ["General", "Planning coordination"] : [],
      );
      expect(visibleWorkspaceChannels(member, "digital")).toEqual(
        member.id === "devon" ? technicalChannels : [],
      );
      expect(visibleWorkspaceChannels(member, "publishing")).toEqual(
        member.id === "devon" ? publishingChannels : [],
      );
    }
    // Ordinary SharePoint readers still have no live Studio or project Team membership.
    expect(canAccessWorkspace("taylor", "content")).toBe(true);
    expect(canAccessProjectTeam("taylor", "PRJ-2026-021")).toBe(false);
  });
  it("uses identical grants in sidebars, direct channels, temporary rooms and moderator Teams", () => {
    for (const member of staff) {
      const groups = teamsGroups(member);
      for (const workspace of workspaces.filter(
        (w) => w.teams && w.id !== "logistics",
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
          canAccessChannel(member, "content", channel.id),
        );
      expect(
        canSeeWorkspaceChannel(member, "digital", "Security Engineering"),
      ).toBe(member.id === "devon");
      expect(
        canSeeWorkspaceChannel(member, "publishing", "Wiki Moderation"),
      ).toBe(member.id === "devon");
    }
    expect(canSeeWorkspace(person("maya"), "content")).toBe(false);
    expect(canSeeWorkspace(person("taylor"), "publishing")).toBe(false);
    expect(
      canSeeWorkspaceChannel(person("devon"), "digital", "Web & CRM DevOps"),
    ).toBe(true);
  });
  it("shows only assigned project conversations and incident-specific responses", () => {
    for (const member of staff) {
      const groups = teamsGroups(member);
      for (const project of currentProjects)
        expect(groups.some((group) => group.id === project.code)).toBe(
          canAccessProjectTeam(member, project.code),
        );
      expect(
        groups
          .find((group) => group.id === "emergency")
          ?.channels.map((channel) => channel.id) || [],
      ).toEqual(
        initialIncidents
          .filter((incident) => canAccessEmergency(member, incident.id))
          .map((incident) => `emergency:${incident.id}`),
      );
      for (const incident of initialIncidents)
        expect(
          incident.participants.some(
            (participant) => participant.name === member.name,
          ),
        ).toBe(canAccessEmergency(member, incident.id));
    }
  });
  it("switches preview roles without retaining another role's channel, file or private unit", () => {
    expect(
      teamsPreviewHrefForStaff(
        person("jamie"),
        "/logistics/teams",
        "?staff=maya&channel=central-city&document=central-schedule&tab=Shared",
      ),
    ).toBe("/teams?staff=jamie");
    expect(
      teamsPreviewHrefForStaff(
        person("jamie"),
        "/teams",
        "?staff=taylor&workspace=content&channel=Editorial+Desk&file=landing-copy",
      ),
    ).toBe("/teams?staff=jamie");
    const next = new URL(
      teamsPreviewHrefForStaff(
        person("jamie"),
        "/teams",
        "?staff=taylor&department=pac&unit=learning-and-capability&folder=Unit+Meetings&file=private-unit&tab=Shared",
      ),
      "https://example.test",
    );
    expect(next.searchParams.get("department")).toBe("pac");
    for (const key of ["unit", "folder", "file"])
      expect(next.searchParams.has(key)).toBe(false);
    expect(
      teamsPreviewHrefForStaff(
        person("taylor"),
        "/projects/PRJ-2026-014/teams",
        "?staff=devon&tab=Shared",
      ),
    ).toBe("/teams?staff=taylor");
    expect(
      teamsPreviewHrefForStaff(
        person("maya"),
        "/emergency-response/incidents/INC-104",
        "?staff=devon",
      ),
    ).toBe("/teams?staff=maya");
    expect(
      teamsPreviewHrefForStaff(
        person("devon"),
        "/logistics/teams",
        "?staff=maya&channel=central-city&tab=Shared&document=central-schedule",
      ),
    ).toBe("/teams?staff=devon");
    expect(
      teamsPreviewHrefForStaff(
        person("jamie"),
        "/teams",
        "?staff=devon&workspace=digital&channel=AI+Lab&tab=Shared&file=restricted-file",
      ),
    ).toBe("/teams?staff=jamie");
  });
});
