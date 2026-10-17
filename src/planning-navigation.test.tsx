import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";
import { libraries, departmentSubmissionsFolder } from "./data/workspace";
import { planningPath } from "./utils/routes";
import { translateText } from "./i18n/translate";

afterEach(() => vi.unstubAllGlobals());

describe("persistent Planning navigation", () => {
  it("retains the department shortcut in every local page, including denied planning", () => {
    for (const page of ["home", ...libraries.map((library) => library.id)]) {
      vi.stubGlobal(
        "location",
        new URL(planningPath(page), "https://example.test"),
      );
      const html = renderToStaticMarkup(<App />);
      const localNav = html.match(
        /<nav aria-label="Workspace navigation">([\s\S]*?)<\/nav>/,
      )?.[1];
      expect(localNav).toContain("JUMP TO");
      expect(localNav).toContain("Department submissions");
      expect(html).toContain('aria-label="Hub navigation"');
    }
  });
  it("restores the submissions context from a direct current-cycle URL", () => {
    vi.stubGlobal(
      "location",
      new URL(
        `/planning/cycles?${new URLSearchParams({ folder: departmentSubmissionsFolder })}`,
        "https://example.test",
      ),
    );
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('aria-current="location"');
    expect(html).toContain("Department submissions");
    expect(html).not.toContain("Planning guidance 2027.docx");
  });
  it("translates the new navigation labels without changing canonical paths", () => {
    expect(translateText("JUMP TO", "de")).toBe("DIREKT ZU");
    expect(translateText("Department submissions", "de")).toBe(
      "Abteilungsbeiträge",
    );
    expect(translateText("Hub navigation", "de")).toBe(
      "Navigation der Funktionsgruppe",
    );
    expect(translateText("Employment & Hiring", "de")).toBe(
      "Personal- und Einstellungsverwaltung",
    );
  });
});
