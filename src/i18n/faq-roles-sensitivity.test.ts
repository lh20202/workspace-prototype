import { describe, expect, it } from "vitest";
import { germanFAQRolesSensitivity } from "./de-faq-roles-sensitivity";
import { translateText } from "./translate";
import {
  creationExplanation,
  workspaceFAQQuestions,
  workspaceFAQExampleHref,
} from "../components/workspaceFAQContent";
import { proofOfConceptInfoText } from "../components/DemoInfo";
import { siteAdministrationOptions } from "../components/SiteSettingsButton";
import { previewRoles, previewRoleGroups } from "../access/policy";
import { sensitivityLabels } from "../sharepoint/sensitivity";

const german = (source: string) => translateText(source, "de");

describe("final staff-facing German interpretation", () => {
  it("explains an exploratory proof of concept without introducing another development concept", () => {
    expect(german(proofOfConceptInfoText)).toContain(
      "bevor etwas endgültig festgelegt wird",
    );
    expect(german(proofOfConceptInfoText)).toContain(
      "im Alltag funktionieren könnten",
    );
    expect(german(proofOfConceptInfoText)).not.toMatch(/Prototyp|Methodologie/);
    expect(german(creationExplanation)).toContain(
      "mit Unterstützung von KI programmiert",
    );
    expect(german(creationExplanation)).toContain("keine Unternehmensdaten");
    expect(german(creationExplanation)).toContain(
      "weder mit Microsoft 365 noch mit anderen produktiven Geschäftssystemen verbunden",
    );
  });

  it("keeps personal storage outside shared work and describes human moderation in two sentences", () => {
    const personalDriveQuestions = workspaceFAQQuestions.filter((entry) =>
      ["personal-drives", "personal-drive-shared"].includes(entry.id),
    );
    for (const entry of personalDriveQuestions) {
      expect(german(entry.question)).toMatch(
        /persönliche[nr]? Speicherbereich/,
      );
      expect(
        german(entry.answer)
          .split(/[.!?]+/)
          .filter((part) => part.trim()),
      ).toHaveLength(2);
    }
    expect(
      german(
        workspaceFAQQuestions.find((entry) => entry.id === "personal-drives")!
          .answer,
      ),
    ).toContain("dieselbe Fassung");
    expect(
      german(
        workspaceFAQQuestions.find(
          (entry) => entry.id === "personal-drive-shared",
        )!.answer,
      ),
    ).toContain("Ansprechpersonen");
    expect(
      german(
        workspaceFAQQuestions.find(
          (entry) => entry.id === "personal-drive-shared",
        )!.answer,
      ),
    ).toContain("beim Verschieben der Arbeitsfassung");
    expect(german("See an example")).toBe("Beispiel ansehen");
    expect(
      new URL(workspaceFAQExampleHref, "https://example.test").searchParams.get(
        "post",
      ),
    ).toBe("digital-onedrive-review");
  });

  it("uses clear role names and never translates SharePoint site administration as a physical location", () => {
    expect(previewRoles).toHaveLength(9);
    for (const role of previewRoles)
      expect(german(role.role)).not.toBe(role.role);
    for (const group of previewRoleGroups)
      expect(german(group.label)).not.toBe(group.label);
    expect(german("Site Administrator")).toBe("Websiteadministrator");
    expect(german("Site Administrator")).not.toMatch(/Standort|Global/);
    expect(german("Sales & Marketing Specialist")).toBe(
      "Fachreferentin für Vertrieb und Marketing",
    );
    expect(german("Finance Operations Specialist")).toBe(
      "Fachkraft für Finanzprozesse",
    );
    expect(german("Technology & Engineering Administrator")).toBe(
      "Administrator für IT und Entwicklung",
    );
    expect(german("Information Advisory Specialist")).toBe(
      "Fachreferentin für Informationsmanagement",
    );
    expect(german("Some preview roles can access this area.")).toContain(
      "Vorschaurollen",
    );
  });

  it("distinguishes delegated technical maintenance from protected business entitlement", () => {
    for (const option of siteAdministrationOptions) {
      const combined = `${option.name}: ${option.detail} This is a simulated setting; no live changes are made.`;
      expect(german(combined)).toContain(
        "keine Änderungen an produktiven Systemen",
      );
      expect(german(combined)).not.toContain(option.detail);
    }
    const permissions = siteAdministrationOptions.find(
      (option) => option.name === "Site permissions",
    )!;
    expect(german(permissions.detail)).toContain("delegierten Zuständigkeit");
    expect(german(permissions.detail)).toContain("gesonderte Berechtigung");
    expect(german("Return to working documents")).toBe(
      "Zurück zu den Arbeitsdokumenten",
    );
  });

  it("uses the four professional classification labels while preserving canonical values", () => {
    const expected = [
      "Öffentlich",
      "Intern",
      "Vertraulich",
      "Streng vertraulich",
    ];
    expect(sensitivityLabels.map(german)).toEqual(expected);
    for (const [index, label] of sensitivityLabels.entries()) {
      expect(german(`Sensitivity: ${label}`)).toBe(
        `Vertraulichkeit: ${expected[index]}`,
      );
      expect(translateText(label, "en")).toBe(label);
    }
    expect(german("Purse Strings")).toBe("Geldströme");
    expect(german("Purse Strings")).not.toMatch(/Geldbeutel|Finanzabteilung/);
  });

  it("retains every reviewed phrase without changing English source copy", () => {
    for (const [source, expected] of Object.entries(
      germanFAQRolesSensitivity,
    )) {
      expect(german(source)).toBe(expected);
      expect(translateText(source, "en")).toBe(source);
    }
  });
});
