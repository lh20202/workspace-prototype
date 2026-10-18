import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { germanAccessMatrix } from "./de-access-matrix";
import { translateText } from "./translate";
import { displayText } from "./displayText";
import { protectedReviewSummaries } from "../finance/protectedReviews";
import { protectedSubjects } from "../finance/data";
import { protectedTopics, protectedHref } from "../content/data";
import { controlledResourceInventory } from "../access/controlledResources";
import { previewRoles } from "../access/policy";
import FinanceApp from "../finance/FinanceApp";
import ContentApp from "../content/ContentApp";
import ProjectsApp from "../projects/ProjectsApp";
import { allProjects } from "../projects/data";
import { PreviewRoleProvider } from "../components/PreviewRoleContext";

const german = (source: string) => displayText(source, "de");
const generic = (copy: string) =>
  expect(copy).not.toMatch(/\b(?:Teams|SharePoint|Microsoft|M365)\b/);
afterEach(() => vi.unstubAllGlobals());
function render(App: ComponentType, href: string, roleId: string) {
  const url = new URL(href, "https://example.test");
  url.searchParams.set("staff", roleId);
  vi.stubGlobal("location", url);
  vi.stubGlobal("sessionStorage", { getItem: () => roleId, setItem: () => {} });
  return renderToStaticMarkup(
    createElement(PreviewRoleProvider, null, createElement(App)),
  );
}
function exposedCopy(html: string) {
  const content = html.replace(
    /<(?:style|script)\b[^>]*>[\s\S]*?<\/(?:style|script)>/gi,
    "",
  );
  const decode = (source: string) =>
    source
      .replaceAll("&amp;", "&")
      .replaceAll("&quot;", '"')
      .replaceAll("&#x27;", "'");
  return [
    ...Array.from(content.matchAll(/>([^<]+)</g), (match) => match[1]),
    ...Array.from(
      content.matchAll(
        /(?:aria-label|aria-description|title|alt|placeholder)="([^"]*)"/g,
      ),
      (match) => match[1],
    ),
  ]
    .map((source) => german(decode(source)))
    .join(" ");
}

