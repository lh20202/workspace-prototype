/** Staff-facing explanations remain separate from the simulated product. */
export const creationExplanation =
  "This demo was built with AI-assisted coding. The AI was given generic descriptions of how a typical organisation works and asked to create fictional files, conversations and workflows that feel realistic. No company data was used, and nothing is connected to live Microsoft 365 or business systems.";

export const workspaceFAQQuestions = [
  {
    question: "Where do personal drives such as OneDrive fit in?",
    answer:
      "Personal drives aren't part of the shared-working model shown here. Shared business documents live in workspaces so the right people can find, access and maintain the same copy.",
  },
  {
    question: "What if someone shares a personal-drive file anyway?",
    answer:
      "It happens. Workspace focal points are trained to spot personal-drive links, help move the working file into the right workspace and update the shared link.",
  },
] as const;

/** Ordinary explicit Preview Role routing opens an existing authorised conversation. */
export const workspaceFAQExampleHref =
  "/teams?staff=devon&workspace=digital&channel=M365%20%26%20SPFx&tab=Posts&post=digital-onedrive-review";
export const workspaceFAQAutomationNote =
  "Not as a simple built-in pre-send warning. Teams apps can monitor channel messages after posting, and Microsoft Purview can enforce configured compliance rules; this demo uses focal-point moderation.";
