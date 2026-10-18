import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import Directory from "./Directory";
import {
  architectureDestinationById,
  financeJumpLinks,
  personnelDestinations,
} from "./architectureDestinations";
import {
  architectureHubViews,
  architectureLayoutOptions,
  architectureLayoutStorageKey,
  architectureProjects,
  destinationDescriptions,
  readArchitectureLayout,
  saveArchitectureLayout,
  type ArchitectureLayout,
} from "./architectureLayoutModel";
import { ArchitectureDestinationLink } from "./ArchitectureLayouts";
import { currentProjects, projectHref } from "../projects/data";
import { departments } from "../coordination/data";
import { departmentPreviewHref } from "../teams/departmentPreview";
import { adminPlatformsForHub } from "../environments/catalog";
import { translateText } from "../i18n/translate";

afterEach(() => vi.unstubAllGlobals());

function renderLayout(layout?: ArchitectureLayout) {
  vi.stubGlobal(
    "location",
    new URL("https://example.test/architecture?staff=devon"),
  );
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) =>
      key === architectureLayoutStorageKey ? (layout ?? null) : "devon",
  });
  return renderToStaticMarkup(<Directory />);
}
function hrefs(html: string) {
  return [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
}

describe("architecture layout comparison", () => {
  it("defaults to Layout 1 and has exactly three numbered presentation choices", () => {
    const html = renderLayout();
    expect(html).toContain('<option value="workspaces-first" selected=""');
    expect(html).toContain('aria-label="Architecture layout"');
    expect(architectureLayoutOptions.map(({ label }) => label)).toEqual([
      "Layout 1",
      "Layout 2",
      "Layout 3",
    ]);
  });

  it("validates session state and works without storage", () => {
    for (const { value } of architectureLayoutOptions) {
      vi.stubGlobal("sessionStorage", { getItem: () => value });
      expect(readArchitectureLayout()).toBe(value);
    }
    for (const removed of ["balanced", "unrecognised"]) {
      vi.stubGlobal("sessionStorage", { getItem: () => removed });
      expect(readArchitectureLayout()).toBe("workspaces-first");
    }
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("unavailable");
      },
      setItem: () => {
        throw new Error("unavailable");
      },
    });
    expect(readArchitectureLayout()).toBe("workspaces-first");
    expect(() => saveArchitectureLayout("directory")).not.toThrow();
  });

  it("persists only the layout preference, leaving role and language state untouched", () => {
    const values = new Map([
      ["workspace-language-session", "de"],
      ["workspace-staff-session", "devon"],
    ]);
    const before = [...values.entries()];
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });
    for (const { value } of architectureLayoutOptions) {
      saveArchitectureLayout(value);
      expect(readArchitectureLayout()).toBe(value);
      expect(
        [...values.entries()].filter(
          ([key]) => key !== architectureLayoutStorageKey,
        ),
      ).toEqual(before);
    }
  });

  it.each(["classic", "workspaces-first", "directory"] as const)(
    "%s keeps every destination, with the same explicit role context",
    (layout) => {
      const classicHrefs = new Set(hrefs(renderLayout("classic")));
      const alternativeHrefs = hrefs(renderLayout(layout));
      for (const href of classicHrefs) expect(alternativeHrefs).toContain(href);
      expect(new Set(alternativeHrefs)).toEqual(classicHrefs);
      for (const hub of architectureHubViews) {
        for (const destination of [
          ...hub.primary,
          ...hub.knowledge,
          ...hub.secondary,
        ]) {
          expect(alternativeHrefs).toContain(`${destination.href}?staff=devon`);
        }
      }
      for (const department of departments) {
        expect(alternativeHrefs).toContain(
          departmentPreviewHref(department.id).replaceAll("&", "&amp;"),
        );
      }
    },
  );

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
    expect(renderLayout("workspaces-first")).toContain(
      'href="/projects?staff=devon"',
    );
  });

  it("uses one controlled workspace mark for CEO, Personnel, Council, Welfare and the four Finance entrances", () => {
    renderLayout();
    const expected = new Set([
      architectureDestinationById.get("executive")!.href,
      ...personnelDestinations.controlled.map(({ href }) => href),
      ...financeJumpLinks.map(({ href }) => href),
    ]);
    for (const hub of architectureHubViews) {
      for (const destination of hub.primary) {
        const html = renderToStaticMarkup(
          <ArchitectureDestinationLink destination={destination} />,
        );
        expect(
          html.includes('class="restricted-workspace-icon"'),
          destination.label,
        ).toBe(expected.has(destination.href));
        expect(html).toContain('class="workspace-icon"');
      }
    }
    expect(
      renderLayout("workspaces-first").match(
        /class="restricted-workspace-icon"/g,
      ),
    ).toHaveLength(8);
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

  it.each(["classic", "workspaces-first", "directory"] as const)(
    "%s retains environment icon semantics and every hub's canonical tools",
    (layout) => {
      const html = renderLayout(layout);
      const anchors = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map(
        ([anchor]) => anchor,
      );
      for (const hub of architectureHubViews) {
        for (const destination of [...hub.knowledge, ...hub.secondary]) {
          const link = anchors.find((anchor) =>
            anchor.includes(`href="${destination.href}?staff=devon"`),
          )!;
          expect(link).toBeDefined();
          expect(link).not.toContain('class="workspace-icon"');
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
      ).toEqual(layout === "workspaces-first" ? [...new Set(tools)] : tools);
    },
  );

  it("shows five existing open project workspaces with their real workspace destinations and icons", () => {
    const html = renderLayout("workspaces-first");
    expect(architectureProjects).toHaveLength(5);
    expect(new Set(architectureProjects.map(({ code }) => code)).size).toBe(5);
    for (const project of architectureProjects) {
      expect(currentProjects).toContain(project);
      expect(project.access).toBe("Open Internal");
      const link = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].find(
        ([anchor]) =>
          anchor.includes(`href="${projectHref(project)}?staff=devon"`),
      )?.[0];
      expect(link).toContain('class="workspace-icon"');
      expect(link).not.toContain("/teams");
    }
  });

  it("keeps numbered labels in both languages and localises the stacked descriptions", () => {
    for (const { label } of architectureLayoutOptions) {
      expect(translateText(label, "de")).toBe(label);
    }
    for (const text of [
      "Architecture layout",
      "Project workspaces",
      "All projects",
      ...Object.values(destinationDescriptions),
    ]) {
      expect(translateText(text, "de"), text).not.toBe(text);
    }
    for (const hub of architectureHubViews) {
      for (const destination of [
        ...hub.primary,
        ...hub.knowledge,
        ...hub.secondary,
      ]) {
        expect(
          destinationDescriptions[destination.id],
          destination.label,
        ).toBeTruthy();
      }
    }
  });

  it.each(architectureLayoutOptions)(
    "$label keeps supporting links inside their hubs and only one Jump to heading",
    ({ value }) => {
      const html = renderLayout(value);
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
    },
  );
});
