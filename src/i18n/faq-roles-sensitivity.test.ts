import { describe, expect, it } from "vitest";
import { germanFAQRolesSensitivity } from "./de-faq-roles-sensitivity";
import { translateText } from "./translate";
import { creationExplanation } from "../components/workspaceFAQContent";
import { proofOfConceptInfoText } from "../components/DemoInfo";
import { siteAdministrationOptions } from "../components/SiteSettingsButton";
import { previewRoles, previewRoleGroups } from "../access/policy";
import { sensitivityLabels } from "../sharepoint/sensitivity";

const german = (source: string) => translateText(source, "de");

describe("final staff-facing German interpretation", () => {
  it("explains the demo limits", () => {
    expect(german(proofOfConceptInfoText)).toContain(
      "keine echten Dateien des Unternehmens",
    );
    expect(german(proofOfConceptInfoText)).toContain(
      "weder abgeschlossene Migrationen noch bestätigte Zugriffsregelungen",
    );
    expect(german(creationExplanation)).toContain(
      "keine Verbindung zu Tools oder Systemen des Unternehmens",
    );
    expect(german(creationExplanation)).toContain(
      "keine Unternehmensdaten verwendet",
    );
  });

  it("uses clear role names and never translates SharePoint site administration as a physical location", () => {
    expect(previewRoles).toHaveLength(9);
    for (const role of previewRoles) {
      if (role.id === "taylor") expect(german(role.role)).toBe("Demo User");
      else expect(german(role.role)).not.toBe(role.role);
    }
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

  it("keeps Demo User in German and explains ordinary exploration without extending access", () => {
    expect(german("Demo User")).toBe("Demo User");
    expect(german("Demo User — Taylor Brooks")).toBe(
      "Demo User — Taylor Brooks",
    );
    const explanation =
      "Explore the ordinary workspace experience. Restricted content still follows access rules.";
    expect(german(explanation)).toBe(
      "Erkunden Sie die normalen Funktionen der Arbeitsbereiche. Für geschützte Inhalte gelten weiterhin die Zugriffsregeln.",
    );
    expect(translateText(explanation, "en")).toBe(explanation);
  });

  it("distinguishes delegated technical maintenance from protected business entitlement", () => {
    for (const option of siteAdministrationOptions) {
      expect(german(option.name)).not.toBe(option.name);
      expect(german(option.detail)).not.toBe(option.detail);
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
    expect(german("South")).toBe("Süd");
    expect(german("South")).not.toMatch(/Geldbeutel|Finanzabteilung/);
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
