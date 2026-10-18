import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { staff } from "../intranet/catalog";
import { documents, departmentSubmissionsFolder } from "../data/workspace";
import { canAccessArea } from "../access/policy";
import { teamsGroups, teamsPreviewHrefForStaff } from "../teams/navigation";
import { canSeeWorkspaceChannel } from "../teams/visibility";
import { sharepointDestination } from "../teams/sharepointDestination";
import PlanningApp from "../App";
import TeamsPreview from "../intranet/TeamsPreview";
import PlanningConversation from "./PlanningConversation";
import {
  LogframeFields,
  logframeOutcomes,
  PlanningRegistrationForm,
} from "./PlanningWorkingViews";
import {
  planningPosts,
  planningChannelFiles,
  planningReportingChannel,
  planningTeamsHref,
  departmentSubmissionsHref,
  logframeDocument,
  logframeHref,
  awayDayRegistrationHref,
} from "./teams";

const at = (path: string) => {
  vi.stubGlobal("location", new URL(path, "https://example.test"));
  vi.stubGlobal("sessionStorage", { getItem: () => "taylor" });
};
afterEach(() => vi.unstubAllGlobals());

describe("Planning & Reporting uses the existing Planning Team and working files", () => {
  it("curates the durable channel for executive and finance roles without broadening protected access", () => {
    for (const person of staff) {
      const expected = ["robin", "sam"].includes(person.id);
      expect(
        canSeeWorkspaceChannel(person, "planning", planningReportingChannel),
      ).toBe(true);
      const planning = teamsGroups(person).find(
        (group) => group.id === "planning",
      );
      expect(
        !!planning?.channels.some(
          (channel) => channel.label === planningReportingChannel,
        ),
      ).toBe(expected);
      if (expected) {
        expect(planning?.kind).toBe("workspace");
        expect(planning?.label).toBe("Planning Cycle");
      }
    }
    expect(canAccessArea("sam", "planning", "restricted")).toBe(false);
    expect(canAccessArea("robin", "planning", "restricted")).toBe(true);
    for (const id of ["maya", "devon", "leonie", "elliot"])
      expect(
        teamsPreviewHrefForStaff(
          staff.find((person) => person.id === id)!,
          "/teams",
          new URL(planningTeamsHref("robin"), "https://example.test").search,
        ),
      ).toContain("workspace=planning");
  });
  it("shows the canonical Home panel and same-person context link under every role", () => {
    for (const person of staff) {
      at(`/planning?staff=${person.id}`);
      const html = renderToStaticMarkup(createElement(PlanningApp));
      const panel =
        html.match(
          /<section class="teams-home-panel"[\s\S]*?<\/section>/,
        )?.[0] || "";
      expect(!!panel).toBe(true);
      if (panel) {
        expect(panel).toContain("Planning &amp; Reporting");
        expect(panel).toContain("Open channel");
        expect(panel).toContain("teams-logo.svg");
        expect(panel).toContain(
          planningTeamsHref(person.id).replaceAll("&", "&amp;"),
        );
      }
    }
  });
  it("links to the existing submission folders, canonical Logframe, reporting file and working registration form", () => {
    const folder = new URL(departmentSubmissionsHref, "https://example.test");
    expect(folder.pathname).toBe("/planning/cycles");
    expect(folder.searchParams.get("folder")).toBe(departmentSubmissionsFolder);
    expect(
      documents.filter((file) =>
        file.folderPath.startsWith(departmentSubmissionsFolder),
      ),
    ).toHaveLength(6);
    const logframe = new URL(logframeHref, "https://example.test");
    expect(logframe.searchParams.get("document")).toBe(logframeDocument.id);
    expect(logframe.searchParams.get("folder")).toBe(
      logframeDocument.folderPath,
    );
    expect(logframe.searchParams.get("mode")).toBe("guided");
    expect(logframe.pathname).toBe("/planning/cycles");
    expect(awayDayRegistrationHref).toBe("/planning?event=strategy-away-day");
    for (const post of planningPosts) {
      if (!post.link?.documentId) continue;
      const source = documents.find(
        (file) => file.id === post.link!.documentId,
      )!;
      expect(source.library).not.toBe("restricted");
      expect(
        new URL(post.link.href, "https://example.test").searchParams.get(
          "document",
        ),
      ).toBe(source.id);
    }
  });
  it("keeps Shared references canonical, including their labels, and excludes protected files even for executives", () => {
    expect(new Set(planningChannelFiles.map((file) => file.id)).size).toBe(
      planningChannelFiles.length,
    );
    for (const file of planningChannelFiles) {
      expect(file).toBe(documents.find((source) => source.id === file.id));
      expect(file.library).not.toBe("restricted");
    }
    expect(planningChannelFiles.map((file) => file.id)).toEqual(
      expect.arrayContaining(["planning-0", "planning-11", "reporting-8"]),
    );
    for (const id of ["robin", "sam"]) {
      at(
        `${planningTeamsHref(id, "Shared")}&library=Documents&folder=${encodeURIComponent(logframeDocument.folderPath)}`,
      );
      const html = renderToStaticMarkup(createElement(TeamsPreview));
      expect(html).toContain("Department submissions");
      expect(html).toContain("Organisation-wide Logframe 2027.xlsx");
      expect(html).toContain("Sensitivity: Internal");
      for (const restricted of documents.filter(
        (file) => file.library === "restricted",
      ))
        expect(html).not.toContain(restricted.name);
    }
    expect(sharepointDestination("planning")).toBe("/planning");
    expect(
      sharepointDestination(
        "planning",
        documents.find((file) => file.library === "restricted")!.id,
      ),
    ).toBe("/planning");
  });
  it("renders five natural threads, canonical links and reaction people while retaining the current colleague", () => {
    at(planningTeamsHref("sam"));
    const html = renderToStaticMarkup(
      createElement(PlanningConversation, {
        userName: "Sam Patel",
        userRole: "Finance Operations Specialist",
      }),
    );
    expect(planningPosts).toHaveLength(5);
    expect(new Set(planningPosts.map((post) => post.author.name)).size).toBe(4);
    expect(html.match(/class="m365-teams-post"/g)).toHaveLength(5);
    expect(html).toContain("Financial Planning Partner");
    expect(html).toContain("Planning Coordinator");
    expect(html).toContain("CEO Support Officer");
    expect(html).toContain("Network Coordinator");
    expect(html).toContain("rather than adding anything personal here");
    expect(html).toContain('title="Robin Avery, Sam Patel"');
    for (const match of html.matchAll(/href="([^"]+)"/g))
      expect(
        new URL(
          match[1].replaceAll("&amp;", "&"),
          "https://example.test",
        ).searchParams.get("staff"),
      ).toBe("sam");
  });
  it("opens ordinary reporting channel examples for unrelated roles without exposing protected Planning", () => {
    for (const person of staff.filter(
      (person) => !["robin", "sam"].includes(person.id),
    )) {
      at(planningTeamsHref(person.id));
      const html = renderToStaticMarkup(createElement(TeamsPreview));
      expect(html).not.toContain("Access required");
      expect(html).toContain("planning-budget-submissions");
      expect(html).toContain("Financial Planning Partner");
      expect(canAccessArea(person, "planning", "restricted")).toBe(false);
    }
  });
  it("reviews the same Logframe one outcome at a time and identifies missing targets", () => {
    const ready = renderToStaticMarkup(
      createElement(LogframeFields, {
        outcome: logframeOutcomes[0],
        onTargetChange: () => {},
      }),
    );
    const incomplete = renderToStaticMarkup(
      createElement(LogframeFields, {
        outcome: logframeOutcomes[2],
        onTargetChange: () => {},
      }),
    );
    expect(ready).toContain("90%");
    expect(ready).not.toContain("Add a target before");
    expect(incomplete).toContain('aria-invalid="true"');
    expect(incomplete).toContain(
      "Add a target before submitting this outcome.",
    );
    expect(incomplete).not.toContain(logframeOutcomes[0].outcome);
    const form = renderToStaticMarkup(
      createElement(PlanningRegistrationForm, { userName: "Sam Patel" }),
    );
    expect(form).toContain("Dietary requirements");
    expect(form).toContain("Accessibility requirements");
    expect(form).not.toContain("action=");
    expect(form).toContain("nothing is sent or stored");
  });
});
