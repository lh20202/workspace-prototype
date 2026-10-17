import { describe, expect, it } from "vitest";
import {
  germanDisplayPunctuation,
  germanDisplayPhraseRewrites,
} from "./germanDisplayPunctuation";

describe("professional German display phrases without hyphens", () => {
  it.each([
    ["E-Mail-Adresse", "Mailadresse"],
    ["E-Mail-Adressen", "Mailadressen"],
    ["E-Mail-Benachrichtigungen", "Benachrichtigungen per Mail"],
    ["in den Teams-Kanälen", "in den Kanälen in Teams"],
    ["des Teams-Kanals", "des Kanals in Teams"],
    ["OneDrive-Link", "Link zu OneDrive"],
    ["in SharePoint-Arbeitsbereichen", "in Arbeitsbereichen in SharePoint"],
    [
      "Personal-, Kunden- oder Transaktionsdaten",
      "Personaldaten, Kundendaten oder Transaktionsdaten",
    ],
    ["Planungs- und Berichtsaufgaben", "Planungsaufgaben und Berichtsaufgaben"],
    [
      "API-, Authentifizierungs- und Integrationsarbeiten",
      "Arbeiten an APIs, Authentifizierung und Integrationen",
    ],
    [
      "Schwierig ist das Graph-Throttling.",
      "Schwierig ist die Drosselung von Graph.",
    ],
    [
      "Anpassung des Untertitel-Timings",
      "Anpassung der Zeitabstimmung der Untertitel",
    ],
    ["LGBTQIA+-Netzwerk", "Netzwerk für LGBTQIA+"],
  ])("rewrites %s naturally", (source, expected) => {
    expect(germanDisplayPunctuation(source)).toBe(expected);
    expect(expected).not.toMatch(/[-‐‑‒–—―]/u);
  });
  it("recognises typographic word hyphens and keeps unknown identifiers unchanged", () => {
    expect(germanDisplayPunctuation("Teams‑Kanäle und OneDrive‐Links")).toBe(
      "Kanäle in Teams und Links zu OneDrive",
    );
    expect(germanDisplayPunctuation("PRJ-2026-014 · digital-F17")).toBe(
      "PRJ-2026-014 · digital-F17",
    );
  });
  it("does not introduce punctuation or mutate the canonical phrase inventory", () => {
    for (const [source, expected] of Object.entries(
      germanDisplayPhraseRewrites,
    )) {
      expect(expected).not.toMatch(/[-‐‑‒–—―]/u);
      expect(germanDisplayPunctuation(source)).toBe(expected);
    }
  });
});
