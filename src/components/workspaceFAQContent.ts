export const creationExplanation =
  "This demo was built with AI-assisted coding. No company data was used, and nothing is connected to company tools or systems.";

export interface WorkspaceFAQQuestion {
  id: string;
  question: string;
  answer: string;
}

/** A deliberately small example FAQ for the proof of concept. */
export const workspaceFAQQuestions: readonly WorkspaceFAQQuestion[] = [
  {
    id: "external-collaboration",
    question: "Can I work with people outside the company?",
    answer:
      "Yes. Where external collaboration is needed, people outside the company can be given access to the specific workspace area or information they need without opening up everything else.",
  },
  {
    id: "focal-points",
    question: "Who are focal points?",
    answer:
      "Focal points are people in your department who receive extra training to help colleagues use their workspaces and channels. They're the first people to ask about access, where things belong, or everyday workspace questions.",
  },
];

export const workspaceFAQSubmittedQuestion: WorkspaceFAQQuestion = {
  id: "submitted-link-sharing",
  question: "Can I still share a link with someone in another department?",
  answer:
    "Yes, share the workspace link instead of making another copy of the file. If the person needs access, your focal point can help.",
};

export const workspaceFAQForm = {
  heading: "Have a question?",
  support:
    "Submit a question anonymously. Useful questions can be added to the FAQ for everyone.",
  label: "Your question",
  placeholder: "Type your question here…",
  submit: "Submit question",
  success: "Thanks, your question was submitted anonymously.",
};
