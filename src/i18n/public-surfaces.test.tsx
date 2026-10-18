import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import Launcher from "../intranet/Launcher";
import Directory from "../intranet/Directory";
import TeamsPreview from "../intranet/TeamsPreview";
import PlanningApp from "../App";
import FunctionalApp from "../workspaces/FunctionalApp";
import ContentApp from "../content/ContentApp";
import TeamsShell from "../teams/TeamsShell";
import WikiApp from "../wiki/WikiApp";
import { wikiArticles, wikiArticleHref } from "../wiki/content";
import AccessBoundary from "../access/AccessBoundary";
import SiteSettingsButton, {
  siteAdministrationOptions,
} from "../components/SiteSettingsButton";
import { WorkspaceFAQContent } from "../components/WorkspaceFAQ";
import {
  creationExplanation,
  workspaceFAQExampleHref,
} from "../components/workspaceFAQContent";
import { displayText } from "./displayText";
import type { Language } from "./translate";

afterEach(() => vi.unstubAllGlobals());

const noAction = () => {};
// Lowercase “teams” can still describe people rather than the channel product.
const vendorNames = /\b(?:Microsoft|SharePoint|M365)\b/i;
function expectGenericCopy(copy: string, context?: string) {
  expect(copy, context).not.toMatch(vendorNames);
  expect(copy, context).not.toMatch(/\bTeams\b/);
}
const workplaceArticle = wikiArticles.find((article) =>
  article.sections.some((section) =>
    section.points.some((point) => /Teams|SharePoint/.test(point)),
  ),
)!;

function render(element: ReactElement, path: string) {
  const location = new URL(path, "https://example.test");
  vi.stubGlobal("location", location);
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) =>
      key === "workspace-preview-staff"
        ? location.searchParams.get("staff") || "taylor"
        : null,
  });
  return renderToStaticMarkup(element);
}

function decodeEntities(value: string) {
  return value.replace(
    /&(?:amp|lt|gt|quot|apos|#x[\da-f]+|#\d+);/gi,
    (entity) => {
      const named: Record<string, string> = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&apos;": "'",
      };
      if (named[entity]) return named[entity];
      return String.fromCodePoint(
        entity.startsWith("&#x")
          ? Number.parseInt(entity.slice(3, -1), 16)
          : Number.parseInt(entity.slice(2, -1), 10),
      );
    },
  );
}

/** Mirror the display bridge on exposed text only; asset URLs and IDs stay raw. */
function exposedCopy(html: string, language: Language) {
  const content = html.replace(
    /<(?:style|script)\b[^>]*>[\s\S]*?<\/(?:style|script)>/gi,
    "",
  );
  const fields = [
    ...Array.from(content.matchAll(/>([^<]+)</g), (match) => match[1]),
    ...Array.from(
      content.matchAll(
        /(?:aria-label|aria-description|alt|title|placeholder)="([^"]*)"/g,
      ),
      (match) => match[1],
    ),
  ];
  return fields
    .map((field) => displayText(decodeEntities(field), language))
    .join(" ");
}

