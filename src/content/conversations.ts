export interface StudioPost {
  id: string;
  author: string;
  time: string;
  text: string;
  attachment?: string;
  reply?: { author: string; text: string };
  handoff?: { label: string; channel: string };
  reactions?: { emoji: string; count: number }[];
}

/** Conversation volume follows the desk's actual work, not a repeated template. */
export const studioPosts: Record<string, StudioPost[]> = {
  editorial: [
    {
      id: "editorial-review",
      author: "Alex Morgan",
      time: "Today, 09:10",
      text: "The customer welcome copy is ready for editorial review. Please check the opening message and plain-language alternatives before Thursday’s handoff.",
      attachment: "welcome-message",
      reply: {
        author: "Taylor Brooks",
        text: "I’ve added the audience evidence. The shorter opening is easier to follow; keep the review focused on that version.",
      },
      reactions: [
        { emoji: "👍", count: 3 },
        { emoji: "✅", count: 1 },
      ],
    },
  ],
  web: [
    {
      id: "web-copy",
      author: "Alex Morgan",
      time: "Today, 09:25",
      text: "The sign-up labels and validation messages are ready for content acceptance. Does the shorter error message still make the next step clear?",
      attachment: "mobile-fields",
      reply: {
        author: "Inez Hart",
        text: "Yes. Keep the instruction first and move the explanation below it; the current label spreadsheet has the wording.",
      },
      reactions: [{ emoji: "👍", count: 4 }],
    },
    {
      id: "web-accessibility",
      author: "Inez Hart",
      time: "Today, 09:42",
      text: "For the landing page, should the link say ‘Read the guide’ or describe the destination more precisely? The heading already explains the purpose.",
      attachment: "landing-copy",
      reply: {
        author: "Alex Morgan",
        text: "Use the specific destination. That also makes sense when the link is read on its own.",
      },
    },
    {
      id: "web-engineering",
      author: "Alex Morgan",
      time: "Today, 10:05",
      text: "Copy acceptance is separate from the CMS release. The platform colleagues will handle configuration, source changes and deployment in Digital & Technology; our review stays on wording, content order and accessibility.",
      reactions: [{ emoji: "✅", count: 2 }],
    },
  ],
  social: [
    {
      id: "social-adapt",
      author: "Alex Morgan",
      time: "Today, 10:00",
      text: "The welcome series needs shorter social adaptations and image descriptions. Which opening works best without repeating the image caption?",
      attachment: "welcome-adapt",
      reply: {
        author: "Rory Bell",
        text: "The question-led opening works better. I’ll keep the practical next step in the second sentence.",
      },
      reactions: [
        { emoji: "👍", count: 5 },
        { emoji: "❤️", count: 1 },
      ],
    },
    {
      id: "social-publishing",
      author: "Rory Bell",
      time: "Today, 10:18",
      text: "Can we hold the summit teaser until the web summary has passed editorial review? I’d rather link to the finished summary than post a holding message.",
      reply: {
        author: "Alex Morgan",
        text: "Agreed. Keep the slot provisional in Planable; the coverage room will confirm the approved summary.",
      },
    },
    {
      id: "social-description",
      author: "Alex Morgan",
      time: "Today, 10:32",
      text: "Image descriptions are now included in the adaptation sheet. Please check the description together with the post copy before the release check.",
      attachment: "welcome-adapt",
      reactions: [{ emoji: "✅", count: 3 }],
    },
  ],
  media: [
    {
      id: "media-copy",
      author: "Alex Morgan",
      time: "Yesterday, 15:20",
      text: "The public release draft is ready for wording review. Can the opening stand on its own without the background paragraph?",
      attachment: "media-copy",
      reply: {
        author: "Frances Cole",
        text: "Almost. Put the practical consequence in the opening and leave the timeline in the background paragraph.",
      },
    },
    {
      id: "media-window",
      author: "Frances Cole",
      time: "Today, 09:40",
      text: "The approved publication window still needs confirmation. Please keep distribution arrangements in the protected area and use this thread for wording and the public release handoff.",
      reactions: [{ emoji: "👍", count: 2 }],
    },
  ],
  publications: [
    {
      id: "publication-check",
      author: "Alex Morgan",
      time: "Today, 09:50",
      text: "The layout, image selections and email copy are in Shared. Please record layout and copy changes against those files; bring any unresolved wording back to Editorial Desk.",
      attachment: "print-layout",
      handoff: {
        label: "Pass a wording question to Editorial Desk",
        channel: "editorial",
      },
      reactions: [{ emoji: "✅", count: 2 }],
    },
  ],
  video: [
    {
      id: "video-captions",
      author: "Alex Morgan",
      time: "Today, 10:15",
      text: "The explainer review cut is ready. Check captions and the end frame against the delivery checklist, then pass the reviewed package to Production Coordination. Silver Fern Creative can access only its scoped production folder.",
      attachment: "video-roughcut",
      handoff: {
        label: "Hand off to Production Coordination",
        channel: "coordination",
      },
      reply: {
        author: "Taylor Brooks",
        text: "The service description is clear. One caption timing change is noted in the review file; the remaining check is the final end frame.",
      },
      reactions: [{ emoji: "👍", count: 1 }],
    },
  ],
  coordination: [
    {
      id: "production-handoff",
      author: "Alex Morgan",
      time: "Today, 09:00",
      text: "Today’s priorities: finish the explainer review, confirm the welcome series publishing slot and consolidate the transport update in the active coverage channel.",
      attachment: "video-delivery",
      reply: {
        author: "Taylor Brooks",
        text: "Audience checks for the welcome series are complete. I’ll bring remaining wording questions to Editorial Desk.",
      },
    },
  ],
  "cities-mobility": [
    {
      id: "city-context",
      author: "Taylor Brooks",
      time: "Today, 08:55",
      text: "The transport update should explain what changes for readers before describing the wider city context. The public-information brief has the agreed terms; please carry those into the channel adaptations.",
      attachment: "coastal-brief",
      handoff: {
        label: "Pass topic context to Editorial Desk",
        channel: "editorial",
      },
      reply: {
        author: "Alex Morgan",
        text: "I’ll keep the context note linked here and let the channel desks adapt the reviewed wording.",
      },
    },
  ],
  "education-skills": [
    {
      id: "skills-context",
      author: "Taylor Brooks",
      time: "Yesterday, 14:10",
      text: "The audio introduction needs one clear explanation of what participants will learn. Keep the Future Skills Week evaluation as background evidence and avoid carrying campaign-specific wording into the next introduction.",
      attachment: "audio-script",
      handoff: {
        label: "Send the reviewed context to Publications & Email",
        channel: "publications",
      },
      reactions: [{ emoji: "👍", count: 2 }],
    },
  ],
  "digital-society": [
    {
      id: "digital-context",
      author: "Taylor Brooks",
      time: "Today, 09:20",
      text: "Readers should understand the digital service before they reach the sign-up form. The brief now separates the public explanation from the copy needed inside the journey; technical requirements stay with Digital & Technology.",
      attachment: "landing-brief",
      handoff: {
        label: "Review the public explanation in Editorial Desk",
        channel: "editorial",
      },
    },
  ],
  "arts-culture": [
    {
      id: "culture-context",
      author: "Alex Morgan",
      time: "Yesterday, 16:00",
      text: "Please check the programme context and image credits together before adapting the print explainer for the event. The selected images are cleared for print only; any digital adaptation needs its own rights check.",
      attachment: "print-selects",
      handoff: { label: "Coordinate the visual handoff", channel: "video" },
      reactions: [{ emoji: "✅", count: 1 }],
    },
  ],
  "coastal-flooding": [
    {
      id: "coastal-update",
      author: "Alex Morgan",
      time: "Today, 08:45",
      text: "This rapid coverage channel brings city-topic, editorial and customer-liaison colleagues together for the major transport disruption update. Work from the public-information draft; operational briefings stay in their protected location.",
      attachment: "rapid-copy",
      reply: {
        author: "Maya Chen",
        text: "I’ll check that the public copy answers common customer questions. No contact records or operational case details will be added here.",
      },
      reactions: [{ emoji: "👍", count: 3 }],
    },
    {
      id: "coastal-social",
      author: "Taylor Brooks",
      time: "Today, 09:35",
      text: "The social adaptations now use the same plain-language headings as the web copy. Accessibility review is the next handoff.",
      attachment: "coastal-social",
    },
  ],
  "clean-water-week": [
    {
      id: "water-planning",
      author: "Alex Morgan",
      time: "Today, 10:30",
      text: "City Innovation Summit coverage is moving into review. Let’s settle the opening message and illustration direction here, then use Planable for the approved publishing schedule.",
      attachment: "water-brief",
      reply: {
        author: "Taylor Brooks",
        text: "I’ve joined for audience and city-topic input. Keep the brief linked to the research summary rather than copying individual research notes.",
      },
      reactions: [{ emoji: "✅", count: 2 }],
    },
  ],
  "community-week": [
    {
      id: "community-close",
      author: "Alex Morgan",
      time: "30 September, 16:30",
      text: "Future Skills Week coverage is closed. Final copy, the publication register and the evaluation are retained in Published & Final Content. This channel is archived and read-only; the expired assets must not be republished.",
      attachment: "community-final",
      reply: {
        author: "Taylor Brooks",
        text: "The evaluation has been handed back to Audience Research. Thank you to everyone who contributed.",
      },
      reactions: [
        { emoji: "👍", count: 4 },
        { emoji: "❤️", count: 2 },
      ],
    },
  ],
};