describe("German access-matrix review after the English surfaces were final", () => {
  it("keeps reviewed final precedence without changing canonical English data or URLs", () => {
    for (const [source, value] of Object.entries(germanAccessMatrix)) {
      expect(translateText(source, "de"), source).toBe(value);
      expect(translateText(source, "en"), source).toBe(source);
      generic(german(source));
    }
    for (const entry of controlledResourceInventory)
      expect(german(entry.href)).toBe(entry.href);
  });

  it("covers all 23 Finance subject labels, specialist role names and access distinctions", () => {
    const subjects = Object.values(protectedSubjects).flat();
    expect(subjects).toHaveLength(23);
    for (const [, label] of subjects) {
      expect(german(label), label).not.toBe(label);
      generic(german(label));
    }
    for (const role of previewRoles) {
      if (role.id === "taylor") expect(german(role.role)).toBe("Demo User");
      else expect(german(role.role), role.role).not.toBe(role.role);
      generic(german(role.role));
    }
    expect(german("Draft Management Forecast")).toBe(
      "Entwurf der Managementprognose",
    );
    expect(german("High-Value Payment Review")).toBe(
      "Prüfung von Zahlungen mit hohem Betrag",
    );
    expect(german("Work item")).toBe("Vorgang");
    expect(german("Planning coordination")).toBe("Planungskoordination");
    expect(german("Confidential")).toBe("Vertraulich");
    expect(german("Strictly confidential")).toBe("Streng vertraulich");
    expect(german("Try another preview role")).toBe(
      "Andere Vorschaurolle ausprobieren",
    );
    expect(german("Access required")).toBe("Zugriff erforderlich");
    expect(german("Advertising, Marketing & Sales Wiki")).toBe(
      "Advertising, Marketing & Sales Wiki",
    );
  });

  it("translates every actual Finance review while keeping denied views free of review content", () => {
    expect(Object.keys(protectedReviewSummaries)).toHaveLength(13);
    for (const [subjectId, summary] of Object.entries(
      protectedReviewSummaries,
    )) {
      const entry = controlledResourceInventory.find(
        (candidate) =>
          candidate.resource?.kind === "area" &&
          candidate.resource.workspaceId === "finance" &&
          candidate.resource.areaId === subjectId,
      )!;
      expect(entry.expectedRoleIds.length).toBeGreaterThan(0);
      const allowed = exposedCopy(
        render(FinanceApp, entry.href, entry.expectedRoleIds[0]),
      );
      expect(allowed, subjectId).toContain(german(summary));
      expect(allowed).not.toContain(summary);
      expect(allowed).toContain("Zugehörige Arbeitsdokumente");
      expect(allowed).toContain("Vorgang");
      expect(allowed).not.toContain("Andere Vorschaurolle ausprobieren");
      generic(allowed);
      const denied = exposedCopy(render(FinanceApp, entry.href, "taylor"));
      expect(denied, subjectId).toContain("Zugriff erforderlich");
      expect(denied).toContain("Andere Vorschaurolle ausprobieren");
      expect(denied).not.toContain(german(summary));
      expect(denied).not.toContain("Zugehörige Arbeitsdokumente");
      generic(denied);
    }
  });

  it("translates the canonical purposes on all three authorised project security views", () => {
    const entries = controlledResourceInventory.filter(
      (entry) =>
        entry.category === "project-security" &&
        entry.expectedRoleIds.length > 0,
    );
    expect(entries.map((entry) => entry.securityProjectId).sort()).toEqual([
      "PRJ-2020-006",
      "PRJ-2026-014",
      "PRJ-2026-042",
    ]);
    for (const entry of entries) {
      const project = allProjects.find(
        (candidate) => candidate.code === entry.securityProjectId,
      )!;
      const html = render(ProjectsApp, entry.href, "devon");
      const displayed = exposedCopy(html);
      expect(german(project.purpose)).not.toBe(project.purpose);
      expect(displayed).toContain(german(project.purpose));
      expect(displayed).not.toContain(project.purpose);
      expect(displayed).toContain("Sicherheitsprüfung der Produktionsumgebung");
      expect(displayed).not.toContain("Andere Vorschaurolle ausprobieren");
      generic(displayed);
      if (project.archived) {
        expect(displayed).toContain("Schreibgeschützt");
        expect(html).not.toContain("New document");
        expect(html).not.toContain("Upload");
      }
    }
  });

  it("explains the commercial proposal without implying supplier payment authority", () => {
    const topic = protectedTopics.find(
      (item) => item.id === "commercial-proposal",
    )!;
    const href = protectedHref(topic);
    const allowed = exposedCopy(render(ContentApp, href, "nadia"));
    for (const label of [
      "Production package",
      "Production partner",
      "Deliverables",
      "Supporting production documents",
    ])
      expect(allowed).toContain(german(label));
    expect(allowed).toContain("Prüfen Sie den vorgesehenen Produktionsumfang");
    expect(allowed).toContain(
      "Die Freigabe von Lieferantenzahlungen bleibt beim Finanzbereich.",
    );
    expect(allowed).toContain("Vertraulich");
    expect(allowed).not.toContain("Andere Vorschaurolle ausprobieren");
    generic(allowed);
    const denied = exposedCopy(render(ContentApp, href, "taylor"));
    expect(denied).toContain("Zugriff erforderlich");
    expect(denied).toContain("Andere Vorschaurolle ausprobieren");
    expect(denied).not.toContain("Zugehörige Produktionsdokumente");
    expect(denied).not.toContain(
      "Die Freigabe von Lieferantenzahlungen bleibt beim Finanzbereich.",
    );
    generic(denied);
  });
});
