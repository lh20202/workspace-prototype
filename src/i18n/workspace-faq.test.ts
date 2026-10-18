import { describe, expect, it } from "vitest";
import {
  workspaceFAQQuestions,
  workspaceFAQSubmittedQuestion,
  workspaceFAQForm,
} from "../components/workspaceFAQContent";
import { germanWorkspaceFAQ } from "./de-workspace-faq";
import { displayText } from "./displayText";

const entries = [...workspaceFAQQuestions, workspaceFAQSubmittedQuestion];
const sources = [
  "Workspace FAQ",
  "Submitted question",
  ...Object.values(workspaceFAQForm),
  ...entries.flatMap((entry) => [entry.question, entry.answer]),
];

describe("concise English and German FAQ", () => {
  it("translates every question, answer and form message without changing English", () => {
    for (const source of sources) {
      expect(germanWorkspaceFAQ[source], source).toBeTruthy();
      expect(displayText(source, "de"), source).toBe(
        germanWorkspaceFAQ[source],
      );
      expect(displayText(source, "en")).toBe(source);
    }
    for (const entry of entries)
      expect(
        displayText(entry.answer, "de")
          .split(/[.!?]+/)
          .filter((part) => part.trim()).length,
      ).toBeLessThanOrEqual(2);
  });
  it("describes focal points as trained departmental colleagues, not administrators", () => {
    const focalPoints = workspaceFAQQuestions.find(
      (entry) => entry.id === "focal-points",
    )!;
    const german = displayText(focalPoints.answer, "de");
    expect(german).toContain("in Ihrer Abteilung");
    expect(german).toContain("zusätzlich geschult");
    expect(german).toContain("erste Anlaufstelle");
    expect(german).not.toMatch(
      /Administrator|Genehmigung|Governance|IT-Support/,
    );
  });
  it("keeps both languages technology agnostic and the form anonymous", () => {
    for (const source of sources)
      for (const language of ["en", "de"] as const)
        expect(displayText(source, language)).not.toMatch(
          /\b(?:Microsoft|SharePoint|Teams|OneDrive|MSF)\b/i,
        );
    expect(displayText(workspaceFAQForm.support, "de")).toContain("anonym");
    expect(displayText(workspaceFAQForm.success, "de")).toContain("anonym");
  });
});
