import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi, afterEach } from "vitest";
import ScienceWikiApp, { searchScienceWiki } from "./ScienceWikiApp";
import { prototypeForPath, pageTitle } from "../utils/routes";
import { translateText } from "../i18n/translate";

afterEach(() => vi.unstubAllGlobals());

describe("Frontline science Wiki", () => {
  it("has a dedicated route and an accessible landing article", () => {
    expect(prototypeForPath("/frontline/science-wiki")).toBe("science-wiki");
    expect(pageTitle("/frontline/science-wiki")).toContain(
      "Biochemistry & Physiology",
    );
    vi.stubGlobal(
      "location",
      new URL("https://example.test/frontline/science-wiki"),
    );
    const html = renderToStaticMarkup(<ScienceWikiApp />);
    expect(html).toContain("Biochemistry &amp; Physiology Wiki");
    expect(html).toContain('aria-label="How an enzyme catalyses a reaction.');
    expect(html).toContain("Last reviewed");
    expect(html).toContain("On this page");
    expect(html).toContain("Related reading");
    expect(html).toContain("Skip to article");
    expect(html).toContain('aria-controls="science-area-nav"');
    expect(html).toContain('aria-controls="science-article-nav"');
    expect(html).toContain("Browse knowledge areas");
    expect(html).toContain("Browse articles");
  });

  it("supports search across knowledge areas and articles", () => {
    expect(searchScienceWiki("pH").map((article) => article.title)).toContain(
      "pH in living systems",
    );
    expect(
      searchScienceWiki("enzyme").map((article) => article.title),
    ).toContain("Proteins and enzymes");
    expect(searchScienceWiki("ATP").map((article) => article.title)).toContain(
      "How cells use ATP",
    );
    expect(
      searchScienceWiki("alveoli").map((article) => article.title),
    ).toContain("The respiratory system and gas exchange");
    expect(searchScienceWiki("not found")).toEqual([]);
  });

  it("translates its navigation and representative content into German", () => {
    for (const text of [
      "Biochemistry",
      "Physiology",
      "Proteins and enzymes",
      "The respiratory system and gas exchange",
      "Browse knowledge areas",
      "Browse articles",
      "On this page",
      "Related reading",
      "Last reviewed",
      "Article owner",
    ]) {
      expect(translateText(text, "de"), text).not.toBe(text);
    }
  });
});
