import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import StaffLink from "../components/StaffLink";
import ContentApp from "../content/ContentApp";
import FunctionalApp from "../workspaces/FunctionalApp";
import { withExplicitStaff } from "./staffNavigation";

afterEach(() => vi.unstubAllGlobals());

describe("explicit staff identity follows internal site navigation", () => {
  it("retains the colleague while preserving only the destination's own page state", () => {
    const destination = withExplicitStaff(
      "/logistics/operations?folder=Central+City&document=deployment#details",
      "?staff=devon&channel=Engineering&file=old-file&tab=Shared&preview=admin",
    );
    const url = new URL(destination, "https://example.test");
    expect(url.pathname).toBe("/logistics/operations");
    expect([...url.searchParams]).toEqual([
      ["folder", "Central City"],
      ["document", "deployment"],
      ["staff", "devon"],
    ]);
    expect(url.hash).toBe("#details");
  });

  it("does not change normal navigation without an explicit colleague", () => {
    for (const search of ["", "?view=Recent", "?staff="])
      expect(
        withExplicitStaff("/content-delivery/production?folder=A%20B", search),
      ).toBe("/content-delivery/production?folder=A%20B");
  });

  it("respects an intentional identity already specified by the destination", () => {
    expect(
      withExplicitStaff("/teams?staff=alex&channel=General", "?staff=devon"),
    ).toBe("/teams?staff=alex&channel=General");
  });

  it("leaves fragments, relative references and external links intact", () => {
    for (const destination of [
      "#main-content",
      "?view=Recent",
      "../shared",
      "https://example.test/other",
      "//example.test/other",
      "/\\example.test/other",
      "mailto:help@example.test",
    ])
      expect(withExplicitStaff(destination, "?staff=devon")).toBe(destination);
  });

  it("keeps a normal, keyboard- and new-tab-compatible anchor", () => {
    vi.stubGlobal(
      "location",
      new URL("https://example.test/content-delivery?staff=devon"),
    );
    const html = renderToStaticMarkup(
      <StaffLink
        href="/audience-innovation/research"
        className="related-link"
        target="_blank"
      >
        Audience evidence
      </StaffLink>,
    );
    expect(html).toContain('href="/audience-innovation/research?staff=devon"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain("Audience evidence</a>");
  });

  it("keeps explicit site identity in local navigation and related workspace links", () => {
    for (const [path, App] of [
      ["/content-delivery", ContentApp],
      ["/digital-tech", FunctionalApp],
    ] as const) {
      vi.stubGlobal(
        "location",
        new URL(`https://example.test${path}?staff=devon`),
      );
      vi.stubGlobal("sessionStorage", { getItem: () => "maya" });
      const html = renderToStaticMarkup(<App />);
      const destinations = [
        ...html.matchAll(/<a\b[^>]*href="(\/[^"\s]*)"/g),
      ].map(
        ([, href]) =>
          new URL(href.replaceAll("&amp;", "&"), "https://example.test"),
      );
      expect(
        destinations.filter((url) => url.pathname.startsWith(`${path}/`))
          .length,
      ).toBeGreaterThan(0);
      expect(destinations.some((url) => !url.pathname.startsWith(path))).toBe(
        true,
      );
      for (const destination of destinations)
        expect(destination.searchParams.get("staff"), destination.href).toBe(
          "devon",
        );
    }
  });
});
