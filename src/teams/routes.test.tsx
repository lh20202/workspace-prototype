import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { staff } from "../intranet/catalog";
import TeamsView from "../logistics/TeamsView";
import LogisticsApp, { documentFromLocation } from "../logistics/LogisticsApp";
import TeamsPreview from "../intranet/TeamsPreview";
import ContentApp from "../content/ContentApp";
import FunctionalApp from "../workspaces/FunctionalApp";
import ProjectsApp from "../projects/ProjectsApp";
import EmergencyApp from "../executive/EmergencyApp";
import PlanningApp from "../App";
import DepartmentChannel from "../coordination/DivisionChannel";
import { departments } from "../coordination/data";
import { channels, posts } from "../logistics/data";
import {
  contentChannels,
  canSeeContentChannel,
  visibleContentChannels,
} from "../content/channels";
import { canSeeLogisticsChannel, canSeeWorkspaceChannel } from "./visibility";

function at(path: string, stored = "maya") {
  vi.stubGlobal("location", new URL(path, "https://example.test"));
  vi.stubGlobal("sessionStorage", { getItem: () => stored });
}
function logisticsChannel(path: string) {
  at(path);
  const params = new URL(path, "https://example.test").searchParams;
  return renderToStaticMarkup(
    createElement(TeamsView, {
      channelId: params.get("channel") || "general",
      activeTab: params.get("tab") || "Posts",
      onNavigate: () => {},
      onOpenFile: () => {},
      onWorkspace: () => {},
      onMessage: () => {},
    }),
  );
}
function panelLinks(html: string) {
  const panel =
    html.match(/<section class="teams-home-panel"[\s\S]*?<\/section>/)?.[0] ||
    "";
  return [...panel.matchAll(/href="([^"]+)"/g)].map(
    (match) =>
      new URL(match[1].replaceAll("&amp;", "&"), "https://example.test"),
  );
}
afterEach(() => vi.unstubAllGlobals());