const surfaces = [
  {
    name: "Welcome",
    path: "/",
    element: () => createElement(Launcher),
  },
  {
    name: "Architecture and Jump to rail",
    path: "/architecture?staff=taylor",
    element: () => createElement(Directory),
  },
  {
    name: "Department channel conversation",
    path: "/teams?staff=taylor&department=mcg&channel=General&tab=Posts",
    element: () => createElement(TeamsPreview),
  },
  {
    name: "technical channel with its canonical platform name",
    path: workspaceFAQExampleHref,
    element: () => createElement(TeamsPreview),
  },
  {
    name: "Planning Home",
    path: "/planning?staff=sam",
    element: () => createElement(PlanningApp),
  },
  {
    name: "Tech Home",
    path: "/digital-tech?staff=devon",
    element: () => createElement(FunctionalApp),
  },
  {
    name: "Studio Home",
    path: "/content-delivery?staff=nadia",
    element: () => createElement(ContentApp),
  },
  {
    name: "channel shell",
    path: "/teams?staff=taylor",
    element: () =>
      createElement(TeamsShell, {
        userName: "Taylor Brooks",
        teamName: "Company Updates",
        channelName: "General",
        groups: [],
        selectedChannelId: "General",
        activeTab: "Posts",
        onTabChange: noAction,
        onOpenSharePoint: noAction,
        children: "Current channel conversation",
      }),
  },
  {
    name: "Wiki workplace guidance",
    path: `${wikiArticleHref(workplaceArticle)}?staff=nadia`,
    element: () => createElement(WikiApp),
  },
  {
    name: "restricted workspace access and focal-point guidance",
    path: "/audience-insight?staff=maya",
    element: () =>
      createElement(AccessBoundary, {
        workspaceId: "audience",
        personId: "maya",
        area: "Audience Research & Marketing Insight",
      }),
  },
  {
    name: "Workspace FAQ questions",
    path: "/?staff=taylor",
    element: () => createElement(WorkspaceFAQContent),
  },
  {
    name: "Site Administrator settings trigger",
    path: "/digital-tech?staff=elliot",
    element: () => createElement(SiteSettingsButton, { onMessage: noAction }),
  },
];

describe("public rendered surfaces use generic workplace terminology", () => {
  it.each(surfaces)("audits $name in English and German", (surface) => {
    const html = render(surface.element(), surface.path);
    for (const language of ["en", "de"] as const) {
      const copy = exposedCopy(html, language);
      expect(copy.trim()).not.toBe("");
      expectGenericCopy(copy, `${surface.name} (${language})`);
    }
  });

  it("uses neutral site and channel marks while preserving collaboration URLs", () => {
    const welcome = render(createElement(Launcher), "/?staff=devon");
    expect(welcome).toContain('src="/images/site-mark.svg"');
    const shell = render(
      createElement(TeamsShell, {
        userName: "Devon Park",
        teamName: "Dev.",
        channelName: "M365 & SPFx",
        groups: [],
        selectedChannelId: "M365 & SPFx",
        activeTab: "Posts",
        onTabChange: noAction,
        onOpenSharePoint: noAction,
        children: "Current channel conversation",
      }),
      workspaceFAQExampleHref,
    );
    expect(shell).toContain('src="/images/channels-mark.svg"');
    expect(shell).toContain('src="/images/site-mark.svg"');
    for (const language of ["en", "de"] as const)
      expectGenericCopy(exposedCopy(shell, language));

    const technicalHome = render(
      createElement(FunctionalApp),
      "/digital-tech?staff=elliot",
    );
    const destinations = Array.from(
      technicalHome.matchAll(/href="([^"]*)"/g),
      (match) => new URL(decodeEntities(match[1]), "https://example.test"),
    );
    expect(
      destinations.some(
        (url) =>
          url.pathname === "/teams" &&
          url.searchParams.get("workspace") === "digital" &&
          url.searchParams.get("channel") === "M365 & SPFx" &&
          url.searchParams.get("staff") === "elliot",
      ),
    ).toBe(true);
    expect(
      new URL(workspaceFAQExampleHref, "https://example.test").searchParams.get(
        "channel",
      ),
    ).toBe("M365 & SPFx");
  });

  it("localises the new generic labels and configured settings copy", () => {
    expect(displayText("Search channels", "de")).toBe("Kanäle durchsuchen");
    expect(displayText("Jump to…", "de")).toBe("Direkt zu…");
    expect(displayText("Open workspace", "de")).toBe("Arbeitsbereich öffnen");
    for (const language of ["en", "de"] as const) {
      for (const option of siteAdministrationOptions)
        expectGenericCopy(
          displayText(`${option.name}: ${option.detail}`, language),
        );
      expectGenericCopy(displayText(creationExplanation, language));
    }
    expect(displayText(creationExplanation, "en")).toContain(
      "nothing is connected to company tools or systems",
    );
  });
});
