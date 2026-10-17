import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import FunctionalApp from "./FunctionalApp";
import { staff } from "../intranet/catalog";
import { configById } from "./config";
import { functionalFileHref } from "./siteArchitecture";

afterEach(() => vi.unstubAllGlobals());

function render(path: string, sessionPerson = "maya") {
  vi.stubGlobal("location", new URL(path, "https://example.test"));
  const setItem = vi.fn();
  vi.stubGlobal("sessionStorage", {
    getItem: () => sessionPerson,
    setItem,
  });
  return {
    html: renderToStaticMarkup(createElement(FunctionalApp)),
    setItem,
  };
}

describe("strict Employment workspace membership", () => {
  it("denies every ordinary non-member before exposing home work, navigation or documents", () => {
    const files = configById.get("employment")!.files;
    for (const person of staff.filter((person) => person.id !== "jamie")) {
      for (const route of [
        "/employment-admin",
        "/employment-admin/recruitment-administration?file=people-F3",
        "/employment-admin/employment-operations?file=people-F7",
        "/employment-admin/systems/workday",
        "/employment-admin/protected/candidate-assessments",
      ]) {
        const { html } = render(route, person.id);
        expect(html).toContain("Access required");
        expect(html).toContain("Strictly confidential");
        expect(html).toContain("Contact focal point");
        expect(html).toContain("Raise urgent access request");
        expect(html).toContain("Jamie Ellis");
        expect(html).not.toContain(
          'aria-label="Employment &amp; Hiring Administration navigation"',
        );
        expect(html).not.toContain("Document preview");
        expect(html).not.toContain("Recruitment readiness");
        for (const file of files) expect(html).not.toContain(file.name);
      }
    }
  });

  it("allows Jamie's coordination methods while keeping narrower individual records denied", () => {
    const { html: home } = render("/employment-admin?staff=jamie");
    expect(home).toContain("Recruitment Administration");
    expect(home).toContain("Employment Operations");
    expect(home).not.toContain('class="access-boundary');
    const { html: library } = render(
      `${functionalFileHref(configById.get("employment")!, "people-F3")}&staff=jamie`,
    );
    expect(library).toContain("Role &amp; Selection Criteria.docx");
    expect(library).not.toContain('class="access-boundary');
    for (const subject of configById.get("employment")!.protected) {
      const { html } = render(
        `/employment-admin/protected/${subject.id}?staff=jamie`,
      );
      expect(html).toContain("Access required");
      expect(html).toContain("Strictly confidential");
      expect(html).not.toContain("Document preview");
    }
  });

  it("preserves explicit Jamie context through local navigation, files, systems and denied-area returns", () => {
    const { html, setItem } = render("/employment-admin?staff=jamie");
    const localMarkup = html.slice(html.indexOf('class="functional-layout"'));
    const localLinks = [...localMarkup.matchAll(/href="([^"]+)"/g)]
      .map((match) => match[1].replaceAll("&amp;", "&"))
      .filter((href) => href.startsWith("/employment-admin"));
    // Local links cover libraries, protected subjects, home, handoffs and
    // recent working documents without changing the browser's saved identity.
    expect(localLinks.length).toBeGreaterThan(5);
    for (const href of localLinks) {
      expect(
        new URL(href, "https://example.test").searchParams.get("staff"),
      ).toBe("jamie");
    }
    const { html: denied } = render(
      "/employment-admin/protected/employee-records?staff=jamie",
    );
    expect(denied).toContain('href="/employment-admin?staff=jamie"');
    const { html: system } = render(
      "/employment-admin/systems/workday?staff=jamie",
    );
    expect(system).toContain('href="/employment-admin?staff=jamie"');
    expect(setItem).not.toHaveBeenCalled();
  });

  it("does not turn an invalid explicit identity or unrelated staff selection into employment membership", () => {
    for (const query of ["staff=unknown", "staff=maya", "staff=elena"]) {
      const { html } = render(`/employment-admin?${query}`, "jamie");
      expect(html).toContain("Access required");
      expect(html).not.toContain(
        'aria-label="Employment &amp; Hiring Administration navigation"',
      );
    }
  });
});
