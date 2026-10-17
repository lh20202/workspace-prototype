import { describe, expect, it } from "vitest";
import { formatDisplayPunctuation } from "./displayPunctuation";
import { translateText } from "./translate";

describe("display punctuation keeps readable copy separate from canonical values", () => {
  it("renders the two visible FAQ questions as clear sentences, not comma splices", () => {
    expect(
      formatDisplayPunctuation(
        "I work with lots of different tools and platforms — how do they fit in?",
        "en",
      ),
    ).toBe(
      "I work with lots of different tools and platforms. How do they fit in?",
    );
    expect(
      formatDisplayPunctuation(
        "I already work in lots of sites and channels — will this add even more?",
        "en",
      ),
    ).toBe(
      "I already work in lots of sites and channels. Will this add even more?",
    );
  });
  it("removes visual word dashes without joining words or flattening asides", () => {
    expect(
      formatDisplayPunctuation(
        "Organisation-wide planning and day-to-day work",
        "en",
      ),
    ).toBe("Organisation wide planning and day to day work");
    expect(
      formatDisplayPunctuation(
        "The same file — with its existing history — stays available.",
        "en",
      ),
    ).toBe("The same file (with its existing history) stays available.");
    expect(
      formatDisplayPunctuation("Same file — no duplicate copy.", "en"),
    ).toBe("Same file, no duplicate copy.");
    expect(
      formatDisplayPunctuation("Supplier Checklist — Working Copy.docx", "en"),
    ).toBe("Supplier Checklist, Working Copy.docx");
    expect(
      formatDisplayPunctuation(
        "A non‑breaking, co‐authored, inter\u00ADnational note.",
        "en",
      ),
    ).toBe("A non breaking, co authored, international note.");
    expect(formatDisplayPunctuation("Next step —: review.", "en")).toBe(
      "Next step: review.",
    );
  });
  it("keeps the meaning of ranges, dates, negative numbers and missing values", () => {
    expect(
      formatDisplayPunctuation("2025–2030 · 09:00–17:00 · 5-10%", "en"),
    ).toBe("2025 to 2030 · 09:00 to 17:00 · 5 to 10%");
    expect(formatDisplayPunctuation("2025–2030 · 09:00–17:00", "de")).toBe(
      "2025 bis 2030 · 09:00 bis 17:00",
    );
    expect(formatDisplayPunctuation("A–Z · Monday–Friday", "en")).toBe(
      "A to Z · Monday to Friday",
    );
    expect(formatDisplayPunctuation("Modified 2026-10-14", "en")).toBe(
      "Modified 14 Oct 2026",
    );
    expect(formatDisplayPunctuation("Geändert 2026-10-14", "de")).toBe(
      "Geändert 14. Okt. 2026",
    );
    expect(formatDisplayPunctuation("Started 2026-10-14T09:05Z", "en")).toBe(
      "Started 14 Oct 2026, 09:05 UTC",
    );
    expect(formatDisplayPunctuation("2026-02-30", "en")).toBe("2026-02-30");
    expect(formatDisplayPunctuation("Change −15% and -3 points", "en")).toBe(
      "Change minus 15% and minus 3 points",
    );
    expect(formatDisplayPunctuation("Range -5–-1 · £-15 · -€20", "en")).toBe(
      "Range minus 5 to minus 1 · minus £15 · minus €20",
    );
    expect(formatDisplayPunctuation("—", "en")).toBe("Not provided");
    expect(formatDisplayPunctuation("-", "de")).toBe("Keine Angabe");
    expect(formatDisplayPunctuation("Owner: —", "en")).toBe(
      "Owner: Not provided",
    );
    expect(formatDisplayPunctuation(" — ", "en")).toBe(", ");
  });
  it("preserves copyable addresses, routes, record references and flags byte for byte", () => {
    const values = [
      "https://example.test/sales-marketing/wiki?file=PRJ-2026-014#follow-up",
      "www.example-site.test/first-page",
      "example-site.test/first-page",
      "contoso.sharepoint.com/sites/sales-marketing",
      "first-last@example-domain.test",
      "mailto:first-last@example-domain.test",
      "/sales-marketing/wiki?staff=sam&article=shared-working",
      "./source-files/planning-view.tsx",
      "C:\\source-files\\planning-view.tsx",
      "PRJ-2026-014",
      "ARC-PRJ-2024-018",
      "INC-104",
      "planning-11",
      "ISO-9001",
      "F17",
      "--dry-run",
      "-C",
      "--output=source-files/report.txt",
    ];
    for (const language of ["en", "de"] as const)
      for (const value of values)
        expect(
          formatDisplayPunctuation(`Open ${value} — then continue.`, language),
        ).toBe(`Open ${value}, then continue.`);
  });
  it("runs after translation without changing canonical source strings or dictionaries", () => {
    const source =
      "I already work in lots of sites and channels — will this add even more?";
    const translated = translateText(source, "de");
    const rendered = formatDisplayPunctuation(translated, "de");
    expect(rendered).not.toMatch(/[—–-]/);
    expect(translateText(source, "en")).toBe(source);
    expect(translateText(source, "de")).toBe(translated);
    expect(formatDisplayPunctuation("Teams-Kanäle und M365-Suche", "de")).toBe(
      "Kanäle in Teams und Suche in Microsoft 365",
    );
    expect(
      formatDisplayPunctuation(
        "API-, Authentifizierungs- und Integrationsarbeiten",
        "de",
      ),
    ).toBe("Arbeiten an APIs, Authentifizierung und Integrationen");
  });
  it("is idempotent, preserves line breaks, and leaves copy without dashes alone", () => {
    const examples = [
      "Simple planning copy.",
      "The same file — with its existing history — stays available.",
      "2025–2030 and https://example-site.test/current-view",
      "Planning guidance 2027.docx\nRead-only",
      "Change −15% and -3 points",
      "—",
    ];
    for (const language of ["en", "de"] as const)
      for (const example of examples) {
        const once = formatDisplayPunctuation(example, language);
        expect(formatDisplayPunctuation(once, language)).toBe(once);
        expect(once.split("\n")).toHaveLength(example.split("\n").length);
      }
  });
});
