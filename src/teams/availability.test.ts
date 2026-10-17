import { describe, expect, it } from "vitest";
import { workspaceRegistry, hasWorkspaceTeams } from "../workspaces/registry";
import { staff } from "../intranet/catalog";
import { teamsGroups, defaultTeamsContext } from "./navigation";
import { canSeeWorkspace, visibleWorkspaceChannels } from "./visibility";
import { sharepointDestination } from "./sharepointDestination";
import { files as financeFiles } from "../finance/data";
import {
  financialDocument,
  libraries as financeLibraries,
} from "../finance/libraries";
import { configById } from "../workspaces/config";
import {
  functionalLibraryDocuments,
  libraryForFile,
} from "../workspaces/siteArchitecture";
import { files as contentFiles } from "../content/data";
import { documentFor as contentDocument } from "../content/libraries";
import { documents as planningFiles } from "../data/workspace";

const person = (id: string) => staff.find((item) => item.id === id)!;

describe("Teams is available only where the work needs live coordination", () => {
  it("explicitly enables operations, content production, engineering and lightweight reference planning", () => {
    expect(
      workspaceRegistry
        .filter((workspace) => workspace.teams)
        .map((workspace) => workspace.id),
    ).toEqual(["planning", "logistics", "content", "digital"]);
    expect(hasWorkspaceTeams("unknown")).toBe(false);
    expect(hasWorkspaceTeams("projects")).toBe(false);
  });
  it("does not manufacture generic Teams for administrative and reference sites for any staff member", () => {
    for (const workspace of workspaceRegistry.filter((item) => !item.teams)) {
      for (const member of staff) {
        expect(canSeeWorkspace(member, workspace.id)).toBe(false);
        expect(visibleWorkspaceChannels(member, workspace.id)).toEqual([]);
        expect(
          teamsGroups(member).some((group) => group.id === workspace.id),
        ).toBe(false);
      }
    }
  });
  it("uses deterministic central role landings rather than functional SharePoint visibility", () => {
    for (const id of ["taylor", "jamie", "robin"]) {
      const member = person(id);
      expect(defaultTeamsContext(member)).toEqual({
        workspaceId: undefined,
        departmentId: member.departmentId,
      });
      expect(
        teamsGroups(member).some((group) => group.id === member.departmentId),
      ).toBe(true);
    }
    expect(defaultTeamsContext(person("devon"))).toEqual({
      workspaceId: "digital",
      departmentId: undefined,
      channel: "Engineering",
    });
    expect(defaultTeamsContext(person("leonie"))).toEqual({
      workspaceId: "digital",
      departmentId: undefined,
      channel: "Workspace & Wiki Moderators",
    });
    expect(defaultTeamsContext(person("maya"))).toEqual({
      workspaceId: "logistics",
      departmentId: undefined,
      channel: "general",
    });
    // Editing a SharePoint-oriented context cannot silently join an unrelated Team.
    expect(
      defaultTeamsContext({ ...person("taylor"), workspace: "logistics" }),
    ).toEqual({
      workspaceId: undefined,
      departmentId: "marketing-growth",
    });
  });
  it("retains active project, department and emergency teams independently from the central Projects site", () => {
    expect(
      teamsGroups(person("jamie")).some((group) => group.id === "PRJ-2026-034"),
    ).toBe(true);
    const participant = teamsGroups(person("devon"));
    expect(
      participant
        .find((group) => group.id === "emergency")!
        .channels.map((channel) => channel.id),
    ).toEqual(["emergency:INC-104"]);
    expect(
      participant.some((group) => group.id === person("devon").departmentId),
    ).toBe(true);
  });
});

describe("Legacy Teams document links keep their real SharePoint location", () => {
  it("preserves financial file identity and useful folder context without a generic financial Team", () => {
    const file = financeFiles.find((item) => item.id === "FIN-06")!;
    const library = financeLibraries.find((item) =>
      item.areas.includes(file.folder),
    )!;
    const target = new URL(
      sharepointDestination("finance", file.id),
      "https://example.test",
    );
    expect(target.pathname).toBe(`/financial-operations/${library.id}`);
    expect(target.searchParams.get("file")).toBe(file.id);
    expect(target.searchParams.get("folder")).toBe(
      financialDocument(file).folder,
    );
  });
  it("resolves each shared administrative file to its configured library and same metadata-backed folder", () => {
    for (const id of [
      "services",
      "employment",
      "people",
      "legal",
      "archives",
    ]) {
      const config = configById.get(id)!;
      for (const file of config.files) {
        const library = libraryForFile(config, file.id)!;
        const document = functionalLibraryDocuments(config, library).find(
          (item) => item.id === file.id,
        )!;
        const target = new URL(
          sharepointDestination(id, file.id),
          "https://example.test",
        );
        expect(target.pathname).toBe(
          `${workspaceRegistry.find((workspace) => workspace.id === id)!.href}/${library.id}`,
        );
        expect(target.searchParams.get("file")).toBe(file.id);
        expect(target.searchParams.get("folder")).toBe(document.folder);
      }
    }
  });
  it("redirects pre-split People Teams links to the same migrated employment working file", () => {
    for (const id of ["people-F3", "people-F4", "people-F7"]) {
      const target = new URL(
        sharepointDestination("people", id),
        "https://example.test",
      );
      expect(target.pathname.startsWith("/employment-admin/")).toBe(true);
      expect(target.searchParams.get("file")).toBe(id);
      expect(target.searchParams.get("folder")).toBeTruthy();
    }
    expect(sharepointDestination("people", "candidate-assessments")).toBe(
      "/people-culture",
    );
  });
  it("preserves Creative & Editorial Studio file identity and never carries protected IDs into a normal document route", () => {
    const file = contentFiles.find((item) => item.id === "welcome-message")!;
    const target = new URL(
      sharepointDestination("content", file.id),
      "https://example.test",
    );
    expect(target.searchParams.get("file")).toBe(file.id);
    expect(target.searchParams.get("folder")).toBe(
      contentDocument(file).folder,
    );
    expect(sharepointDestination("employment", "employee-records")).toBe(
      "/employment-admin",
    );
    expect(sharepointDestination("executive", "EX-12")).toBe("/executive");
    const protectedPlanning = planningFiles.find(
      (item) => item.library === "restricted",
    )!;
    expect(sharepointDestination("planning", protectedPlanning.id)).toBe(
      "/planning",
    );
  });
});
