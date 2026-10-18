import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider, LanguageToggle } from "./Language";
import { translateText } from "./translate";

describe("English and German display language", () => {
  it("uses a standard language toggle with clear language names", () => {
    const markup = renderToStaticMarkup(<LanguageToggle />);
    expect(markup).toMatch(/lang="en"[^>]*aria-pressed="true"/);
    expect(markup).toMatch(/lang="de"[^>]*aria-pressed="false"/);
    expect(markup).toContain('aria-label="English"');
    expect(markup).toContain('aria-label="Deutsch"');
    expect(markup).toContain(">ENG</button>");
    expect(markup).toContain(">DE</button>");
  });
  it("starts a fresh session in English regardless of an old saved German preference", () => {
    const oldPreference = vi.fn(() => "de");
    const sessionPreference = vi.fn(() => null);
    vi.stubGlobal("localStorage", { getItem: oldPreference });
    vi.stubGlobal("sessionStorage", { getItem: sessionPreference });
    try {
      const markup = renderToStaticMarkup(
        <LanguageProvider>
          <LanguageToggle />
        </LanguageProvider>,
      );
      expect(markup).toMatch(/lang="en"[^>]*aria-pressed="true"/);
      expect(oldPreference).not.toHaveBeenCalled();
      expect(sessionPreference).toHaveBeenCalledWith(
        "workspace-language-session",
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it("retains a deliberate German selection during the same session", () => {
    vi.stubGlobal("sessionStorage", { getItem: () => "de" });
    try {
      const markup = renderToStaticMarkup(
        <LanguageProvider>
          <LanguageToggle />
        </LanguageProvider>,
      );
      expect(markup).toMatch(/lang="de"[^>]*aria-pressed="true"/);
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it("translates product navigation and professional business copy", () => {
    expect(translateText("Digital Workspaces", "de")).toBe(
      "Digitale Arbeitsbereiche",
    );
    expect(translateText("Access required", "de")).toBe("Zugriff erforderlich");
    expect(
      translateText(
        "Service Desk will route the request for business authorisation and implement or escalate access where required.",
        "de",
      ),
    ).toBe(
      "Der Service Desk holt die fachliche Genehmigung ein und setzt den Zugriff bei Bedarf um oder eskaliert die Anfrage.",
    );
  });
  it("translates hub headings and short workspace labels consistently", () => {
    const hubLabels = {
      North: "Nord",
      East: "Ost",
      West: "West",
      Laboratory: "Labor",
      Studio: "Studio",
      Acquisitions: "Akquise",
      Relations: "Beziehungen",
      CEO: "CEO",
      Planning: "Planung",
      Projects: "Projekte",
      Quality: "Qualität",
      Legal: "Recht",
      Services: "Services",
      Tech: "Technik",
      Archives: "Archiv",
      Workforce: "Belegschaft",
      Curriculum: "Curriculum",
      Network: "Netzwerk",
      Personnel: "Personal",
      "Workers' Union": "Arbeitnehmervertretung",
      Welfare: "Fürsorge",
      South: "Süd",
      "Media Library": "Medienbibliothek",
      "Membership Portal": "Mitgliederportal",
      "-> $": "-> $",
      "$ ->": "$ ->",
      Value: "Wert",
      Vault: "Tresor",
      "Jump to…": "Direkt zu…",
      "Meetings and coordination": "Besprechungen und Koordination",
      "Crew portal": "Crew-Portal",
      "Advertising, Marketing & Sales Wiki":
        "Advertising, Marketing & Sales Wiki",
    };
    for (const [english, german] of Object.entries(hubLabels)) {
      expect(translateText(english, "de")).toBe(german);
      expect(translateText(english, "en")).toBe(english);
    }
    expect(translateText("Staff Service Operations workspace", "de")).toBe(
      "Arbeitsbereich Services",
    );
    expect(translateText("Services workspace", "de")).toBe(
      "Arbeitsbereich Services",
    );
    expect(translateText("Legal workspace", "de")).toBe("Arbeitsbereich Recht");
    expect(translateText("Relations workspace", "de")).toBe(
      "Arbeitsbereich Beziehungen",
    );
    expect(translateText("Customer Care & Relations workspace", "de")).toBe(
      "Arbeitsbereich Beziehungen zu Auftraggebern und Kunden",
    );
    expect(translateText("Services → Purchasing & Suppliers", "de")).toBe(
      "Services → Einkauf & Lieferanten",
    );
    expect(translateText("Search -> $", "de")).toBe("-> $ durchsuchen");
    expect(translateText("$ -> documents", "de")).toBe("Dokumente – $ ->");
    for (const legacy of ["Money In", "Money-In", "Income & Reconciliation"])
      expect(translateText(legacy, "de")).toBe("-> $");
    for (const legacy of ["Money Out", "Money-Out", "Payments & Close"])
      expect(translateText(legacy, "de")).toBe("$ ->");
  });
  it("translates confidential personnel work and independent representation clearly", () => {
    const protectedLabels = {
      "Strictly confidential": "Streng vertraulich",
      "Strictly confidential; protected areas require separate participation":
        "Streng vertraulich; geschützte Bereiche erfordern eine gesonderte Berechtigung",
      "Welfare & Employee Representation":
        "Mitarbeitendenfürsorge und Personalvertretung",
      "Welfare & Employee Representation workspace":
        "Arbeitsbereich Mitarbeitendenfürsorge und Personalvertretung",
      "Welfare & Psychosocial Support":
        "Fürsorge und psychosoziale Unterstützung",
      "Safeguarding & Complaints": "Schutz und Beschwerdeverfahren",
      "Employee Representation": "Personalvertretung",
    };
    for (const [english, german] of Object.entries(protectedLabels)) {
      expect(translateText(english, "de")).toBe(german);
    }
    expect(translateText("Support Pathways — Working Method.docx", "de")).toBe(
      "Unterstützungswege – Arbeitsverfahren.docx",
    );
    expect(translateText("Approved outputs/2026 consultation", "de")).toBe(
      "Freigegebene Ergebnisse/Konsultation 2026",
    );
    expect(
      translateText(
        "Employee representation has independent membership. Welfare participation does not grant access to internal representative work.",
        "de",
      ),
    ).toBe(
      "Die Personalvertretung hat einen eigenen Teilnehmendenkreis. Eine Berechtigung für die Mitarbeitendenfürsorge erlaubt keinen Zugriff auf die interne Arbeit der Personalvertretung.",
    );
    expect(translateText("/services", "de")).toBe("/services");
    expect(translateText("/welfare-representation", "de")).toBe(
      "/welfare-representation",
    );
    expect(translateText("/employee-council", "de")).toBe("/employee-council");
  });
  it("keeps proper names, routes, IDs and English source strings intact", () => {
    for (const value of [
      "Maya Chen",
      "PRJ-2026-014",
      "/teams?staff=maya&channel=general",
      "EXP-118",
      "https://example.test",
    ]) {
      expect(translateText(value, "de")).toBe(value);
    }
    expect(translateText("Access required", "en")).toBe("Access required");
  });
  it("handles dynamic dates, counts and prefilled access messages naturally", () => {
    expect(translateText("30 October 2026", "de")).toBe("30. Oktober 2026");
    expect(translateText("14 Oct 2026", "de")).toBe("14. Okt. 2026");
    expect(translateText("2 files", "de")).toBe("2 Dateien");
    expect(translateText("1 reply", "de")).toBe("1 Antwort");
    expect(translateText("4 documents", "de")).toBe("4 Dokumente");
    expect(translateText("Search Current Production", "de")).toBe(
      "Aktuelle Produktion durchsuchen",
    );
    expect(translateText("I need access to General.", "de")).toBe(
      "Ich benötige Zugriff auf den Bereich „Allgemein“.",
    );
    expect(
      translateText(
        "Access to General is time-sensitive and the workspace focal point is unavailable.",
        "de",
      ),
    ).toBe(
      "Der Zugriff auf „Allgemein“ ist zeitkritisch. Die zuständige Ansprechperson des Arbeitsbereichs ist nicht erreichbar.",
    );
  });
  it("preserves spacing around translated React fragments", () => {
    expect(translateText("  Access required ", "de")).toBe(
      "  Zugriff erforderlich ",
    );
  });
});
