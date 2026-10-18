export interface FAQQuestionDraft {
  question: string;
  submitted: boolean;
}

export const emptyFAQQuestion: FAQQuestionDraft = {
  question: "",
  submitted: false,
};

/** Local demo only: acknowledge a question, then discard it without storage or I/O. */
export function faqQuestionSubmission(
  state: FAQQuestionDraft,
  action: { type: "edit"; question: string } | { type: "submit" },
): FAQQuestionDraft {
  if (action.type === "edit")
    return { question: action.question, submitted: false };
  if (!state.question.trim()) return state;
  return { question: "", submitted: true };
}
