import { describe, expect, it } from "vitest";
import {
  workspaceDemoIntro,
  workspaceDemoStage,
  creationExplanation,
  workspaceFAQExampleNote,
  workspaceFAQGroups,
  workspaceFAQQuestions,
} from "../components/workspaceFAQContent";
import { proofOfConceptInfoText } from "../components/DemoInfo";
import { germanWorkspaceFAQ, translateWorkspaceFAQ } from "./de-workspace-faq";

describe("the expanded FAQ's final German wording", () => {
  it("covers every question, short answer and group while leaving English unchanged", () => {
    const sources = [
      "Welcome to the Digital Workspace demo!",
      "What am I looking at?",
      workspaceDemoIntro,
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
      expect(translateWorkspaceFAQ(source, "de"), source).toBe(
        germanWorkspaceFAQ[source],
      );
      expect(translateWorkspaceFAQ(source, "en")).toBe(source);
    }
  });
  it("uses the established classification and product terms without conflating personal data and strict confidentiality", () => {
    const sensitivity = workspaceFAQQuestions.find(
      (entry) => entry.id === "sensitivity",
    )!.answer;
    expect(translateWorkspaceFAQ(sensitivity, "de")).toContain(
      "Öffentlich, Intern, Vertraulich und Streng vertraulich",
    );
    const protectedInformation = workspaceFAQQuestions.find(
      (entry) => entry.id === "protected-information",
    )!;
    expect(
      translateWorkspaceFAQ(protectedInformation.question, "de"),
    ).toContain(
      "personenbezogene Daten oder streng vertrauliche Informationen",
    );
  });
  it("preserves real system names in this guidance without substituting fictional demo tools", () => {
    const answer = (id: string) =>
      workspaceFAQQuestions.find((entry) => entry.id === id)!.answer;
    for (const language of ["en", "de"] as const) {
      expect(
        translateWorkspaceFAQ(answer("specialist-tools"), language),
      ).toContain("DONNA, Jira");
      expect(
        translateWorkspaceFAQ(answer("specialist-tools"), language),
      ).not.toContain("RaiseTicket");
      expect(
        translateWorkspaceFAQ(answer("protected-information"), language),
      ).toContain("SharePoint");
      expect(
        translateWorkspaceFAQ(answer("teams-workspace-difference"), language),
      ).toContain("Teams");
    }
    expect(translateWorkspaceFAQ(answer("focal-points"), "de")).toContain(
      "Unterschiedliche Aufgaben",
    );
    expect(
      translateWorkspaceFAQ(answer("protected-information"), "de"),
    ).toContain("nicht automatisch streng vertraulich");
    expect(
      translateWorkspaceFAQ(answer("workspace-wiki-difference"), "de").split(
        "\n\n",
      ),
    ).toHaveLength(2);
  });
});
