import { describe, expect, it } from "vitest";
import {
  workspaceFAQGroups,
  workspaceFAQQuestions,
} from "../components/workspaceFAQContent";
import { germanWorkspaceFAQ } from "./de-workspace-faq";
import { translateText } from "./translate";

describe("the expanded FAQ's final German wording", () => {
  it("covers every question, short answer and group while leaving English unchanged", () => {
    const sources = [
      ...workspaceFAQGroups.map((group) => group.title),
      ...workspaceFAQQuestions.flatMap((entry) => [
        entry.question,
        entry.answer,
      ]),
    ];
    for (const source of sources) {
      expect(germanWorkspaceFAQ[source], source).toBeTruthy();
      expect(translateText(source, "de"), source).toBe(
        germanWorkspaceFAQ[source],
      );
      expect(translateText(source, "en")).toBe(source);
    }
  });
  it("keeps business authorisation separate from technical implementation", () => {
    const source = workspaceFAQQuestions.find(
      (entry) => entry.id === "access-management",
    )!.answer;
    const german = translateText(source, "de");
    expect(german).toContain("klären und bestätigen");
    expect(german).toContain("richten die Berechtigungen ein");
  });
  it("uses the established classification and product terms without conflating personal data and strict confidentiality", () => {
    const sensitivity = workspaceFAQQuestions.find(
      (entry) => entry.id === "sensitivity",
    )!.answer;
    expect(translateText(sensitivity, "de")).toContain(
      "Öffentlich, Intern, Vertraulich oder Streng vertraulich",
    );
    const protectedInformation = workspaceFAQQuestions.find(
      (entry) => entry.id === "protected-information",
    )!;
    expect(translateText(protectedInformation.question, "de")).toContain(
      "personenbezogene Daten oder streng vertrauliche Informationen",
    );
  });
});
