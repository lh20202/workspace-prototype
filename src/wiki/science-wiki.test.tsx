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
      "Biology, Chemistry",
    );
    vi.stubGlobal(
      "location",
      new URL("https://example.test/frontline/science-wiki"),
    );
    const html = renderToStaticMarkup(<ScienceWikiApp />);
    expect(html).toContain("Biology, Chemistry &amp; Physiology Wiki");
    expect(html).toContain(
      'aria-label="Simplified animal cell. A nucleus sits',
    );
    expect(html).toContain("Learning reference");
    expect(html).toContain("Skip to article");
    expect(html).toContain('aria-controls="science-area-nav"');
    expect(html).toContain('aria-controls="science-article-nav"');
    expect(html).toContain("Browse knowledge areas");
    expect(html).toContain("Browse articles");
  });

  it("supports search across knowledge areas and articles", () => {
    expect(
      searchScienceWiki("photosynthesis").map((article) => article.title),
    ).toContain("Photosynthesis in brief");
    expect(
      searchScienceWiki("alveoli").map((article) => article.title),
    ).toContain("The respiratory system and gas exchange");
    expect(searchScienceWiki("not found")).toEqual([]);
  });

  it("translates its navigation and representative content into German", () => {
    for (const text of [
      "Biology",
      "Chemistry",
      "Physiology",
      "How cells organise life",
      "The respiratory system and gas exchange",
      "Learning reference · For general education",
      "Browse knowledge areas",
      "Browse articles",
    ]) {
      expect(translateText(text, "de"), text).not.toBe(text);
    }
  });
});
