import { describe, expect, it } from "vitest";
import { germanOrientation } from "./de-orientation";
import { translateText } from "./translate";

describe("Welcome and outer demo guidance translations", () => {
  it("keeps English unchanged and includes every orientation message in German", () => {
    for (const [source, german] of Object.entries(germanOrientation)) {
      expect(translateText(source, "en")).toBe(source);
      expect(translateText(source, "de")).toBe(german);
      expect(german.trim()).not.toBe("");
    }
  });

  it("uses unambiguous destinations and plain-language role guidance", () => {
    expect(translateText("← Welcome", "de")).toBe("← Willkommen");
    expect(translateText("All workspaces", "de")).toBe("Alle Arbeitsbereiche");
    expect(translateText("Explore all workspaces & wikis", "de")).toBe(
      "Alle Arbeitsbereiche und Wikis entdecken",
    );
    expect(translateText("Explore as", "de")).toBe("Erkunden als");
    expect(translateText("Switch roles to explore access", "de")).toBe(
      "Rolle wechseln und Zugriffsrechte erkunden",
    );
    expect(translateText("Technology & Engineering Administrator", "de")).toBe(
      "Administrator für Technologie und Engineering",
    );
  });

  it("makes the provenance clear without suggesting live company systems", () => {
    expect(
      translateText("No company data was used to create this demo site.", "de"),
    ).toBe("Für diese Demoseite wurden keine Unternehmensdaten verwendet.");
    expect(translateText("Fictional names & content", "de")).toBe(
      "Fiktive Namen und Inhalte",
    );
    expect(translateText("No company data used", "de")).toBe(
      "Keine Unternehmensdaten verwendet",
    );
    expect(translateText("How was this created?", "de")).toBe(
      "Wie ist diese Demo entstanden?",
    );
    expect(
      translateText(
        "The Microsoft-style screens are simulations — they aren't connected to live SharePoint, Teams or business systems.",
        "de",
      ),
    ).toContain("nicht mit produktivem SharePoint, Teams");
  });

  it("keeps beta state distinct from the proof-of-concept explanation", () => {
    expect(translateText("Proof of concept", "de")).toBe("Proof of Concept");
    expect(translateText("BETA TEST", "de")).toBe("BETATEST");
    const explanation =
      "Ready to explore, but still being refined. Some labels, layouts or interactions may change.";
    expect(translateText(explanation, "de")).toBe(
      "Bereit zum Erkunden, wird aber noch verfeinert. Manche Bezeichnungen, Layouts oder Bedienabläufe können sich noch ändern.",
    );
    expect(translateText(explanation, "de")).not.toMatch(
      /Machbarkeitsnachweis|Proof of Concept/,
    );
  });
});
