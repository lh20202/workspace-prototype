import { describe, expect, it } from "vitest";
import { translateText } from "./translate";
import {
  adminPlatforms,
  canonicalBrandText,
  externalEnvironments,
} from "../environments/catalog";
import { wikiFigures } from "../wiki/WikiFigure";

describe("final German semantic interpretation", () => {
  it("conveys organisational finance, accounting and access rather than literal English meanings", () => {
    const labels = {
      "Purse Strings": "Geldströme",
      "Org Central": "Zentrale Funktionen",
      "Income & Booking": "Einnahmen & Verbuchung",
      "Admin logins": "Admin-Zugänge",
      "Company Archives": "Unternehmensarchiv",
      "Personnel Admin": "Personalverwaltung",
      "Purchasing & Suppliers": "Einkauf & Lieferanten",
      "Security Engineering": "IT-Sicherheit",
    };
    for (const [source, expected] of Object.entries(labels))
      expect(translateText(source, "de")).toBe(expected);
    expect(translateText("Purse Strings", "de")).not.toMatch(
      /Geldbeutel|Finanzabteilung/,
    );
  });
  it("interprets new preview content while leaving fictional brands intact in both languages", () => {
    for (const platform of adminPlatforms) {
      expect(translateText(platform.name, "de")).toBe(platform.name);
      expect(translateText(platform.name, "en")).toBe(platform.name);
      expect(translateText(platform.category, "de")).not.toBe(
        platform.category,
      );
    }
    for (const environment of externalEnvironments.filter(
      (entry) => !entry.variant,
    ))
      expect(translateText(environment.name, "de")).not.toBe(environment.name);
    for (const copy of [
      "Explore what your new Digital Workspaces could look and feel like.",
      "This linked environment is represented at a high level in this demo.",
      "In development — a separate experience for frontline crew with the information and tools they need for day-to-day operations.",
      "Back to demo",
    ])
      expect(translateText(copy, "de")).not.toBe(copy);
    for (const copy of Object.values(wikiFigures).flatMap((entry) => [
      entry.title,
      entry.description,
      entry.caption,
    ]))
      expect(translateText(copy, "de")).not.toBe(copy);
  });
  it("consolidates visible legacy brands after interpreting the original source", () => {
    expect(
      canonicalBrandText(
        "Salesforce / HubSpot / Oracle NetSuite / Planable / Freshservice",
      ),
    ).toBe("Relovia / Relovia / Velora / Slotline / Teralink");
    expect(translateText("Open in Planable", "en")).toBe("Open in Slotline");
    expect(translateText("Open in Planable", "de")).toBe("In Slotline öffnen");
    expect(translateText("Post options for Maya Chen", "de")).toBe(
      "Beitragsoptionen für Maya Chen",
    );
    expect(translateText("Reply to Maya Chen", "de")).toBe(
      "Maya Chen antworten",
    );
  });
});
