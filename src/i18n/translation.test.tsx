import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageToggle } from "./Language";
import { translateText } from "./translate";

describe("English and German display language", () => {
  it("uses a standard language toggle with clear language names", () => {
    const markup = renderToStaticMarkup(<LanguageToggle />);
    expect(markup).toContain('lang="en" aria-pressed="true"');
    expect(markup).toContain('lang="de" aria-pressed="false"');
    expect(markup).toContain("English");
    expect(markup).toContain("Deutsch");
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
