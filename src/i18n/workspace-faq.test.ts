import { describe, expect, it } from "vitest";
import {
  workspaceDemoStage,
  creationExplanation,
  workspaceFAQExampleNote,
  workspaceFAQGroups,
  workspaceFAQQuestions,
} from "../components/workspaceFAQContent";
import { proofOfConceptInfoText } from "../components/DemoInfo";
import { germanWorkspaceFAQ } from "./de-workspace-faq";
import { displayText } from "./displayText";
import { formatDisplayPunctuation } from "./displayPunctuation";

describe("the expanded FAQ's final German wording", () => {
  it("covers every question, short answer and group while leaving English unchanged", () => {
    const sources = [
      "Welcome to the Digital Workspace demo!",
      "What am I looking at?",
      workspaceDemoStage,
      creationExplanation,
      workspaceFAQExampleNote,
      proofOfConceptInfoText,
      ...workspaceFAQGroups.map((group) => group.title),
      ...workspaceFAQQuestions.flatMap((entry) => [
        entry.question,
        entry.answer,
      ]),
    ];
    for (const source of sources) {
      expect(germanWorkspaceFAQ[source], source).toBeTruthy();
      expect(displayText(source, "de"), source).toBe(
        formatDisplayPunctuation(germanWorkspaceFAQ[source], "de"),
      );
      expect(displayText(source, "en")).toBe(
        formatDisplayPunctuation(source, "en"),
      );
    }
  });
  it("uses the established classification and product terms without conflating personal data and strict confidentiality", () => {
    const sensitivity = workspaceFAQQuestions.find(
      (entry) => entry.id === "sensitivity",
    )!.answer;
    expect(displayText(sensitivity, "de")).toContain(
      "Öffentlich, Intern, Vertraulich und Streng vertraulich",
    );
    const protectedInformation = workspaceFAQQuestions.find(
      (entry) => entry.id === "protected-information",
    )!;
    expect(displayText(protectedInformation.question, "de")).toContain(
      "personenbezogene Daten oder streng vertrauliche Informationen",
    );
  });
  it("keeps all questions and answers technology agnostic in both languages", () => {
    const answer = (id: string) =>
      workspaceFAQQuestions.find((entry) => entry.id === id)!.answer;
    for (const entry of workspaceFAQQuestions)
      for (const source of [entry.question, entry.answer])
        for (const language of ["en", "de"] as const)
          expect(displayText(source, language)).not.toMatch(
            /\b(?:Microsoft|SharePoint|Teams|OneDrive|MSF)\b/i,
          );
    expect(displayText(answer("focal-points"), "de")).toContain(
      "Unterschiedliche Aufgaben",
    );
    expect(displayText(answer("protected-information"), "de")).toContain(
      "nicht automatisch streng vertraulich",
    );
    expect(
      displayText(answer("workspace-wiki-difference"), "de").split("\n\n"),
    ).toHaveLength(2);
  });
});
