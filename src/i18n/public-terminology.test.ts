import { describe, expect, it } from "vitest";
import { peopleDirectory } from "../intranet/catalog";
import { posts as companyPosts } from "../logistics/data";
import { departments } from "../coordination/data";
import { studioPosts } from "../content/conversations";
import { functionalConfigs } from "../workspaces/config";
import { technicalPosts } from "../workspaces/technicalTeams";
import { wikiArticles, wikiTranslations } from "../wiki/content";
import { formatDisplayPunctuation } from "./displayPunctuation";
import { formatPublicTerminology } from "./publicTerminology";
import { translateText, type Language } from "./translate";

const display = (source: string, language: Language) =>
  formatDisplayPunctuation(
    formatPublicTerminology(translateText(source, language), language),
    language,
  );
const vendor = /\b(?:Microsoft|SharePoint|M365|OneDrive)\b|\bTeams\b/i;

/** Actual display fields, not routes, IDs, implementation names or source comments. */
const fixtureCopy = [
  ...peopleDirectory.map((person) => person.role),
  ...functionalConfigs.flatMap((config) => [
    ...config.areas.flatMap((area) => [area.name, area.summary]),
    ...config.tools.flatMap((tool) => [tool.name, tool.purpose]),
    ...config.files.flatMap((file) => [
      file.name,
      ...Object.values(file.metadata || {}),
    ]),
  ]),
  ...technicalPosts.flatMap((post) => [
    post.channel,
    post.text,
    ...(post.replies || []).flatMap((reply) => [
      reply.text,
      reply.link?.label || "",
    ]),
  ]),
  ...companyPosts.flatMap((post) => [post.text, post.reply || ""]),
  ...departments.flatMap((department) =>
    department.posts.flatMap((post) => [
      post.text,
      ...(post.replies || []).map((reply) => reply.text),
    ]),
  ),
  ...Object.values(studioPosts).flatMap((posts) =>
    posts.flatMap((post) => [post.text, post.reply?.text || ""]),
  ),
  ...wikiArticles.flatMap((article) => [
    article.title,
    article.introduction,
    ...article.sections.flatMap((section) => [
      section.heading,
      ...section.points,
    ]),
  ]),
].filter((copy) =>
  /\b(?:Microsoft|SharePoint|M365|OneDrive|Teams)\b/.test(copy),
);

