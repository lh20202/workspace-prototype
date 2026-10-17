import { describe, expect, it } from "vitest";
import {
  adminPlatforms,
  externalEnvironments,
  canonicalBrandText,
} from "../environments/catalog";
import { germanExternalEnvironments } from "./de-external-environments";

describe("final external-environment German interpretation", () => {
  it("interprets each external environment and vendor category while retaining product names", () => {
    for (const environment of externalEnvironments)
      expect(germanExternalEnvironments[environment.name]).toBeTruthy();
    for (const platform of adminPlatforms) {
      expect(germanExternalEnvironments[platform.category]).toBeTruthy();
      expect(germanExternalEnvironments[platform.purpose]).toBeTruthy();
      expect(germanExternalEnvironments[platform.name]).toBeUndefined();
      expect(canonicalBrandText(platform.name)).toBe(platform.name);
    }
  });
  it("makes the external boundary and administrative nature clear without literal purse wording", () => {
    expect(germanExternalEnvironments["Purse Strings"]).toBe("Geldströme");
    expect(germanExternalEnvironments["Admin logins"]).toBe("Admin-Zugänge");
    expect(germanExternalEnvironments["Back to demo"]).toBe("Zurück zur Demo");
    expect(germanExternalEnvironments["COMING SOON"]).toBe("IN VORBEREITUNG");
    expect(Object.values(germanExternalEnvironments).join(" ")).not.toContain(
      "Geldbeutel",
    );
  });
});
