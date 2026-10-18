import { afterEach, describe, expect, it, vi } from "vitest";
import {
  staff,
  resolveStaffPerson,
  selectedStaffId,
} from "../intranet/catalog";
import { channels } from "../logistics/data";
import { contentChannels, visibleContentChannels } from "../content/channels";
import { initialIncidents } from "../executive/incidentData";
import { currentProjects } from "../projects/data";
import { departments } from "../coordination/data";
import { canAccessEmergency, previewRoleFor } from "../access/policy";
import {
  channelNavigationFor,
  teamsGroups,
  teamsPreviewHrefForStaff,
  teamsStaffForWorkspace,
  readChannelEntryContext,
} from "./navigation";
import {
  canSeeWorkspaceChannel,
  visibleWorkspaceChannels,
  workspaceChannels,
} from "./visibility";

const person = (id: string) => staff.find((member) => member.id === id)!;
afterEach(() => vi.unstubAllGlobals());

describe("curated global channels and explicit entry context", () => {
  it("keeps stale identities ordinary and preserves genuine private boundaries", () => {
    vi.stubGlobal("sessionStorage", { getItem: () => "devon" });
    for (const stale of ["morgan", "unknown", "alex", "riley", "skyler"]) {
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
    }
    vi.stubGlobal("sessionStorage", { getItem: () => "unknown" });
    expect(selectedStaffId()).toBe("taylor");
  });
  it("gives Demo User only Company Updates plus the personalisation helper globally", () => {
    const model = channelNavigationFor({ person: person("taylor") });
    expect(model.groups.map((group) => group.id)).toEqual(["company"]);
    expect(model.groups[0].channels.map((channel) => channel.id)).toEqual(
      channels
        .filter((channel) => channel.team === "company")
        .map((channel) => `company:${channel.id}`),
    );
    expect(model.showRoleDiscovery).toBe(true);
  });
  it("keeps every other global view curated from existing role participation", () => {
    const expected = {
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
        "strategy-technology",
        "PRJ-2026-014",
        "PRJ-2026-042",
        "emergency",
      ],
      leonie: ["company", "digital", "strategy-technology"],
      nadia: ["company", "content", "marketing-growth"],
      sam: ["company", "planning", "finance-services", "PRJ-2026-038"],
      elliot: ["company", "digital", "strategy-technology"],
    };
    for (const member of staff.filter((item) => item.id !== "taylor")) {
      const model = channelNavigationFor({ person: member });
      expect(model.groups.map((group) => group.id)).toEqual(
        expected[member.id as keyof typeof expected],
      );
      expect(model.showRoleDiscovery).toBe(false);
      for (const workspaceId of Object.keys(workspaceChannels)) {
        expect(
          model.groups
            .find((group) => group.id === workspaceId)
            ?.channels.map((channel) => channel.label) || [],
        ).toEqual(visibleWorkspaceChannels(member, workspaceId));
      }
      for (const project of currentProjects)
        expect(model.groups.some((group) => group.id === project.code)).toBe(
          !!previewRoleFor(member)?.projectTeamMemberships.includes(
            project.code,
          ),
        );
      expect(
        model.groups
          .find((group) => group.id === "emergency")
          ?.channels.map((channel) => channel.id) || [],
      ).toEqual(
        initialIncidents
          .filter((incident) => canAccessEmergency(member, incident.id))
          .map((incident) => `emergency:${incident.id}`),
      );
    }
  });
  it("shows exactly Company Updates and each deliberately selected Department for every role", () => {
    for (const member of staff)
      for (const department of departments) {
        const model = channelNavigationFor({
          person: member,
          entryContext: { kind: "department", id: department.id },
        });
        expect(model.groups.map((group) => group.id)).toEqual([
          "company",
          department.id,
        ]);
        expect(
          model.groups[1].channels.map((channel) => channel.label),
        ).toEqual(["General"]);
        expect(model.showRoleDiscovery).toBe(false);
      }
  });
  it("shows complete canonical workspace channels in context without unrelated groups", () => {
    for (const member of staff)
      for (const workspaceId of Object.keys(workspaceChannels)) {
        const model = channelNavigationFor({
          person: member,
          entryContext: { kind: "workspace", id: workspaceId },
        });
        expect(model.groups.map((group) => group.id)).toEqual([
          "company",
          workspaceId,
        ]);
        expect(
          model.groups[1].channels.map((channel) => channel.label),
        ).toEqual(workspaceChannels[workspaceId]);
        expect(model.showRoleDiscovery).toBe(false);
      }
    for (const channel of contentChannels)
      expect(
        canSeeWorkspaceChannel(person("taylor"), "content", channel.name),
      ).toBe(true);
    expect(
      canSeeWorkspaceChannel(
        person("taylor"),
        "digital",
        "Security Engineering",
      ),
    ).toBe(false);
    expect(
      canSeeWorkspaceChannel(
        person("devon"),
        "digital",
        "Security Engineering",
      ),
    ).toBe(true);
  });
  it("keeps project and emergency contexts specific and protects restricted environments", () => {
    const open = teamsGroups(person("taylor"), {
      kind: "project",
      id: "PRJ-2026-014",
    });
    expect(open.map((group) => group.id)).toEqual(["company", "PRJ-2026-014"]);
    expect(
      teamsGroups(person("taylor"), {
        kind: "project",
        id: "PRJ-2026-027",
      }).map((group) => group.id),
    ).toEqual(["company"]);
    expect(
      teamsGroups(person("taylor"), { kind: "incident", id: "INC-104" }).map(
        (group) => group.id,
      ),
    ).toEqual(["company"]);
    expect(
      teamsGroups(person("devon"), { kind: "incident", id: "INC-104" }).map(
        (group) => group.id,
      ),
    ).toEqual(["company", "emergency"]);
    expect(
      teamsGroups(person("taylor"), {
        kind: "project",
        id: "PRJ-2024-018",
      }).map((group) => group.id),
    ).toEqual(["company", "PRJ-2024-018"]);
    expect(
      readChannelEntryContext(
        "/projects/archive/PRJ-2024-018/teams",
        "?staff=taylor",
      ),
    ).toEqual({ kind: "project", id: "PRJ-2024-018" });
  });
  it("preserves contextual environments across role changes while clearing transient files, posts and stale unit state", () => {
    for (const [pathname, search, expected] of [
      [
        "/teams",
        "?staff=nadia&workspace=content&channel=Editorial+Desk&file=landing-copy&post=studio-editorial",
        { kind: "workspace", id: "content" },
      ],
      [
        "/logistics/teams",
        "?staff=maya&channel=central-city&document=central-deployment&tab=Shared",
        { kind: "workspace", id: "logistics" },
      ],
      [
        "/teams",
        "?staff=robin&department=cpa&unit=editorial&folder=Unit+Meetings&file=private-unit",
        { kind: "department", id: "communications" },
      ],
      [
        "/projects/PRJ-2026-027/teams",
        "?staff=robin&channel=General",
        { kind: "project", id: "PRJ-2026-027" },
      ],
      [
        "/projects/archive/PRJ-2024-018/teams",
        "?staff=taylor&channel=Decisions+%26+Actions&tab=Posts",
        { kind: "project", id: "PRJ-2024-018" },
      ],
    ] as const) {
      const target = new URL(
        teamsPreviewHrefForStaff(person("sam"), pathname, search),
        "https://example.test",
      );
      expect(readChannelEntryContext(target.pathname, target.search)).toEqual(
        expected,
      );
      expect(target.searchParams.get("staff")).toBe("sam");
      for (const key of ["unit", "folder", "file", "document", "post"])
        expect(target.searchParams.has(key)).toBe(false);
    }
  });
  it("makes global scope explicit for global selections and clears stale context on global entry", () => {
    expect(readChannelEntryContext("/teams", "?staff=sam")).toBeUndefined();
    expect(
      readChannelEntryContext(
        "/teams",
        "?context=global&workspace=planning&channel=Planning+%26+Reporting",
      ),
    ).toBeUndefined();
    expect(
      readChannelEntryContext(
        "/teams",
        "?context=workspace:content&workspace=digital",
      ),
    ).toEqual({ kind: "workspace", id: "content" });
    expect(
      readChannelEntryContext("/teams", "?context=department:unknown"),
    ).toBeUndefined();
    const assign = vi.fn();
    vi.stubGlobal("location", { assign });
    teamsGroups(person("sam"))
      .find((group) => group.id === "planning")!
      .channels[0].onSelect();
    const selected = new URL(assign.mock.calls[0][0], "https://example.test");
    expect(selected.searchParams.get("context")).toBe("global");
    expect(
      readChannelEntryContext(selected.pathname, selected.search),
    ).toBeUndefined();
    expect(teamsGroups(person("sam")).map((group) => group.id)).toEqual([
      "company",
      "planning",
      "finance-services",
      "PRJ-2026-038",
    ]);
  });
});