describe("public product terminology keeps the workplace concepts clear", () => {
  it("audits the actual conversation, Wiki, role and working-file display fields in both languages", () => {
    expect(fixtureCopy.length).toBeGreaterThan(10);
    for (const source of fixtureCopy)
      for (const language of ["en", "de"] as const) {
        const rendered = display(source, language);
        expect(rendered, `${language}: ${source}`).not.toMatch(vendor);
      }
    for (const translated of Object.values(wikiTranslations).filter((copy) =>
      /\b(?:Microsoft|SharePoint|M365|OneDrive|Teams)\b/.test(copy),
    ))
      expect(formatPublicTerminology(translated, "de"), translated).not.toMatch(
        vendor,
      );
  });

  it("uses one stable display alias for the existing workplace-platform channel without changing its canonical name", () => {
    const post = technicalPosts.find(
      (item) => item.id === "digital-onedrive-review",
    )!;
    expect(post.channel).toBe("M365 & SPFx");
    expect(display(post.channel, "en")).toBe("Workplace platforms & SPFx");
    expect(display(post.channel, "de")).toBe("Plattformen & SPFx");
    expect(display("m365-extensions", "en")).toBe("Workplace extensions");
    expect(display("m365-extensions", "de")).toBe(
      "Erweiterungen für Arbeitsplatzplattformen",
    );
    expect(post.channel).toBe("M365 & SPFx");
  });

  it("uses generic personal storage wording while retaining the example and focal-point meaning", () => {
    const post = technicalPosts.find(
      (item) => item.id === "digital-onedrive-review",
    )!;
    const reply = post.replies!.find((item) => item.text.includes("OneDrive"))!;
    for (const language of ["en", "de"] as const) {
      expect(display(reply.text, language)).toContain(
        language === "en" ? "personal drive" : "persönlichen Speicherbereich",
      );
      expect(display(reply.text, language)).not.toMatch(vendor);
    }
    const focalPointCopy =
      "Ask your workspace focal point about access or everyday questions.";
    expect(formatPublicTerminology(focalPointCopy, "en")).toBe(focalPointCopy);
  });

  it("distinguishes ordinary people groups from the channel product in German", () => {
    expect(
      formatPublicTerminology("Beide Teams sind heute im Einsatz.", "de"),
    ).toBe("Beide Einsatzgruppen sind heute im Einsatz.");
    expect(
      formatPublicTerminology(
        "Betrachten Sie das Erlebnis aus Kundensicht über Teams und Kanäle hinweg.",
        "de",
      ),
    ).toBe(
      "Betrachten Sie das Erlebnis aus Kundensicht über Arbeitsgruppen und Kanäle hinweg.",
    );
    expect(
      formatPublicTerminology(
        "Lasst uns die Zuständigkeit festlegen, statt drei Teams hinterherlaufen zu lassen.",
        "de",
      ),
    ).toBe(
      "Lasst uns die Zuständigkeit festlegen, statt drei Arbeitsgruppen hinterherlaufen zu lassen.",
    );
    expect(
      formatPublicTerminology(
        "Arbeitsalltag der Teams im direkten Kundenkontakt.",
        "de",
      ),
    ).toBe("Arbeitsalltag der Beschäftigten im direkten Kundenkontakt.");
    expect(
      formatPublicTerminology("Different teams can work together.", "en"),
    ).toBe("Different teams can work together.");
  });

  it("resolves German compounds before the existing punctuation formatter", () => {
    expect(
      display("Current shared guides are linked from Teams channels.", "de"),
    ).toBe("Aktuelle gemeinsame Leitfäden sind in den Kanälen verlinkt.");
    expect(display("M365 Search Improvements", "de")).toBe(
      "Verbesserungen der Suche in digitalen Arbeitsplatzplattformen",
    );
    expect(display("Microsoft 365 Engineering", "de")).toBe(
      "Entwicklung für digitale Arbeitsplatzplattformen",
    );
    expect(display("Open in SharePoint", "de")).toBe("Arbeitsbereich öffnen");
  });

  it("retains natural sentence agreement and avoids duplicated channel wording", () => {
    const wikiCopy =
      "Teams shows the channels relevant to your role; access to protected work is granted separately.";
    expect(display(wikiCopy, "en")).toBe(
      "Your channel view shows the conversations relevant to your role; access to protected work is granted separately.",
    );
    expect(display(wikiCopy, "de")).toBe(
      "Die Kanalansicht zeigt die für Ihre Rolle relevanten Kanäle. Der Zugriff auf geschützte Inhalte wird gesondert freigegeben.",
    );
    expect(
      formatPublicTerminology(
        "Der Microsoft 365-App-Launcher ist nicht angebunden.",
        "de",
      ),
    ).toBe("Das Appstartfeld ist nicht angebunden.");
    expect(
      formatPublicTerminology("The M365 search rollout is ready.", "en"),
    ).toBe(
      "The rollout of search across digital workplace platforms is ready.",
    );
    expect(formatPublicTerminology("Kanäle in Microsoft Teams", "de")).toBe(
      "Kanäle",
    );
    expect(formatPublicTerminology("Verwaltung von Teams", "de")).toBe(
      "Kanalverwaltung",
    );
    expect(formatPublicTerminology("Suche in Microsoft 365", "de")).toBe(
      "Suche in digitalen Arbeitsplatzplattformen",
    );
  });

  it("leaves actual addresses, paths and canonical data untouched", () => {
    const protectedValues = [
      "https://learn.microsoft.com/en-us/sharepoint/",
      "/teams?workspace=digital&channel=M365%20%26%20SPFx",
      "/digital-tech/systems/github?repo=m365-extensions",
      "m365-admin@example.test",
    ];
    for (const value of protectedValues)
      for (const language of ["en", "de"] as const)
        expect(formatPublicTerminology(value, language)).toBe(value);
    expect(formatPublicTerminology("SHAREPOINT", "en")).toBe("Site");
    expect(formatPublicTerminology("microsoft 365", "en")).toBe(
      "digital workplace platforms",
    );
    expect(formatPublicTerminology("MICROSOFT", "de")).toBe(
      "digitale Arbeitsplatzplattformen",
    );
  });
});
