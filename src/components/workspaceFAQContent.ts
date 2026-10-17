/** Staff-facing explanations remain separate from the simulated product. */
export const creationExplanation =
  "This demo was built with AI-assisted coding. No company data was used, and nothing is connected to live Microsoft 365 or business systems.";

export const workspaceFAQQuestions = [
  {
    question: "Where do personal drives fit in?",
    answer:
      "Personal drives aren't part of the shared-working model shown here. Shared business documents live in workspaces so the right people can find, access and maintain the same copy.",
  },
  {
    question: "What if someone shares a personal drive file anyway?",
    answer:
      "It happens. Workspace focal points are trained to spot personal drive links, help move the working file into the right workspace and update the shared link.",
  },
] as const;

/** Ordinary explicit Preview Role routing opens an existing authorised conversation. */
export const workspaceFAQExampleHref =
  "/teams?staff=taylor&department=mcg&tab=Posts&post=marketing-growth-onedrive";
