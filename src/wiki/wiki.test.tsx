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
import { previewRoles, canAccessWikiArea } from "../access/policy";
import WikiFigure, { wikiFigureCopy, wikiFigures } from "./WikiFigure";
import {
  germanWikiFigureLabels,
  germanWikiRefinement,
} from "../i18n/de-wiki-refinement";

afterEach(() => vi.unstubAllGlobals());
function markup(pathname = wikiBase, search = "") {
  vi.stubGlobal("location", { pathname, search });
  return renderToStaticMarkup(<WikiApp />);
}

describe("Sales & Marketing knowledge navigation", () => {
  it("uses the same role for specialist articles, managed-source deep links and the A–Z library", () => {
    const specialist = wikiArticles.find(
      (article) => article.areaId === "insight",
    )!;
    for (const id of ["maya"]) {
      const denied = markup(wikiArticleHref(specialist), `?staff=${id}`);
      expect(denied).toContain("Access required");
      expect(denied).toContain("Are you frontline sales staff?");
      expect(denied).toContain(`href="/frontline-sales?staff=${id}"`);
      expect(denied).not.toContain('aria-label="Wiki article"');
      expect(denied).not.toContain(specialist.introduction);
      const source = markup(
        `${wikiBase}/a-z`,
        `?staff=${id}&file=${specialist.sourceId}`,
      );
      expect(source).toContain("Access required");
      expect(source).not.toContain("Document preview");
      const directory = markup(`${wikiBase}/a-z`, `?staff=${id}`);
      expect(directory).toContain('class="sp-document-library"');
      expect(directory).not.toContain(
        wikiFiles.find((file) => file.id === specialist.sourceId)!.name,
      );
    }
    for (const id of ["taylor", "robin", "jamie", "devon", "leonie"]) {
      const permitted = markup(wikiArticleHref(specialist), `?staff=${id}`);
      expect(permitted).toContain('aria-label="Wiki article"');
      expect(permitted).not.toContain("Access required");
      const directory = markup(`${wikiBase}/a-z`, `?staff=${id}`);
      expect(directory).toContain(
        wikiFiles.find((file) => file.id === specialist.sourceId)!.name,
      );
    }
  });

  it("opens internal knowledge to every role, with only the frontline Insight subset restricted", () => {
    for (const role of previewRoles) {
      for (const area of wikiAreas)
        expect(canAccessWikiArea(role, area.id)).toBe(
          role.id !== "maya" || area.id !== "insight",
        );
      expect(canAccessWikiArea(role, "unknown-knowledge-area")).toBe(false);
    }
    expect(canAccessWikiArea("not-a-role", "foundations")).toBe(false);
  });

  it("retains frontline knowledge for the frontline role", () => {
    const article = wikiArticles.find((item) => item.areaId === "learning")!;
    const html = markup(wikiArticleHref(article), "?staff=maya");
    expect(html).toContain('aria-label="Wiki article"');
    expect(html).not.toContain("Access required");
  });

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
    expect(wikiArticles.length).toBe(40);
  });
  it("adds practical Creative Studio knowledge under Messaging & Creative, without a new working-file store", () => {
    const article = wikiArticles.find(
      (item) => item.id === "working-with-creative-studio",
    )!;
    expect(article.areaId).toBe("messaging");
    expect(article.title).toBe("Working with the Creative Studio");
    const html = markup(wikiArticleHref(article), "?staff=maya");
    expect(html).toContain('aria-label="Wiki article"');
    expect(html).toContain("Topic specialists contribute evidence");
    expect(html).toContain("rather than uploading another copy");
    expect(html).toContain('href="/content-delivery?staff=maya"');
    expect(
      wikiFiles.filter((file) => file.id === article.sourceId),
    ).toHaveLength(1);
    expect(
      wikiFiles.filter((file) => file.id.startsWith("CONT-")),
    ).toHaveLength(0);
  });

  it("uses exactly four article-width, captioned and accessible Wiki diagrams", () => {
    expect(Object.keys(wikiFigures)).toEqual([
      "working-with-creative-studio",
      "know-customers",
      "channel-landscape",
      "conversion-metrics",
    ]);
    for (const [articleId, figure] of Object.entries(wikiFigures)) {
      expect(wikiArticles.some((article) => article.id === articleId)).toBe(
        true,
      );
      const html = renderToStaticMarkup(<WikiFigure articleId={articleId} />);
      expect(html).toContain('role="img"');
      expect(html).toContain("aria-labelledby=");
      expect(html).toContain(
        renderToStaticMarkup(<figcaption>{figure.caption}</figcaption>),
      );
      expect(html).toContain(`<desc`);
    }
    expect(renderToStaticMarkup(<WikiFigure articleId="brand-vision" />)).toBe(
      "",
    );
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
  it("interprets the new knowledge and diagrams in German without changing technical terminology elsewhere", () => {
    const studio = wikiArticles.find(
      (article) => article.id === "working-with-creative-studio",
    )!;
    expect(wikiTranslations[studio.title]).toBe(
      "Zusammenarbeit mit dem Kreativstudio",
    );
    const copy = [
      studio.title,
      studio.introduction,
      ...studio.sections.flatMap((section) => [
        section.heading,
        ...section.points,
      ]),
    ];
    for (const text of copy) expect(wikiTranslations[text]).not.toBe(text);
    for (const text of wikiFigureCopy)
      expect(
        germanWikiFigureLabels[text] || germanWikiRefinement[text],
        text,
      ).toBeTruthy();
    expect(germanWikiFigureLabels.Release).toBe("Veröffentlichung");
    expect(germanWikiRefinement.Release).toBeUndefined();
    expect(germanWikiRefinement.Welcome).toBeUndefined();
    expect(
      germanWikiRefinement[
        "This knowledge area is outside the frontline view."
      ],
    ).toContain("Ansicht für den direkten Kundenvertrieb");
    expect(germanWikiRefinement["Contact Wiki focal point"]).toBe(
      "Wiki-Ansprechperson kontaktieren",
    );
  });
});
