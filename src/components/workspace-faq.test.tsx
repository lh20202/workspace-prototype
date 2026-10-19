import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import WorkspaceFAQ, { WorkspaceFAQContent } from "./WorkspaceFAQ";
import {
  workspaceFAQQuestions,
  workspaceFAQSubmittedQuestion,
} from "./workspaceFAQContent";
import {
  emptyFAQQuestion,
  faqQuestionSubmission,
} from "./faqQuestionSubmission";
import Launcher from "../intranet/Launcher";
import PrototypeNavigator from "./PrototypeNavigator";

afterEach(() => vi.unstubAllGlobals());

describe("the deliberately small Workspace FAQ popup", () => {
  it("keeps the popup trigger on Welcome and beside All workspaces in Demo controls", () => {
    vi.stubGlobal("location", new URL("https://example.test/planning"));
    vi.stubGlobal("sessionStorage", { getItem: () => null });
    const launcher = renderToStaticMarkup(createElement(Launcher));
    const controls = renderToStaticMarkup(createElement(PrototypeNavigator));
    for (const html of [launcher, controls])
      expect(html).toMatch(
        /class="workspace-faq-link"[^>]*aria-haspopup="dialog"|aria-haspopup="dialog"[^>]*class="workspace-faq-link"/,
      );
    expect(controls.indexOf('class="workspace-faq-link"')).toBeGreaterThan(
      controls.indexOf("All workspaces"),
    );
    expect(controls.indexOf('class="workspace-faq-link"')).toBeLessThan(
      controls.indexOf("prototype-utilities"),
    );
    const closed = renderToStaticMarkup(createElement(WorkspaceFAQ));
    expect(closed).not.toContain(workspaceFAQQuestions[0].question);
    expect(closed).not.toContain("<textarea");
  });

  it("shows two normal questions and one additional sharing question in the same collapsed accordion", () => {
    const html = renderToStaticMarkup(createElement(WorkspaceFAQContent));
    expect(workspaceFAQQuestions).toHaveLength(2);
    expect(html.match(/data-faq-id=/g)).toHaveLength(3);
    expect(html.match(/class="[^"]*\bworkspace-faq-question\b/g)).toHaveLength(
      3,
    );
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(3);
    expect(html).toContain(
      "Can I easily share information with other departments?",
    );
    expect(workspaceFAQSubmittedQuestion.answer).toBe(
      "Yes. Save it in the right place and share the link; access is handled in the background.",
    );
    expect(html).not.toContain("Submitted question");
    for (const entry of [
      ...workspaceFAQQuestions,
      workspaceFAQSubmittedQuestion,
    ]) {
      expect(html).toContain(entry.question);
      expect(
        entry.answer.split(/[.!?]+/).filter((part) => part.trim()).length,
      ).toBeLessThanOrEqual(2);
    }
    expect(html).not.toMatch(
      /FILES &amp; ACCESS|WORKING WITH OTHERS|GETTING STARTED &amp; SUPPORT|early design examples|Who can see my files|personal-drives|workspace-faq-example|See an example|Could this be automated/,
    );
  });

  it("shows the coming-soon anonymous question field as a real but read-only input", () => {
    const html = renderToStaticMarkup(createElement(WorkspaceFAQContent));
    expect(html).toContain("Have a question?");
    expect(html).toContain("Your question");
    expect(html.match(/<textarea\b/g)).toHaveLength(1);
    expect(html).toMatch(/<label[^>]+for="[^"]+"/);
    expect(html).toContain('rows="3"');
    expect(html).toContain("COMING SOON");
    expect(html).toMatch(/(?:readOnly|readonly)=""/);
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain("THIS FEATURE WILL BE AVAILABLE SOON!");
    expect(html).toContain(
      "Useful questions will be added to the FAQ for everyone.",
    );
    expect(html).toMatch(
      /<button[^>]*type="submit"[^>]*disabled|<button[^>]*disabled[^>]*type="submit"/,
    );
    expect(html).toContain("Submit question");
    expect(html).toContain('role="status"');
    expect(html).not.toMatch(/<input\b|<form[^>]*\baction=/);
  });

  it("prevents empty and whitespace-only submissions", () => {
    for (const question of ["", "   ", "\n\t"]) {
      const draft = faqQuestionSubmission(emptyFAQQuestion, {
        type: "edit",
        question,
      });
      expect(faqQuestionSubmission(draft, { type: "submit" }).submitted).toBe(
        false,
      );
    }
  });

  it("acknowledges a valid question and discards its text without network or storage", () => {
    const forbidden = vi.fn(() => {
      throw new Error("Question must stay local");
    });
    vi.stubGlobal("fetch", forbidden);
    vi.stubGlobal("XMLHttpRequest", forbidden);
    vi.stubGlobal("navigator", { sendBeacon: forbidden });
    vi.stubGlobal("localStorage", { setItem: forbidden });
    vi.stubGlobal("sessionStorage", { setItem: forbidden });
    const draft = faqQuestionSubmission(emptyFAQQuestion, {
      type: "edit",
      question: "Can I bookmark a workspace?",
    });
    const submitted = faqQuestionSubmission(draft, { type: "submit" });
    expect(submitted.submitted).toBe(true);
    expect(submitted.question).toBe("");
    expect(forbidden).not.toHaveBeenCalled();
    expect(
      faqQuestionSubmission(submitted, {
        type: "edit",
        question: "Another question",
      }).submitted,
    ).toBe(false);
    expect(emptyFAQQuestion).toEqual({ question: "", submitted: false });
  });
});
