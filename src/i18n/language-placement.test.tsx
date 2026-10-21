import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import PrototypeNavigator from "../components/PrototypeNavigator";
import Launcher from "../intranet/Launcher";
import Directory from "../intranet/Directory";
import PlanningApp from "../App";
import WorkspaceDenied from "../access/WorkspaceDenied";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import TeamsShell from "../teams/TeamsShell";
import WikiApp from "../wiki/WikiApp";
import AccessRequest from "../service-desk/AccessRequest";
import ExternalEnvironmentPreview from "../environments/ExternalEnvironmentPreview";
import ContentApp from "../content/ContentApp";

afterEach(() => vi.unstubAllGlobals());

function render(element: ReactElement, path: string) {
  vi.stubGlobal("location", new URL(path, "https://example.test"));
  vi.stubGlobal("sessionStorage", { getItem: () => null });
  return renderToStaticMarkup(element);
}
function expectOneLanguageToggle(html: string) {
  expect(html.match(/class="language-toggle"/g) ?? []).toHaveLength(1);
  expect(html).toContain('role="group" aria-label="Language"');
  expect(html).toContain('aria-label="English"');
  expect(html).toContain('aria-label="Deutsch"');
  expect(html).toContain(">ENG</button>");
  expect(html).toContain(">DE</button>");
}
function productHeader(html: string, className: string) {
  const tagName = className === "directory-language-row" ? "div" : "header";
  return (
    html.match(
      new RegExp(
        `<${tagName}\\b[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/${tagName}>`,
      ),
    )?.[0] || ""
  );
}
const noAction = () => {};

describe("language controls belong to the current product", () => {
  it("retains the accessible standalone Welcome language switch", () => {
    const html = render(createElement(Launcher), "/");
    expectOneLanguageToggle(html);
    expect(html).toContain('class="launcher-language"');
  });

  it("does not hide language selection inside the proof-of-concept navigation", () => {
    const html = render(
      createElement(PrototypeNavigator),
      "/architecture?staff=maya",
    );
    expect(html).not.toContain("language-toggle");
    expect(html).not.toContain('aria-label="Language"');
    expect(html).not.toContain('aria-label="English"');
    expect(html).not.toContain('aria-label="Deutsch"');
    expect(html).not.toContain('id="preview-role"');
    expect(html).not.toContain('aria-label="Preview role"');
    expect(html).toContain("Workspace FAQ");
  });

  it.each([
    {
      name: "Architecture",
      path: "/architecture?staff=maya",
      header: "directory-language-row",
      element: () => createElement(Directory),
    },
    {
      name: "Planning SharePoint",
      path: "/planning?staff=taylor",
      header: "m365-header",
      element: () => createElement(PlanningApp),
    },
    {
      name: "shared SharePoint workspace shell",
      path: "/logistics?staff=maya",
      header: "m365-header",
      element: () =>
        createElement(WorkspaceHeader, {
          onOpen: noAction,
          onMessage: noAction,
        }),
    },
    {
      name: "restricted workspace entry",
      path: "/audience-innovation?staff=maya",
      header: "m365-header",
      element: () =>
        createElement(WorkspaceDenied, { workspaceId: "audience" }),
    },
    {
      name: "Teams",
      path: "/teams?staff=maya",
      header: "m365-teams-topbar",
      element: () =>
        createElement(TeamsShell, {
          userName: "Maya Chen",
          teamName: "Company Updates",
          channelName: "General",
          groups: [
            {
              id: "company",
              label: "Company Updates",
              kind: "company",
              channels: [
                { id: "general", label: "General", onSelect: noAction },
              ],
            },
          ],
          selectedChannelId: "general",
          activeTab: "Posts",
          onTabChange: noAction,
          children: createElement("p", null, "Conversation"),
        }),
    },
    {
      name: "Wiki",
      path: "/sales-marketing/wiki?staff=nadia",
      header: "wiki-header",
      element: () => createElement(WikiApp),
    },
    {
      name: "Service Desk",
      path: "/service-desk/it-support?staff=devon",
      header: "service-desk-header",
      element: () => createElement(AccessRequest),
    },
    {
      name: "scoped partner production",
      path: "/content-delivery/packages/PKG-103/shared?staff=nadia",
      header: "content-scoped-header",
      element: () => createElement(ContentApp),
    },
  ])(
    "exposes one language switch in the $name header",
    ({ path, header, element }) => {
      const html = render(element(), path);
      expectOneLanguageToggle(html);
      expectOneLanguageToggle(productHeader(html, header));
    },
  );

  it("retains a visible standalone switch on external environments without adding product navigation", () => {
    const html = render(
      createElement(ExternalEnvironmentPreview, {
        environmentId: "media-library",
      }),
      "/external/media-library?staff=nadia",
    );
    expectOneLanguageToggle(html);
    expect(html).toMatch(/class="[^"]*\bexternal-preview-language\b[^"]*"/);
    expect(
      html.search(/class="[^"]*\bexternal-preview-language\b[^"]*"/),
    ).toBeLessThan(html.indexOf('class="external-backdrop"'));
    expect(html).not.toMatch(/<nav|prototype-navigator/);
  });
});
