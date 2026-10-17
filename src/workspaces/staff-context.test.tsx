import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AudienceApp from "../audience/AudienceApp";
import FinanceApp from "../finance/FinanceApp";
import ProjectsApp from "../projects/ProjectsApp";

afterEach(() => vi.unstubAllGlobals());

function render(Component: ComponentType, route: string) {
  vi.stubGlobal("location", new URL(route, "https://example.test"));
  vi.stubGlobal("sessionStorage", { getItem: () => "maya" });
  return renderToStaticMarkup(createElement(Component));
}

function hrefs(html: string) {
  return [...html.matchAll(/href="([^"]+)"/g)].map((match) =>
    match[1].replaceAll("&amp;", "&"),
  );
}

describe("workspace navigation retains the explicit preview colleague", () => {
  it("keeps the research colleague on library, register and cross-workspace links", () => {
    const html = render(
      AudienceApp,
      "/audience-innovation?staff=taylor&search=old",
    );
    expect(html).toContain('aria-label="Signed in as Taylor Brooks"');
    const links = hrefs(html);
    expect(links).toContain("/audience-innovation/research?staff=taylor");
    expect(links).toContain("/audience-innovation/register?staff=taylor");
    expect(links).toContain("#audience-main");
    expect(
      links.filter((href) => href.startsWith("/audience-innovation")),
    ).not.toContainEqual(expect.stringContaining("search=old"));
  });

  it("keeps finance navigation, displayed identity and access returns aligned with Sam", () => {
    const html = render(FinanceApp, "/financial-operations?staff=sam");
    expect(html).toContain('aria-label="Signed in as Sam Patel"');
    expect(hrefs(html)).toContain(
      "/financial-operations/planning-documents?staff=sam",
    );
    const denied = render(
      FinanceApp,
      "/financial-operations/planning/restricted-planning?staff=sam",
    );
    expect(denied).toContain("Access required");
    expect(hrefs(denied)).toContain("/financial-operations?staff=sam");
    expect(hrefs(denied).some((href) => href.includes("person=sam"))).toBe(
      true,
    );
  });

  it("keeps Sam's restricted project membership when following a real project link", () => {
    const list = render(ProjectsApp, "/projects/current?staff=sam");
    const projectLink = hrefs(list).find((href) =>
      href.startsWith("/projects/PRJ-2026-038?"),
    );
    expect(projectLink).toBe("/projects/PRJ-2026-038?staff=sam");
    const project = render(ProjectsApp, projectLink!);
    expect(project).toContain('aria-label="Signed in as Sam Patel"');
    expect(project).not.toContain('class="access-boundary');
    const documents = hrefs(project).find((href) =>
      href.startsWith("/projects/PRJ-2026-038/documents?"),
    );
    expect(documents).toBe("/projects/PRJ-2026-038/documents?staff=sam");
    const files = render(ProjectsApp, documents!);
    expect(files).toContain("Project Documents");
    expect(files).not.toContain('class="access-boundary');
    const denied = render(
      ProjectsApp,
      "/projects/PRJ-2026-038/documents?staff=maya",
    );
    expect(denied).toContain("Access required");
    expect(denied).not.toContain("Project Brief.docx");
  });

  it("preserves existing link destinations when no explicit colleague is supplied", () => {
    const research = hrefs(render(AudienceApp, "/audience-innovation"));
    const finance = hrefs(render(FinanceApp, "/financial-operations"));
    const projects = hrefs(render(ProjectsApp, "/projects/current"));
    expect(research).toContain("/audience-innovation/research");
    expect(finance).toContain("/financial-operations/planning-documents");
    expect(projects).toContain("/projects/PRJ-2026-038");
  });
});
