import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import WikiApp from "./WikiApp";
import {
  resolveWikiPath,
  wikiAreaHref,
  wikiAreas,
  wikiArticleHref,
  wikiArticles,
  wikiBase,
  wikiFiles,
  wikiFolders,
  wikiLibrary,
  wikiLibraryTitle,
  wikiSourceHref,
  wikiTranslations,
} from "./content";
import {
  libraryColumns,
  libraryLocation,
  queryLibrary,
} from "../sharepoint/library";
import { translateText } from "../i18n/translate";
import { matchesDisplayText } from "../i18n/search";

afterEach(() => vi.unstubAllGlobals());
function markup(pathname = wikiBase, search = "") {
  vi.stubGlobal("location", { pathname, search });
  return renderToStaticMarkup(<WikiApp />);
}

describe("Sales & Marketing knowledge navigation", () => {
  it("has exactly the eight requested primary knowledge areas", () => {
    expect(wikiAreas.map((area) => area.title)).toEqual([
      "Foundations",
      "Messaging & Creative",
      "Insight & Performance",
      "Legal & Standards",
      "Learning",
      "Tools & How-tos",
      "Who to Ask",
      "A–Z Directory",
    ]);
    expect(new Set(wikiArticles.map((article) => article.id)).size).toBe(
      wikiArticles.length,
    );
    expect(wikiArticles.length).toBe(39);
  });
  it("keeps primary and chapter context on direct article routes", () => {
    for (const article of wikiArticles) {
      const resolved = resolveWikiPath(wikiArticleHref(article));
      expect(resolved.valid).toBe(true);
      expect(resolved.area?.id).toBe(article.areaId);
      expect(resolved.article).toBe(article);
      expect(resolveWikiPath(wikiAreaHref(article.areaId)).area?.id).toBe(
        article.areaId,
      );
      expect(article.sections.length).toBeGreaterThanOrEqual(2);
      expect(article.sections.length).toBeLessThanOrEqual(4);
    }
    expect(resolveWikiPath(wikiBase).article?.id).toBe("brand-vision");
    expect(resolveWikiPath(`${wikiBase}/missing`).valid).toBe(false);
    expect(resolveWikiPath(`${wikiBase}/foundations/missing`).valid).toBe(
      false,
    );
    expect(
      resolveWikiPath(`${wikiBase}/foundations/brand-vision/extra`).valid,
    ).toBe(false);
    expect(resolveWikiPath(`${wikiBase}/a-z/extra`).valid).toBe(false);
  });
  it("renders two distinct rails with current area and chapter selected", () => {
    const html = markup(`${wikiBase}/messaging/language-tone`);
    expect(html).toContain('aria-label="Wiki area navigation"');
    expect(html).toContain('aria-label="Wiki chapter navigation"');
    expect(html).toMatch(
      /<a(?=[^>]*href="\/sales-marketing\/wiki\/messaging\/messaging-principles")(?=[^>]*aria-current="page")[^>]*>/,
    );
    expect(html).toMatch(
      /<a(?=[^>]*href="\/sales-marketing\/wiki\/messaging\/language-tone")(?=[^>]*aria-current="page")[^>]*>/,
    );
    expect(html).toContain("Language &amp; Tone</h1>");
    expect(html).toContain('class="wiki-primary-rail"');
    expect(html).toContain('class="wiki-chapter-rail"');
    expect(html).toContain('href="/architecture"');
  });
  it("keeps an explicit colleague through chapter, source and hub links", () => {
    const html = markup(`${wikiBase}/messaging/language-tone`, "?staff=devon");
    const links = [...html.matchAll(/href="(\/[^"\s]*)"/g)].map(
      ([, href]) =>
        new URL(href.replaceAll("&amp;", "&"), "https://example.test"),
    );
    expect(links.length).toBeGreaterThan(10);
    for (const link of links)
      expect(link.searchParams.get("staff"), link.href).toBe("devon");
  });
  it("links each readable article to the same canonical managed source", () => {
    expect(new Set(wikiFiles.map((file) => file.id)).size).toBe(
      wikiFiles.length,
    );
    for (const article of wikiArticles) {
      const file = wikiFiles.find(
        (candidate) => candidate.id === article.sourceId,
      );
      expect(file?.summary).toBe(article.introduction);
      const url = new URL(wikiSourceHref(article), "https://example.test");
      expect(url.pathname).toBe(`${wikiBase}/a-z`);
      expect(url.searchParams.get("library")).toBe(wikiLibraryTitle);
      expect(
        libraryLocation(url.searchParams, wikiLibraryTitle, wikiFiles, "").file
          ?.id,
      ).toBe(article.sourceId);
      expect(file?.versions).toHaveLength(2);
    }
  });
  it("uses the existing read-only SharePoint library, shallow folders and useful views", () => {
    const html = markup(`${wikiBase}/a-z`);
    expect(html).toContain('class="sp-document-library"');
    expect(html).toContain("Read only");
    expect(html).toContain("Reference folders");
    expect(wikiFolders).toHaveLength(7);
    expect(wikiFolders.every((folder) => !folder.includes("/"))).toBe(true);
    expect(wikiLibrary.views?.map((view) => view.name)).toEqual([
      "A–Z",
      "Recently updated",
      "Needs review",
      "By topic",
    ]);
    const all = queryLibrary(wikiFiles, {
      folder: "",
      view: "a-z",
      definition: wikiLibrary,
    });
    expect(all).toHaveLength(wikiFiles.length);
    expect(all.map((file) => file.metadata?.Topic)).toEqual(
      [...all.map((file) => file.metadata?.Topic)].sort((a, b) =>
        String(a).localeCompare(String(b), undefined, { numeric: true }),
      ),
    );
    expect(
      queryLibrary(wikiFiles, {
        folder: "",
        view: "review",
        definition: wikiLibrary,
      }).map((file) => file.status),
    ).toEqual(["Needs review", "Needs review"]);
    expect(
      queryLibrary(wikiFiles, {
        folder: "Learning",
        view: "a-z",
        definition: wikiLibrary,
      }).every((file) => file.folder === "Learning"),
    ).toBe(true);
    expect(libraryColumns(wikiLibrary, "a-z").length).toBeLessThan(
      wikiLibrary.columns.length + (wikiLibrary.fields?.length || 0),
    );
  });
  it("translates every article field, source name and interface label into professional German", () => {
    for (const article of wikiArticles) {
      const copy = [
        article.title,
        article.introduction,
        ...article.sections.flatMap((section) => [
          section.heading,
          ...section.points,
        ]),
      ];
      for (const text of copy) {
        expect(wikiTranslations[text], text).toBeTruthy();
        expect(translateText(text, "de"), text).toBe(wikiTranslations[text]);
        expect(translateText(text, "en"), text).toBe(text);
      }
    }
    for (const file of wikiFiles)
      expect(translateText(file.name, "de")).toBe(wikiTranslations[file.name]);
    expect(translateText("Who to Ask", "de")).toBe("Ansprechpersonen");
    expect(translateText("Sales & Marketing Wiki", "de")).toBe(
      "Sales & Marketing Wiki",
    );
    expect(
      matchesDisplayText("Customer-facing Terms", "Kundenbedingungen"),
    ).toBe(true);
    expect(matchesDisplayText("Using Shared Templates", "Vorlagen")).toBe(true);
  });
});
