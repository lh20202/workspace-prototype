import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import Directory from "./Directory";
import { ArchitectureDestinationLink } from "./ArchitectureContent";
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
    getItem: () => "robin",
  });
  return renderToStaticMarkup(<Directory />);
}

describe("compact Architecture destination links", () => {
  it("uses a small icon-and-title link without a tile, trailing arrow or Open label", () => {
    const card = renderToStaticMarkup(
      <ArchitectureDestinationLink
        destination={architectureDestinationById.get("audience")!}
      />,
    );
    expect(card).toContain('class="architecture-destination"');
    expect(card).toContain('class="architecture-workspace-icon"');
    expect(card).toContain('src="/images/workspaces/workspace-chunky.png"');
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
        /<section class="architecture-panel architecture-tone-([^"]+)"[^>]*>([\s\S]*?)<\/section>/g,
      ),
    ];
    for (const id of ["sales-marketing", "infrastructure", "personnel"]) {
      const band = sections.find(([, hub]) => hub === id)?.[2];
      expect(band, id).toBeDefined();
      expect(band).toContain("architecture-destination");
      expect(band).toContain("architecture-destination-grid");
    }
    expect(html.match(/class="architecture-destination"/g)).toHaveLength(24);
  });

  it("keeps environment types and destinations intact with consistent workspace icons", () => {
    const html = renderDirectory();
    const anchors = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map(
      ([link]) => link,
    );
    for (const [href, type] of [
      ["/sales-marketing/wiki", "wiki"],
      ["/frontline-sales", "portal"],
      ["/external/media-library", "portal"],
    ]) {
      const anchor = anchors.find((link) =>
        link.includes(`href="${href}?staff=robin"`),
      );
      expect(anchor).toContain(`data-environment="${type}"`);
      expect(anchor).not.toContain('class="architecture-workspace-icon"');
    }
    for (const destination of personnelDestinations.controlled) {
      const anchor = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].find(
        ([link]) => link.includes(`href="${destination.href}?staff=robin"`),
      )?.[0];
      expect(anchor).toContain('src="/images/workspaces/workspace-chunky.png"');
      expect(anchor).not.toContain("Controlled access");
    }
    expect(html).toContain('aria-labelledby="layout-hub-finance"');
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
