import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import Directory, { WorkspaceLink } from "./Directory";
import {
  architectureDestinationById,
  personnelDestinations,
} from "./architectureDestinations";
import { departments } from "../coordination/data";
import { departmentPreviewHref } from "../teams/departmentPreview";

afterEach(() => vi.unstubAllGlobals());

function renderDirectory() {
  vi.stubGlobal(
    "location",
    new URL("https://example.test/architecture?staff=robin"),
  );
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) =>
      key === "architecture-layout-session" ? "classic" : "robin",
  });
  return renderToStaticMarkup(<Directory />);
}

describe("compact Architecture destination links", () => {
  it("uses a small icon-and-title link without a tile, trailing arrow or Open label", () => {
    const card = renderToStaticMarkup(
      <WorkspaceLink
        destination={architectureDestinationById.get("audience")!}
      />,
    );
    expect(card).toContain('class="directory-workspace-link"');
    expect(card).toContain('class="workspace-icon"');
    expect(card).toContain("--workspace-icon-size:20px");
    expect(card).toContain("Lab");
    expect(card).not.toContain("directory-row-arrow");
    expect(card).not.toContain("ArrowRight");
    expect(card).not.toContain("directory-tile");
    expect(card).not.toMatch(/Open|sharepoint-logo|workspace<\/h3>/);
  });

  it("keeps all workspace entrances within the four compact hub panels", () => {
    const html = renderDirectory();
    const sections = [
      ...html.matchAll(
        /<section class="directory-hub directory-hub-([^"]+)"[^>]*>([\s\S]*?)<\/section><\/div><\/div><\/section>/g,
      ),
    ];
    for (const id of ["sales-marketing", "infrastructure", "personnel"]) {
      const band = sections.find(([, hub]) => hub === id)?.[2];
      expect(band, id).toBeDefined();
      expect(band).toContain("directory-workspace-link");
      expect(band).toContain("directory-hub-grid");
    }
    expect(html.match(/class="directory-workspace-link"/g)).toHaveLength(14);
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
          `<a(?![^>]*directory-workspace-link)[^>]*href="${href}\\?staff=robin"`,
        ),
      );
    for (const destination of personnelDestinations.controlled)
      expect(html).toMatch(
        new RegExp(
          `<a(?![^>]*directory-workspace-link)[^>]*href="${destination.href}\\?staff=robin"`,
        ),
      );
    expect(html).toContain('class="directory-finance-destinations"');
    expect(html).not.toMatch(
      /directory-workspace-link[^>]*href="\/financial-operations/,
    );
    expect(html).not.toContain("Open my Teams");
    expect(html).not.toContain("Open your Teams view");
  });

  it("opens every Department in explicit context while retaining the selected executive", () => {
    const html = renderDirectory();
    for (const department of departments) {
      const href = departmentPreviewHref(department.id);
      expect(html).toContain(`href="${href.replace(/&/g, "&amp;")}"`);
      expect(
        new URL(href, "https://example.test").searchParams.get("staff"),
      ).toBe("robin");
      expect(
        new URL(href, "https://example.test").searchParams.get("context"),
      ).toBe(`department:${department.id}`);
    }
  });
});
