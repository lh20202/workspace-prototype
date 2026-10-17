import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import Directory, { WorkspaceCard } from "./Directory";
import {
  architectureDestinationById,
  personnelDestinations,
} from "./architectureDestinations";
import { departments } from "../coordination/data";
import { departmentPreviewHref } from "../teams/departmentPreview";

const css = readFileSync(
  new URL("./architecture-hubs.css", import.meta.url),
  "utf8",
);
afterEach(() => vi.unstubAllGlobals());

function renderDirectory() {
  vi.stubGlobal(
    "location",
    new URL("https://example.test/architecture?staff=robin"),
  );
  vi.stubGlobal("sessionStorage", { getItem: () => "robin" });
  return renderToStaticMarkup(<Directory />);
}

describe("compact Architecture workspace grammar", () => {
  it("uses a repeatable icon-and-title card without a trailing arrow or Open label", () => {
    const card = renderToStaticMarkup(
      <WorkspaceCard
        destination={architectureDestinationById.get("audience")!}
      />,
    );
    expect(card).toContain('class="directory-tile directory-workspace-card"');
    expect(card).toContain('class="workspace-icon"');
    expect(card).toContain("Research &amp; Insight");
    expect(card).not.toContain("directory-row-arrow");
    expect(card).not.toContain("ArrowRight");
    expect(card).not.toMatch(/Open|sharepoint-logo|workspace<\/h3>/);
  });

  it("keeps Sales, Org Central and Personnel on the same two-column card grid", () => {
    const html = renderDirectory();
    expect(css).toMatch(
      /\.directory-hub-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
    );
    const sections = [
      ...html.matchAll(
        /<section class="directory-hub directory-hub-([^"]+)"[^>]*>([\s\S]*?)<\/section><\/div><\/div><\/section>/g,
      ),
    ];
    for (const id of ["sales-marketing", "infrastructure", "personnel"]) {
      const band = sections.find(([, hub]) => hub === id)?.[2];
      expect(band, id).toBeDefined();
      expect(band).toContain("directory-workspace-card");
      expect(band).toContain("directory-hub-grid");
    }
    expect(
      html.match(/class="directory-tile directory-workspace-card"/g),
    ).toHaveLength(15);
  });

  it("keeps other environment types, controlled links and finance jumps distinct", () => {
    const html = renderDirectory();
    for (const href of [
      "/sales-marketing/wiki",
      "/frontline-sales",
      "/external/media-library",
    ])
      expect(html).toMatch(
        new RegExp(
          `<a(?![^>]*directory-workspace-card)[^>]*href="${href}\\?staff=robin"`,
        ),
      );
    for (const destination of personnelDestinations.controlled)
      expect(html).toMatch(
        new RegExp(
          `<a(?![^>]*directory-workspace-card)[^>]*href="${destination.href}\\?staff=robin"`,
        ),
      );
    expect(html).toContain('class="directory-finance-jumps"');
    expect(html).not.toMatch(
      /directory-workspace-card[^>]*href="\/financial-operations/,
    );
    expect(html).not.toContain("Open my Teams");
    expect(html).not.toContain("Open your Teams view");
  });

  it("opens every Department as the ordinary member preview, independent of the selected executive", () => {
    const html = renderDirectory();
    for (const department of departments) {
      const href = departmentPreviewHref(department.id);
      expect(html).toContain(`href="${href.replace(/&/g, "&amp;")}"`);
      expect(
        new URL(href, "https://example.test").searchParams.get("staff"),
      ).toBe("taylor");
    }
  });
});
