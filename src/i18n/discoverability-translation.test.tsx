import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { germanDiscoverability } from "./de-discoverability";
import { displayText } from "./displayText";
import { translateText } from "./translate";
import {
  contentChannels,
  contentHomeChannelGroups,
  contentTeamsHref,
} from "../content/channels";
import { studioPosts } from "../content/conversations";
import { peopleDirectory } from "../intranet/catalog";
import { previewRoles } from "../access/policy";
import ContentConversation from "../content/ContentConversation";
import ContentApp from "../content/ContentApp";
import TeamsShell from "../teams/TeamsShell";
import { PreviewRoleProvider } from "../components/PreviewRoleContext";
import { channelNavigationFor } from "../teams/navigation";
import { resolveStaffPerson } from "../intranet/catalog";

const german = (source: string) => displayText(source, "de");
const topicIds = [
  "cities-mobility",
  "education-skills",
  "digital-society",
  "arts-culture",
];
afterEach(() => vi.unstubAllGlobals());
function at(path: string) {
  vi.stubGlobal("location", new URL(path, "https://example.test"));
  vi.stubGlobal("sessionStorage", { getItem: () => "taylor" });
}
function exposedCopy(html: string) {
  html = html.replace(
    /<(?:style|script)\b[^>]*>[\s\S]*?<\/(?:style|script)>/gi,
    "",
  );
  const decode = (text: string) =>
    text
      .replaceAll("&amp;", "&")
      .replaceAll("&#x27;", "'")
      .replaceAll("&quot;", '"');
  return [
    ...Array.from(html.matchAll(/>([^<]+)</g), (match) => match[1]),
    ...Array.from(
      html.matchAll(
        /(?:aria-label|aria-description|alt|title|placeholder)="([^"]*)"/g,
      ),
      (match) => match[1],
    ),
  ]
    .map((text) => german(decode(text)))
    .join(" ");
}

describe("German discoverability review after English implementation was final", () => {
  it("keeps the reviewed copy at final precedence and preserves canonical English values", () => {
    for (const [source, translated] of Object.entries(germanDiscoverability)) {
      expect(translateText(source, "de"), source).toBe(translated);
      expect(translateText(source, "en"), source).toBe(source);
      expect(german(source)).not.toMatch(
        /\b(?:Teams|SharePoint|Microsoft|M365)\b/,
      );
    }
  });

  it("explains role personalisation without implying an access denial", () => {
    expect(german("See a role-based channel view")).toBe(
      "Rollenbezogene Kanalansicht erkunden",
    );
    expect(german("Choose a preview role")).toBe("Vorschaurolle auswählen");
    expect(german("Open your channel view")).toBe("Eigene Kanalansicht öffnen");
    const description = german(
      "Choose a preview role to see the department, workspace and project channels that would normally appear here.",
    );
    expect(description).toContain("dieser Rolle im Alltag");
    expect(description).not.toMatch(/Zugriff|Berechtigung|verweigert/);
    expect(german("Try another preview role")).toBe(
      "Andere Vorschaurolle ausprobieren",
    );
    expect(german("Private channel")).toBe("Privater Kanal");
  });

  it("uses matching canonical topic names, ordinary specialist identities and complete conversations", () => {
    expect(
      contentHomeChannelGroups().map((group) => german(group.label)),
    ).toEqual([
      "Kanalredaktionen",
      "Themenverantwortliche",
      "Aktuelle Berichterstattung",
    ]);
    const names = [
      "Städte und Mobilität",
      "Bildung und Kompetenzen",
      "Digitale Gesellschaft",
      "Kunst und Kultur",
    ];
    for (const [index, id] of topicIds.entries()) {
      const channel = contentChannels.find((item) => item.id === id)!;
      expect(german(channel.name)).toBe(names[index]);
      expect(german(channel.purpose)).not.toBe(channel.purpose);
      const post = studioPosts[id][0];
      const colleague = peopleDirectory.find(
        (person) => person.name === post.author,
      )!;
      expect(previewRoles.some((person) => person.id === colleague.id)).toBe(
        false,
      );
      expect(german(colleague.role)).toMatch(/^Fachberatung für /);
      expect(german(post.text)).not.toBe(post.text);
      expect(german(post.reply!.text)).not.toBe(post.reply!.text);
      expect(german(post.handoff!.label)).not.toBe(post.handoff!.label);
      const html = renderToStaticMarkup(
        createElement(ContentConversation, {
          channel: id,
          personId: "taylor",
          userName: "Taylor Brooks",
          query: "",
          onOpenFile: () => {},
        }),
      );
      const displayed = exposedCopy(html);
      expect(displayed).toContain(german(colleague.role));
      expect(displayed).toContain(german(post.text));
      expect(displayed).toContain(german(post.handoff!.label));
      expect(displayed).not.toContain(post.handoff!.label);
      expect(displayed).toMatch(/Arbeitsbereich ·\s+(?:DOCX|XLSX)/);
      expect(displayed).not.toMatch(/\b(?:Teams|SharePoint|Microsoft|M365)\b/);
      const destination = contentTeamsHref("taylor", id);
      expect(german(destination)).toBe(destination);
      const url = new URL(destination, "https://example.test");
      expect(url.searchParams.get("context")).toBe("workspace:content");
      expect(url.searchParams.get("channel")).toBe(channel.name);
    }
    expect(german(studioPosts["education-skills"][0].text)).toContain(
      german("Future Skills Week"),
    );
    expect(german("Sales & Marketing Wiki")).toBe("Sales & Marketing Wiki");
  });

  it("translates the actual Studio Home groups and the General Staff global helper", () => {
    at("/content-delivery?staff=taylor");
    const home = exposedCopy(renderToStaticMarkup(createElement(ContentApp)));
    expect(home).toContain("Kanalredaktionen");
    expect(home).toContain("Themenverantwortliche");
    expect(home).toContain("Aktuelle Berichterstattung");
    expect(home).toContain("Alle Studiokanäle öffnen");
    const person = resolveStaffPerson("taylor");
    const navigation = channelNavigationFor({ person });
    expect(navigation.groups.map((group) => group.id)).toEqual(["company"]);
    const html = renderToStaticMarkup(
      createElement(
        PreviewRoleProvider,
        null,
        createElement(TeamsShell, {
          userName: person.name,
          teamName: "Company Updates",
          channelName: "Important updates",
          selectedChannelId: "company:important",
          groups: navigation.groups,
          showRoleDiscovery: navigation.showRoleDiscovery,
          activeTab: "Posts",
          onTabChange: () => {},
          children: null,
        }),
      ),
    );
    const helper = exposedCopy(html);
    expect(helper).toContain("Unternehmensnachrichten");
    expect(helper).toContain("Rollenbezogene Kanalansicht erkunden");
    expect(helper).toContain("Vorschaurolle auswählen");
    expect(helper).toContain("Eigene Kanalansicht öffnen");
    expect(helper).not.toMatch(/\b(?:Teams|SharePoint|Microsoft|M365)\b/);
  });
});
