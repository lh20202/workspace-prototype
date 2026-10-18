import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PlanningApp from "../App";
import ContentApp from "../content/ContentApp";
import FunctionalApp from "../workspaces/FunctionalApp";
import LogisticsApp from "../logistics/LogisticsApp";
import { previewRoles } from "../access/policy";
import {
  contentHomeChannelGroups,
  resolveContentChannel,
} from "../content/channels";
import { workspaceChannels } from "../teams/visibility";
import { channels as logisticsChannels } from "../logistics/data";

const cases: {
  id: string;
  path: string;
  App: ComponentType;
  heading: string;
}[] = [
  {
    id: "planning",
    path: "/planning",
    App: PlanningApp,
    heading: "Planning &amp; Reporting",
  },
  {
    id: "content",
    path: "/content-delivery",
    App: ContentApp,
    heading: "Live studio coordination",
  },
  {
    id: "digital",
    path: "/digital-tech",
    App: FunctionalApp,
    heading: "Technical coordination",
  },
  {
    id: "logistics",
    path: "/logistics",
    App: LogisticsApp,
    heading: "Operational coordination",
  },
];
function home(Component: ComponentType, path: string, person: string) {
  vi.stubGlobal(
    "location",
    new URL(`${path}?staff=${person}`, "https://example.test"),
  );
  vi.stubGlobal("sessionStorage", { getItem: () => "taylor" });
  const html = renderToStaticMarkup(createElement(Component));
  const panel =
    html.match(/<section class="teams-home-panel"[\s\S]*?<\/section>/)?.[0] ||
    "";
  return { html, panel };
}
afterEach(() => vi.unstubAllGlobals());

describe("canonical workspace channel capability across preview roles", () => {
  for (const workspace of cases) {
    it(`keeps ${workspace.id} Home complete and its contextual channel panel identical across all roles`, () => {
      const samples = previewRoles.map((person) => {
        const { html, panel } = home(workspace.App, workspace.path, person.id);
        expect(html).not.toContain('class="access-boundary');
        expect(html).toContain('aria-label="Open channels"');
        expect(panel).toContain(workspace.heading);
        expect(panel).toContain(`data-workspace="${workspace.id}"`);
        const destinations = [...panel.matchAll(/href="([^"]+)"/g)].map(
          (match) =>
            new URL(match[1].replaceAll("&amp;", "&"), "https://example.test"),
        );
        expect(destinations.length).toBeGreaterThan(1);
        for (const destination of destinations) {
          expect(destination.searchParams.get("staff")).toBe(person.id);
          expect(destination.searchParams.get("context")).toBe(
            `workspace:${workspace.id}`,
          );
          const channel = destination.searchParams.get("channel")!;
          if (workspace.id === "content")
            expect(resolveContentChannel(channel)).toBeTruthy();
          else if (workspace.id === "logistics")
            expect(
              logisticsChannels.some(
                (item) => item.team === "logistics" && item.id === channel,
              ),
            ).toBe(true);
          else expect(workspaceChannels[workspace.id]).toContain(channel);
        }
        if (workspace.id === "content") {
          for (const feature of [
            "Active production",
            "Recent production files",
            "Production Calendar",
            "Channel desks",
            "Topic specialists",
            "Current coverage",
            "Open all studio channels",
          ])
            expect(html).toContain(feature);
          for (const channel of contentHomeChannelGroups().flatMap(
            (group) => group.channels,
          ))
            expect(panel).toContain(`data-channel="${channel.id}"`);
          expect(panel).not.toContain("community-week");
        }
        if (workspace.id === "digital") {
          expect(panel).toContain("Security Engineering");
          expect(panel).toContain("Private channel");
        }
        return panel.replaceAll(/staff=[^&"]+/g, "staff=selected");
      });
      expect(new Set(samples).size).toBe(1);
    });
  }
});
