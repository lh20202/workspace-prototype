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