describe("Teams route boundaries use the same staff memberships as navigation", () => {
  it("denies unjoined operational channels and their shared files for every selectable staff member", () => {
    for (const person of staff) {
      const denied = channels.find(
        (channel) =>
          channel.team === "logistics" &&
          !canSeeLogisticsChannel(person, channel),
      )!;
      expect(denied).toBeDefined();
      for (const tab of ["Posts", "Shared", "Notes", "Planner"]) {
        const html = logisticsChannel(
          `/logistics/teams?staff=${person.id}&channel=${denied.id}&tab=${tab}&document=${denied.fileIds[0]}`,
        );
        expect(html).toContain("Access required");
        expect(html).not.toContain("Manage teams");
        expect(html).not.toContain('class="document-library');
        for (const post of posts.filter((post) => post.channel === denied.id))
          expect(html).not.toContain(post.text);
      }
    }
    expect(
      logisticsChannel(
        "/logistics/teams?staff=maya&channel=central-city&tab=Posts",
      ),
    ).not.toContain("Access required");
    expect(
      logisticsChannel("/logistics/teams?staff=sam&channel=pets&tab=Posts"),
    ).toContain("take me to your leader");
  });
  it("blocks Logistics General Posts and Shared deep links for every non-member", () => {
    const general = channels.find((channel) => channel.id === "general")!;
    for (const person of staff.filter((member) => member.id !== "maya")) {
      for (const tab of ["Posts", "Shared", "Notes", "Planner"]) {
        const html = logisticsChannel(
          `/logistics/teams?staff=${person.id}&channel=general&tab=${tab}&document=${general.fileIds[0] || "operations-handbook"}`,
        );
        expect(html).toContain("Access required");
        expect(html).not.toContain('class="document-library');
        for (const post of posts.filter((post) => post.channel === "general"))
          expect(html).not.toContain(post.text);
      }
    }
  });
  it("blocks file previews on both Logistics deep-link parameter variants", () => {
    for (const person of staff.filter((member) => member.id !== "maya")) {
      for (const parameter of ["document", "file"]) {
        at(
          `/logistics/teams?staff=${person.id}&channel=central-city&tab=Shared&${parameter}=central-deployment`,
        );
        const html = renderToStaticMarkup(createElement(LogisticsApp));
        expect(html).toContain("Access required");
        expect(html).not.toContain('class="detail-file"');
        expect(html).not.toContain('class="document-library');
        expect(documentFromLocation()).toBeNull();
      }
    }
    for (const path of ["/logistics/teams/", "/logistics/teams/legacy-path"]) {
      at(
        `${path}?staff=taylor&channel=central-city&document=central-deployment`,
      );
      expect(documentFromLocation()).toBeNull();
    }
    at(
      "/logistics/teams?staff=maya&channel=central-city&file=central-deployment",
    );
    expect(documentFromLocation()?.id).toBe("central-deployment");
  });
  it("does not fall back unknown channels to General", () => {
    expect(
      logisticsChannel(
        "/logistics/teams?staff=maya&channel=unknown-channel&tab=Posts",
      ),
    ).toContain("Access required");
    at(
      "/teams?staff=devon&workspace=digital&channel=unknown-channel&tab=Posts",
    );
    expect(renderToStaticMarkup(createElement(TeamsPreview))).toContain(
      "Access required",
    );
  });
  it("denies direct technical and moderator Posts and Shared routes to all unjoined roles", () => {
    for (const person of staff.filter((member) => member.id !== "devon")) {
      for (const [workspace, channel] of [
        ["digital", "AI Lab"],
        ["publishing", "Wiki Moderation"],
      ]) {
        for (const tab of ["Posts", "Shared"]) {
          at(
            `/teams?${new URLSearchParams({ staff: person.id, workspace, channel, tab, file: "digital-F1" })}`,
          );
          const html = renderToStaticMarkup(createElement(TeamsPreview));
          expect(html).toContain("Access required");
          expect(html).not.toContain('class="document-library');
          expect(html).not.toContain('class="technical-conversation');
        }
      }
    }
    at(
      "/teams?staff=devon&workspace=employment&channel=General&tab=Shared&file=people-F3",
    );
    const employment = renderToStaticMarkup(createElement(TeamsPreview));
    expect(employment).not.toContain("Employee Master Record");
    expect(employment).not.toContain('class="document-library');
  });
  it("denies direct Studio desk URLs before rendering any files or conversation", () => {
    for (const person of staff) {
      const denied = contentChannels.find(
        (channel) => !canSeeContentChannel(person.id, channel.name),
      )!;
      at(
        `/teams?${new URLSearchParams({ staff: person.id, workspace: "content", channel: denied.name, tab: "Shared", file: "landing-copy" })}`,
      );
      const html = renderToStaticMarkup(createElement(TeamsPreview));
      expect(html).toContain("Access required");
      expect(html).not.toContain('class="document-library');
      expect(html).not.toContain("Manage teams");
      expect(html).not.toContain("Landing page copy.docx");
    }
  });
  it("does not expose unrelated departments, projects or private response content through direct URLs", () => {
    at("/teams?staff=maya&department=fcs&tab=Shared");
    expect(renderToStaticMarkup(createElement(TeamsPreview))).toContain(
      "Access required",
    );
    // Even organisation-wide SharePoint coordination does not join an unrelated Teams department.
    at("/teams?staff=jamie&department=mcg&tab=Shared");
    const department = renderToStaticMarkup(
      createElement(DepartmentChannel, {
        department: departments[0],
        person: staff.find((person) => person.id === "jamie")!,
        tab: "Shared",
        onTabChange: () => {},
      }),
    );
    expect(department).toContain("Access required");
    at("/projects/PRJ-2026-027/teams?staff=maya&tab=Shared");
    expect(renderToStaticMarkup(createElement(ProjectsApp))).toContain(
      "Access required",
    );
    at("/emergency-response/incidents/INC-104?staff=maya");
    const emergency = renderToStaticMarkup(createElement(EmergencyApp));
    expect(emergency).toContain("Access required");
    expect(emergency).not.toContain("Critical Service Disruption");
    expect(emergency).not.toContain("Initial Situation Brief.docx");
  });
  it("falls back stale Morgan URLs to ordinary Taylor even if the stored persona has broader access", () => {
    at(
      "/teams?staff=morgan&workspace=digital&channel=Security+Engineering&tab=Shared",
      "devon",
    );
    const generic = renderToStaticMarkup(createElement(TeamsPreview));
    expect(generic).toContain("Signed in as Taylor Brooks");
    expect(generic).toContain("Access required");
    expect(generic).not.toContain("Manage teams");
    at("/projects/PRJ-2026-014/teams?staff=morgan&tab=Shared", "devon");
    const project = renderToStaticMarkup(createElement(ProjectsApp));
    expect(project).toContain("Signed in as Taylor Brooks");
    expect(project).toContain("Access required");
    at("/emergency-response/incidents/INC-104?staff=morgan", "harper");
    const emergency = renderToStaticMarkup(createElement(EmergencyApp));
    expect(emergency).toContain("Signed in as Taylor Brooks");
    expect(emergency).toContain("Access required");
    expect(emergency).not.toContain("Critical Service Disruption");
  });
  it("keeps each SharePoint Home Teams panel scoped to its linked staff member", () => {
    for (const person of staff) {
      at(`/logistics?staff=${person.id}`, person.id);
      const logistics = panelLinks(
        renderToStaticMarkup(createElement(LogisticsApp)),
      );
      expect(logistics.length > 0).toBe(person.id === "maya");
      for (const link of logistics) {
        expect(link.searchParams.get("staff")).toBe(person.id);
        expect(
          canSeeLogisticsChannel(
            person,
            channels.find(
              (channel) => channel.id === link.searchParams.get("channel"),
            )!,
          ),
        ).toBe(true);
      }
      at(`/content-delivery?staff=${person.id}`, person.id);
      const studio = panelLinks(
        renderToStaticMarkup(createElement(ContentApp)),
      );
      if (!visibleContentChannels(person.id).length)
        expect(studio).toHaveLength(0);
      for (const link of studio) {
        const linkedPerson = staff.find(
          (member) => member.id === link.searchParams.get("staff"),
        )!;
        expect(linkedPerson.id).toBe(person.id);
        if (visibleContentChannels(person.id).length)
          expect(
            canSeeContentChannel(
              linkedPerson.id,
              link.searchParams.get("channel") || "General",
            ),
          ).toBe(true);
      }
    }
    at("/digital-tech?staff=devon", "devon");
    const engineering = panelLinks(
      renderToStaticMarkup(createElement(FunctionalApp)),
    );
    expect(engineering.length).toBeGreaterThan(0);
    for (const link of engineering)
      expect(
        canSeeWorkspaceChannel(
          staff.find((person) => person.id === "devon")!,
          "digital",
          link.searchParams.get("channel") || "General",
        ),
      ).toBe(true);
    at("/digital-tech?staff=sam", "devon");
    const unrelated = panelLinks(
      renderToStaticMarkup(createElement(FunctionalApp)),
    );
    expect(unrelated).toHaveLength(0);
    for (const person of staff) {
      for (const [path, workspace] of [
        ["/digital-tech", "digital"],
        ["/workspace-publishing", "publishing"],
      ]) {
        at(`${path}?staff=${person.id}`, person.id);
        const links = panelLinks(
          renderToStaticMarkup(createElement(FunctionalApp)),
        );
        expect(links.length > 0).toBe(person.id === "devon");
        for (const link of links) {
          expect(link.searchParams.get("staff")).toBe(person.id);
          expect(
            canSeeWorkspaceChannel(
              person,
              workspace,
              link.searchParams.get("channel") || "General",
            ),
          ).toBe(true);
        }
      }
      at(`/planning?staff=${person.id}`, person.id);
      const planning = renderToStaticMarkup(createElement(PlanningApp));
      expect(planning.includes('class="teams-button"')).toBe(
        person.id === "robin",
      );
    }
  });
});
