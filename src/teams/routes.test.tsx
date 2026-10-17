import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { staff } from "../intranet/catalog";
import TeamsView from "../logistics/TeamsView";
import LogisticsApp from "../logistics/LogisticsApp";
import TeamsPreview from "../intranet/TeamsPreview";
import ContentApp from "../content/ContentApp";
import FunctionalApp from "../workspaces/FunctionalApp";
import ProjectsApp from "../projects/ProjectsApp";
import EmergencyApp from "../executive/EmergencyApp";
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
      for (const tab of ["Posts", "Shared"]) {
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
    at("/teams?staff=sam&department=mcg&tab=Shared");
    const department = renderToStaticMarkup(
      createElement(DepartmentChannel, {
        department: departments[0],
        person: staff.find((person) => person.id === "sam")!,
        tab: "Shared",
        onTabChange: () => {},
      }),
    );
    expect(department).toContain("Access required");
    at("/projects/PRJ-2026-014/teams?staff=maya&tab=Shared");
    expect(renderToStaticMarkup(createElement(ProjectsApp))).toContain(
      "Access required",
    );
    at("/emergency-response/incidents/INC-104?staff=maya");
    const emergency = renderToStaticMarkup(createElement(EmergencyApp));
    expect(emergency).toContain("Access required");
    expect(emergency).not.toContain("Critical Service Disruption");
    expect(emergency).not.toContain("Initial Situation Brief.docx");
  });
  it("falls back stale Morgan URLs to Maya even if the stored persona has broader access", () => {
    at(
      "/teams?staff=morgan&workspace=digital&channel=Security+Engineering&tab=Shared",
      "devon",
    );
    const generic = renderToStaticMarkup(createElement(TeamsPreview));
    expect(generic).toContain("Signed in as Maya Chen");
    expect(generic).toContain("Access required");
    expect(generic).not.toContain("Manage teams");
    at("/projects/PRJ-2026-014/teams?staff=morgan&tab=Shared", "devon");
    const project = renderToStaticMarkup(createElement(ProjectsApp));
    expect(project).toContain("Signed in as Maya Chen");
    expect(project).toContain("Access required");
    at("/emergency-response/incidents/INC-104?staff=morgan", "harper");
    const emergency = renderToStaticMarkup(createElement(EmergencyApp));
    expect(emergency).toContain("Signed in as Maya Chen");
    expect(emergency).toContain("Access required");
    expect(emergency).not.toContain("Critical Service Disruption");
  });
  it("keeps each SharePoint Home Teams panel scoped to its linked staff member", () => {
    for (const person of staff) {
      at(`/logistics?staff=${person.id}`, person.id);
      const logistics = panelLinks(
        renderToStaticMarkup(createElement(LogisticsApp)),
      );
      expect(logistics.length).toBeGreaterThan(0);
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
        expect(studio).toHaveLength(1);
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
    expect(unrelated).toHaveLength(1);
    expect(unrelated[0].searchParams.get("staff")).toBe("sam");
  });
});
