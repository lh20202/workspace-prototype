import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import Directory from "./Directory";
import { architectureDestinationById } from "./architectureDestinations";
import {
  architectureHubViews,
  architectureProjects,
} from "./architectureModel";
import { ArchitectureDestinationLink } from "./ArchitectureContent";
import { currentProjects, projectHref } from "../projects/data";
import { departments } from "../coordination/data";
import { departmentPreviewHref } from "../teams/departmentPreview";
import { adminPlatformsForHub } from "../environments/catalog";
import { translateText } from "../i18n/translate";

afterEach(() => vi.unstubAllGlobals());

function renderDirectory(previousLayout?: string) {
  vi.stubGlobal(
    "location",
    new URL("https://example.test/architecture?staff=devon"),
  );
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) =>
      key === "architecture-layout-session"
        ? (previousLayout ?? null)
        : "devon",
  });
  return renderToStaticMarkup(<Directory />);
}
function hrefs(html: string) {
  return [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
}

describe("architecture directory", () => {
  it("always renders the quadrant view and ignores earlier layout choices", () => {
    const expected = renderDirectory();
    for (const previous of [
      "classic",
      "balanced",
      "workspaces-first",
      "directory",
    ]) {
      expect(renderDirectory(previous)).toBe(expected);
    }
    expect(expected.slice(expected.indexOf("<main"))).not.toMatch(
      /<select|<option|Layout [123]|Architecture layout/,
    );
    expect(
      expected.match(/class="architecture-panel architecture-tone-/g),
    ).toHaveLength(4);
    expect(expected.match(/class="directory-admin-logins"/g)).toHaveLength(4);
    expect(expected).not.toContain("architecture-shared-tools");
    expect(expected).not.toContain("architecture-destination-description");
  });

  it("keeps every destination and explicit role context", () => {
    const links = hrefs(renderDirectory());
    for (const hub of architectureHubViews) {
      for (const destination of [
        ...hub.primary,
        ...hub.knowledge,
        ...hub.secondary,
      ]) {
        expect(links).toContain(`${destination.href}?staff=devon`);
      }
    }
    for (const department of departments) {
      expect(links).toContain(
        departmentPreviewHref(department.id).replaceAll("&", "&amp;"),
      );
    }
  });

  it("adds a neutral scope break after Projects and Frontline destinations below it", () => {
    const html = renderDirectory();
    const projects = html.indexOf('class="architecture-projects"');
    const scope = html.indexOf("OUT OF SCOPE");
    const frontline = html.indexOf('id="architecture-frontline-title"');
    const countries = html.indexOf("<summary>Countries</summary>");
    expect(projects).toBeGreaterThan(-1);
    expect(scope).toBeGreaterThan(projects);
    expect(frontline).toBeGreaterThan(scope);
    expect(countries).toBeGreaterThan(frontline);
    expect(html).toContain('class="architecture-frontline-heading"><svg');
    expect(html).toContain("Biology, Chemistry &amp; Physiology Wiki");
    expect(html).toContain(
      'href="/external/frontline-logistics?returnTo=%2Farchitecture&amp;staff=devon"',
    );
    expect(html).toContain(
      'href="/external/frontline-supply?returnTo=%2Farchitecture&amp;staff=devon"',
    );
    expect(html).toContain(
      'href="/external/frontline-warehouses?returnTo=%2Farchitecture&amp;staff=devon"',
    );
    expect(html).toContain('href="/frontline/science-wiki?staff=devon"');
    expect(html).toContain('class="architecture-countries"');
    expect(html).toContain(
      'href="https://unstats.un.org/unsd/methodology/m49"',
    );
  });

  it("keeps all six East workspaces and moves Projects and Archives without losing their routes", () => {
    const east = architectureHubViews.find(
      ({ id }) => id === "infrastructure",
    )!;
    expect(east.primary.map(({ id }) => id)).toEqual([
      "executive",
      "planning",
      "quality",
      "legal",
      "digital",
      "services",
    ]);
    expect(east.secondary.map(({ id }) => id)).toEqual(["members", "archives"]);
    expect(east.secondary.find(({ id }) => id === "archives")?.href).toBe(
      "/archives",
    );
    expect(renderDirectory()).toContain('href="/projects?staff=devon"');
  });

  it("uses the same workspace mark for every entrance without changing access classifications", () => {
    renderDirectory();
    for (const hub of architectureHubViews) {
      for (const destination of hub.primary) {
        const html = renderToStaticMarkup(
          <ArchitectureDestinationLink destination={destination} />,
        );
        expect(html).toContain('class="architecture-workspace-icon"');
        expect(html).toContain('src="/images/workspaces/workspace-chunky.png"');
      }
    }
    expect(renderDirectory()).not.toMatch(
      /workspace-chunky-red|architecture-workspace-lock|Controlled access|data-access=/,
    );
    // Signposting must not reclassify Finance or grant specialist permissions.
    const finance = architectureDestinationById.get("finance")!;
    expect(
      architectureHubViews
        .find(({ id }) => id === "finance")!
        .primary.every(
          ({ accessLevel }) => accessLevel === finance.accessLevel,
        ),
    ).toBe(true);
  });

  it("retains environment icon semantics and every hub's canonical tools", () => {
    const html = renderDirectory();
    const anchors = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map(
      ([anchor]) => anchor,
    );
    for (const hub of architectureHubViews) {
      for (const destination of [...hub.knowledge, ...hub.secondary]) {
        const link = anchors.find((anchor) =>
          anchor.includes(`href="${destination.href}?staff=devon"`),
        )!;
        expect(link).toBeDefined();
        expect(link).not.toContain('class="architecture-workspace-icon"');
        expect(link).toContain(
          destination.type === "archive"
            ? "architecture-archive-icon"
            : `environment-icon-${destination.type}`,
        );
      }
    }
    const tools = architectureHubViews
      .flatMap(({ id }) => adminPlatformsForHub(id))
      .map(({ id }) => id)
      .sort();
    expect(
      [...html.matchAll(/data-brand="([^"]+)"/g)].map(([, id]) => id).sort(),
    ).toEqual(tools);
  });

  it("shows five existing open project workspaces with their real workspace destinations and icons", () => {
    const html = renderDirectory();
    expect(architectureProjects).toHaveLength(5);
    expect(new Set(architectureProjects.map(({ code }) => code)).size).toBe(5);
    for (const project of architectureProjects) {
      expect(currentProjects).toContain(project);
      expect(project.access).toBe("Open Internal");
      const link = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].find(
        ([anchor]) =>
          anchor.includes(`href="${projectHref(project)}?staff=devon"`),
      )?.[0];
      expect(link).toContain('class="architecture-workspace-icon"');
      expect(link).not.toContain("/teams");
    }
  });

  it("localises the directory labels", () => {
    for (const text of [
      "Project workspaces",
      "See all",
      "Project management",
      "Meetings and coordination",
      "OUT OF SCOPE",
      "Frontline",
      "Countries",
      "Biology, Chemistry & Physiology Wiki",
      "Regional grouping follows the UN M49 geographic classification.",
      "United States",
    ]) {
      expect(translateText(text, "de"), text).not.toBe(text);
    }
  });

  it("places Portfolio before the projects in a separate strip, with See all last", () => {
    const html = renderDirectory();
    const rail = html.match(
      /<aside class="architecture-jump-groups"[\s\S]*?<\/aside>/,
    )?.[0];
    expect(rail).toContain("Meetings and coordination");
    expect(rail).not.toContain("Project workspaces");
    const strip = html.slice(
      html.indexOf('<section class="architecture-projects"'),
      html.indexOf('<div class="architecture-scope-divider"'),
    );
    const links = hrefs(strip);
    expect(links).toEqual([
      "/projects?staff=devon",
      ...architectureProjects.map(
        (project) => `${projectHref(project)}?staff=devon`,
      ),
      "/projects/current?staff=devon",
    ]);
    expect(strip).toContain("architecture-project-link architecture-portfolio");
    expect(strip).toContain("Portfolio");
    expect(strip).toContain("Project management");
    expect(strip).toContain("See all");
  });

  it("keeps supporting links inside their hubs and only one Jump to heading", () => {
    const html = renderDirectory();
    expect(html).not.toContain("Knowledge &amp; portals");
    expect(html).toContain('<h2 id="architecture-jump-title">Jump to…</h2>');
    expect(html).toContain(
      '<p id="architecture-project-title">Project workspaces</p>',
    );
    expect(html).toContain(
      '<p id="architecture-department-title">Meetings and coordination</p>',
    );
    for (const hub of architectureHubViews) {
      const panel = html
        .slice(html.indexOf(`aria-labelledby="layout-hub-${hub.id}"`))
        .split("</section>")[0];
      for (const destination of [...hub.knowledge, ...hub.secondary]) {
        expect(panel).toContain(`href="${destination.href}?staff=devon"`);
      }
    }
  });
});
