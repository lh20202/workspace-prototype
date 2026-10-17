import { describe, expect, it } from "vitest";
import { translateText } from "../i18n/translate";
import { germanPlanningReporting } from "../i18n/de-planning-reporting";
import { planningPosts, planningReportingChannel } from "./teams";
import { logframeOutcomes } from "./PlanningWorkingViews";
import { matchesDisplayText } from "../i18n/search";

describe("Planning German display copy", () => {
  it("translates all seeded conversations, roles and working view content while preserving English source", () => {
    for (const post of planningPosts) {
      for (const source of [
        post.text,
        post.author.role,
        ...(post.replies || []).map((reply) => reply.text),
      ]) {
        expect(germanPlanningReporting[source]).toBeTruthy();
        expect(translateText(source, "de")).toBe(
          germanPlanningReporting[source],
        );
        expect(translateText(source, "en")).toBe(source);
      }
    }
    for (const outcome of logframeOutcomes)
      for (const source of [outcome.outcome, outcome.indicator])
        expect(translateText(source, "de")).not.toBe(source);
    expect(translateText(planningReportingChannel, "de")).toBe(
      "Planung & Berichterstattung",
    );
  });
  it("preserves the no-migration and privacy meaning in natural workplace German", () => {
    const updatedView = planningPosts.find(
      (post) => post.id === "planning-logframe-view",
    )!;
    expect(translateText(updatedView.text, "de")).toContain(
      "Inhalte und Fristen bleiben gleich",
    );
    expect(translateText(updatedView.replies![1].text, "de")).toContain(
      "weiterhin dieselben Daten",
    );
    const event = planningPosts.find(
      (post) => post.id === "planning-strategy-away-day",
    )!;
    expect(translateText(event.text, "de")).toContain(
      "persönliche Angaben nicht hier in den Kanal",
    );
    expect(
      translateText(
        "Fictional registration · nothing is sent or stored.",
        "de",
      ),
    ).toContain("keine Angaben gesendet oder gespeichert");
    expect(translateText(logframeOutcomes[2].indicator, "de")).toContain(
      "Abgeschlossene",
    );
    expect(translateText("Department planning contributor", "de")).toBe(
      "Mitwirkende an der Abteilungsplanung",
    );
    expect(matchesDisplayText(event.text, "Anmeldeformular")).toBe(true);
  });
});
