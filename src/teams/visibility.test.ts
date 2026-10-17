import { describe, expect, it } from "vitest";
import { staff, workspaces } from "../intranet/catalog";
import { channels } from "../logistics/data";
import { currentProjects } from "../projects/data";
import { teamsGroups } from "./navigation";
import {
  canSeeDepartment,
  canSeeLogisticsChannel,
  canSeeProject,
  canSeeWorkspace,
  canSeeWorkspaceChannel,
  isInformationManager,
  workspaceMemberships,
} from "./visibility";

const person = (id: string) => staff.find((s) => s.id === id)!;

describe("Teams membership follows the selected staff context", () => {
  it("puts safe company teams first in every staff view", () => {
    for (const member of staff) {
      const groups = teamsGroups(member);
      expect(groups.slice(0, 2).map((g) => g.id)).toEqual([
        "company",
        "logistics",
      ]);
      expect(groups[0].channels.map((c) => c.id)).toContain("company:pets");
      expect(groups[1].channels.map((c) => c.id)).toContain(
        "logistics:general",
      );
    }
  });
  it("gives ordinary staff one or two functional memberships and one IT role wider access", () => {
    for (const member of staff.filter(
      (s) => !["devon", "morgan"].includes(s.id),
    )) {
      expect(workspaceMemberships[member.id].length).toBeGreaterThanOrEqual(1);
      expect(workspaceMemberships[member.id].length).toBeLessThanOrEqual(2);
    }
    expect(workspaceMemberships.devon.length).toBe(4);
  });
  it("does not turn company visibility into logistics operations membership", () => {
    const sam = person("sam");
    expect(
      channels
        .filter((c) => canSeeLogisticsChannel(sam, c))
        .filter((c) => c.team === "logistics")
        .map((c) => c.id),
    ).toEqual(["general"]);
    expect(
      canSeeLogisticsChannel(
        sam,
        channels.find((c) => c.id === "telephone")!,
      ),
    ).toBe(false);
    expect(
      canSeeLogisticsChannel(
        person("maya"),
        channels.find((c) => c.id === "telephone")!,
      ),
    ).toBe(true);
  });
  it("rejects unrelated workspace, private channel and department URLs", () => {
    expect(canSeeWorkspace(person("maya"), "finance")).toBe(false);
    expect(
      canSeeWorkspaceChannel(person("maya"), "finance", "Close coordination"),
    ).toBe(false);
    expect(
      canSeeWorkspaceChannel(
        person("devon"),
        "digital",
        "Security Engineering",
      ),
    ).toBe(false);
    expect(canSeeDepartment(person("maya"), "finance-services")).toBe(false);
    expect(teamsGroups(person("sam")).some((g) => g.id === "digital")).toBe(
      false,
    );
    expect(
      teamsGroups(person("maya")).filter((g) => g.id.endsWith("-services"))
        .length,
    ).toBe(0);
  });
  it("shows project teams only to the two assigned ordinary staff", () => {
    const ordinaryMembers = staff.filter(
      (s) =>
        !isInformationManager(s) &&
        currentProjects.some((p) => canSeeProject(s, p.code)),
    );
    expect(ordinaryMembers.map((s) => s.id).sort()).toEqual([
      "devon",
      "jordan",
    ]);
    for (const member of ordinaryMembers) {
      const projects = currentProjects.filter((p) =>
        canSeeProject(member, p.code),
      );
      expect(projects).toHaveLength(1);
      expect(projects[0].members).toContain(member.id);
    }
    expect(canSeeProject(person("maya"), "PRJ-2026-014")).toBe(false);
  });
  it("gives the information specialist all team structures and private channels", () => {
    const specialist = person("morgan");
    expect(specialist.role).toBe("Information Management Specialist");
    for (const workspace of workspaces.filter((w) => w.teams))
      expect(canSeeWorkspace(specialist, workspace.id)).toBe(true);
    expect(
      canSeeWorkspaceChannel(specialist, "digital", "Security Engineering"),
    ).toBe(true);
    expect(
      currentProjects.every((p) => canSeeProject(specialist, p.code)),
    ).toBe(true);
    const groups = teamsGroups(specialist);
    expect(
      groups
        .find((g) => g.id === "digital")!
        .channels.find((c) => c.label === "Security Engineering")!.private,
    ).toBe(true);
    expect(groups.some((g) => g.id === "emergency")).toBe(true);
    expect(groups.flatMap((g) => g.channels).map((c) => c.id).length).toBe(
      new Set(groups.flatMap((g) => g.channels).map((c) => c.id)).size,
    );
  });
});
