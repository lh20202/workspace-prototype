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
import { departments } from "../coordination/data";
import { channels, posts } from "../logistics/data";
import { contentChannels } from "../content/channels";
import { PreviewRoleProvider } from "../components/PreviewRoleContext";

function at(path: string, stored = "taylor") {
  vi.stubGlobal("location", new URL(path, "https://example.test"));
  vi.stubGlobal("sessionStorage", { getItem: () => stored });
}
function logisticsChannel(path: string) {
  at(path);
  const params = new URL(path, "https://example.test").searchParams;
  return renderToStaticMarkup(
    createElement(PreviewRoleProvider, {
      children: createElement(TeamsView, {
        channelId: params.get("channel") || "general",
        activeTab: params.get("tab") || "Posts",
        onNavigate: () => {},
        onOpenFile: () => {},
        onWorkspace: () => {},
        onMessage: () => {},
      }),
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

describe("ordinary contextual channel previews and real private boundaries", () => {
  it("renders every ordinary operational channel for every role without expanding the sidebar", () => {
    for (const person of staff)
      for (const channel of channels.filter(
        (item) => item.team === "logistics",
      )) {
        for (const tab of ["Posts", "Shared", "Notes", "Planner"]) {
          const html = logisticsChannel(
            `/logistics/teams?staff=${person.id}&channel=${channel.id}&tab=${tab}&context=workspace:logistics`,
          );
          expect(html.includes("Access required")).toBe(false);
          expect(html).toContain('data-team-id="logistics"');
          expect(html).not.toContain('data-team-id="digital"');
          expect(html).not.toContain('data-team-kind="department"');
          if (tab === "Posts")
            for (const post of posts.filter(
              (item) => item.channel === channel.id,
            ))
              expect(
                html.includes(
                  post.text
                    .replaceAll("&", "&amp;")
                    .replaceAll("'", "&#x27;")
                    .replaceAll('"', "&quot;"),
                ),
              ).toBe(true);
        }
      }
  });
  it("keeps General Staff global company navigation separate and shows the prominent role helper", () => {
    const html = logisticsChannel(
      "/logistics/teams?staff=taylor&channel=important&context=global",
    );
    expect(html).toContain('data-team-id="company"');
    expect(html).not.toContain('data-team-id="logistics"');
    expect(html).not.toContain('data-team-kind="department"');
    expect(html).toContain("See a role based channel view");
    expect(html).toContain("Choose a preview role");
    expect(html).toContain('aria-controls="preview-role"');
    expect(html).toContain('class="preview-role-prompt access-preview-role"');
  });
  it("allows normal Logistics file deep links while rejecting files outside the chosen channel", () => {
    for (const person of staff)
      for (const parameter of ["document", "file"]) {
        at(
          `/logistics/teams?staff=${person.id}&channel=central-city&tab=Shared&${parameter}=central-deployment`,
        );
        expect(documentFromLocation()?.id).toBe("central-deployment");
        expect(
          renderToStaticMarkup(createElement(LogisticsApp)).includes(
            "Access required",
          ),
        ).toBe(false);
        at(
          `/logistics/teams?staff=${person.id}&channel=pets&${parameter}=central-deployment`,
        );
        expect(documentFromLocation()).toBeNull();
      }
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
  it("opens unpinned ordinary Studio desks and technical channels for all roles", () => {
    for (const person of staff) {
      for (const channel of contentChannels) {
        at(
          `/teams?${new URLSearchParams({ staff: person.id, workspace: "content", channel: channel.name, tab: "Posts" })}`,
        );
        const html = renderToStaticMarkup(createElement(TeamsPreview));
        expect(html.includes("Access required")).toBe(false);
        expect(html).toContain('data-team-id="content"');
        expect(html).not.toContain('data-team-kind="department"');
      }
      for (const channel of [
        "Engineering",
        "AI Lab",
        "Workspace & Wiki Moderators",
      ]) {
        at(
          `/teams?${new URLSearchParams({ staff: person.id, workspace: "digital", channel, tab: "Posts" })}`,
        );
        expect(
          renderToStaticMarkup(createElement(TeamsPreview)).includes(
            "Access required",
          ),
        ).toBe(false);
      }
    }
  });
  it("continues blocking private security posts and shared files for unentitled roles", () => {
    for (const person of staff.filter((member) => member.id !== "devon"))
      for (const tab of ["Posts", "Shared"]) {
        at(
          `/teams?${new URLSearchParams({ staff: person.id, workspace: "digital", channel: "Security Engineering", tab, file: "digital-F17" })}`,
        );
        const html = renderToStaticMarkup(createElement(TeamsPreview));
        expect(html).toContain("Access required");
        expect(html).not.toContain('class="technical-conversation');
        expect(html).not.toContain('class="sp-library-table"');
        expect(html).not.toContain("Provisioning Script Review.docx");
      }
  });
  it("opens ordinary Department General context without leaking unrelated groups", () => {
    for (const person of staff)
      for (const department of departments) {
        at(`/teams?staff=${person.id}&department=${department.id}&tab=Posts`);
        const html = renderToStaticMarkup(createElement(TeamsPreview));
        expect(html.includes("Access required")).toBe(false);
        expect(html).toContain(`data-team-id="${department.id}"`);
        for (const other of departments.filter(
          (item) => item.id !== department.id,
        ))
          expect(html).not.toContain(`data-team-id="${other.id}"`);
      }
  });
  it("gives explicit entry scope precedence over stale environment query fields", () => {
    at(
      "/teams?staff=nadia&context=department:communications&workspace=content&channel=Special+Coverage+%C2%B7+City+Innovation+Summit",
    );
    const department = renderToStaticMarkup(createElement(TeamsPreview));
    expect(department).toContain("<h1>General</h1>");
    expect(department).toContain('data-team-id="communications"');
    expect(department).not.toContain('data-team-id="content"');
    expect(department).not.toContain("Temporary coverage</small>");
    at(
      "/teams?staff=taylor&context=workspace:content&workspace=digital&department=communications&channel=Editorial+Desk",
    );
    const studio = renderToStaticMarkup(createElement(TeamsPreview));
    expect(studio).toContain("<h1>Editorial Desk</h1>");
    expect(studio).toContain('data-team-id="content"');
    expect(studio).not.toContain('data-team-id="communications"');
    expect(studio).not.toContain('data-team-id="digital"');
  });
  it("keeps restricted projects and incident content behind actual entitlement", () => {
    at("/projects/PRJ-2026-027/teams?staff=maya&tab=Shared");
    expect(renderToStaticMarkup(createElement(ProjectsApp))).toContain(
      "Access required",
    );
    for (const id of ["maya", "taylor", "morgan"]) {
      at(`/emergency-response/incidents/INC-104?staff=${id}`);
      const html = renderToStaticMarkup(createElement(EmergencyApp));
      expect(html).toContain("Access required");
      expect(html).not.toContain("Critical Service Disruption");
      expect(html).not.toContain("Initial Situation Brief.docx");
    }
  });
  it("rejects an unknown project channel instead of opening General posts or shared documents", () => {
    for (const tab of ["Posts", "Shared"])
      for (const channel of ["unknown-channel", ""]) {
        at(
          `/projects/PRJ-2026-014/teams?staff=taylor&channel=${channel}&tab=${tab}&file=PRJ-2026-014-F1`,
        );
        const html = renderToStaticMarkup(createElement(ProjectsApp));
        expect(html).toContain("This location is unavailable");
        expect(html).not.toContain(
          "Can we settle the acceptance-test dates tomorrow?",
        );
        expect(html).not.toContain('class="sp-library-table"');
        expect(html).not.toContain('class="teams-project-attachment"');
      }
    at("/projects/PRJ-2026-014/teams?staff=taylor");
    expect(renderToStaticMarkup(createElement(ProjectsApp))).toContain(
      "Can we settle the acceptance-test dates tomorrow?",
    );
  });
  it("keeps archived project conversations in the same focused read-only project context", () => {
    at("/projects/archive/PRJ-2024-018/teams?staff=taylor&channel=General");
    const html = renderToStaticMarkup(createElement(ProjectsApp));
    expect(html).toContain('data-team-id="PRJ-2024-018"');
    expect(html).not.toContain('data-team-kind="department"');
    expect(html).not.toContain('data-team-id="PRJ-2026-014"');
    expect(html).toContain("This project is archived.");
    expect(html).not.toContain('aria-label="Start a post"');
  });
  it("falls stale identities back to ordinary staff without retaining stored technical privilege", () => {
    at(
      "/teams?staff=morgan&workspace=digital&channel=Security+Engineering&tab=Shared",
      "devon",
    );
    const html = renderToStaticMarkup(createElement(TeamsPreview));
    expect(html).toContain("Signed in as Taylor Brooks");
    expect(html).toContain("Access required");
  });
  it("keeps all four workspace Home channel integrations present under every role", () => {
    for (const person of staff)
      for (const [path, Component, workspace] of [
        ["/logistics", LogisticsApp, "logistics"],
        ["/content-delivery", ContentApp, "content"],
        ["/digital-tech", FunctionalApp, "digital"],
        ["/planning", PlanningApp, "planning"],
      ] as const) {
        at(`${path}?staff=${person.id}`, person.id);
        const html = renderToStaticMarkup(createElement(Component));
        const links = panelLinks(html);
        expect(links.length).toBeGreaterThan(0);
        for (const link of links) {
          expect(link.searchParams.get("staff")).toBe(person.id);
          expect(link.searchParams.get("context")).toBe(
            `workspace:${workspace}`,
          );
        }
      }
  });
});
