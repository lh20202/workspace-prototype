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
      text: "Welcome copy is attached. I’ve tightened the intro, but the opening still feels a bit long. Can we settle that before Thursday’s handoff?",
      attachment: "welcome-message",
      reply: {
        author: "Nadia Stein",
        text: "The shorter version works better in the audience checks. I’d lose the second clause and keep the practical next step.",
      },
      reactions: [{ emoji: "👍", count: 3 }],
    },
  ],
  web: [
    {
      id: "web-copy",
      author: "Alex Morgan",
      time: "Today, 09:27",
      text: "Latest form labels are attached. Is the shorter error message clear enough on mobile, or have we cut too much?",
      attachment: "mobile-fields",
      reply: {
        author: "Inez Hart",
        text: "It works if the instruction comes first. I’ve put the explanation underneath in the label sheet.",
      },
    },
    {
      id: "web-accessibility",
      author: "Inez Hart",
      time: "Today, 09:46",
      text: "Quick wording question: ‘Read the guide’ or the full guide title for this link? The heading already gives the context.",
      attachment: "landing-copy",
      reply: {
        author: "Alex Morgan",
        text: "Use the title. It still makes sense when a screen reader reads the link on its own.",
      },
    },
    {
      id: "web-engineering",
      author: "Alex Morgan",
      time: "Today, 10:07",
      text: "@Inez can you finish the wording and accessibility check? Digital has the CMS changes and deploy covered; we just need to confirm the content order from our side.",
      reactions: [{ emoji: "✅", count: 2 }],
    },
    {
      id: "web-history-link-check",
      author: "Inez Hart",
      time: "30 September 2026, 15:10",
      text: "The link check is finished. Two headings needed clearer wording; both are updated in the copy sheet. Thanks for catching them before the handoff.",
      attachment: "landing-copy",
      reactions: [{ emoji: "👍", count: 2 }],
    },
  ],
  social: [
    {
      id: "social-adapt",
      author: "Alex Morgan",
      time: "Today, 10:00",
      text: "I’ve shortened the welcome posts. Which opening would you use? The first one mostly repeats the image caption.",
      attachment: "welcome-adapt",
      reply: {
        author: "Rory Bell",
        text: "The question. I’ll keep the next step in sentence two.",
      },
    },
    {
      id: "social-publishing",
      author: "Rory Bell",
      time: "Today, 10:19",
      text: "Can we hold the summit teaser until the web summary is signed off? I don’t want to send people to a holding page.",
      reply: {
        author: "Alex Morgan",
        text: "Yep. Leave the Planable slot provisional — I’ll confirm here once the coverage team has the final summary.",
      },
    },
    {
      id: "social-description",
      author: "Alex Morgan",
      time: "Today, 10:37",
      text: "Image descriptions are in the adaptation sheet now. One last check alongside the copy and this is ready for release review.",
      attachment: "welcome-adapt",
    },
  ],
  media: [
    {
      id: "media-copy",
      author: "Alex Morgan",
      time: "Yesterday, 15:20",
      text: "Release draft attached. Does the opening make sense without the background paragraph? It needs to work if that’s all someone reads.",
      attachment: "media-copy",
      reply: {
        author: "Frances Cole",
        text: "Nearly. Bring the practical consequence into the first sentence; the timeline can stay further down.",
      },
    },
    {
      id: "media-window",
      author: "Frances Cole",
      time: "Today, 09:40",
      text: "Still waiting on the publication window. I’ll confirm the public release handoff here; the distribution details are in the restricted area.",
      reactions: [{ emoji: "👍", count: 2 }],
    },
  ],
  publications: [
    {
      id: "publication-check",
      author: "Alex Morgan",
      time: "Today, 09:50",
      text: "Latest layout is attached; image selects and mailing copy are in Shared too. Subject line is still open. If we can’t agree on it today, I’ll take it back to Editorial Desk.",
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
      text: "Explainer review cut is up. Can you leave timestamped notes on the captions and end frame before we hand it to Production Coordination? Silver Fern Creative is reviewing in its assigned folder.",
      attachment: "video-roughcut",
      handoff: {
        label: "Hand off to Production Coordination",
        channel: "coordination",
      },
      reply: {
        author: "Inez Hart",
        text: "Description reads well. I’ve noted one caption that comes in too early; just the end frame left to check.",
      },
    },
  ],
  coordination: [
    {
      id: "production-handoff",
      author: "Alex Morgan",
      time: "Today, 09:00",
      text: "What’s still open this morning: explainer review, the welcome series slot and the transport update. I’ve attached the delivery checklist. Can each desk flag anything that could hold up handoff?",
      attachment: "video-delivery",
      reply: {
        author: "Rory Bell",
        text: "Welcome series checks are done. One wording question left — I’m picking that up in Editorial Desk.",
      },
    },
  ],
  "cities-mobility": [
    {
      id: "city-context",
      author: "Mira Kline",
      time: "Today, 08:55",
      text: "The brief uses the agreed transport terms. Lead with the route changes and travel options; the wider city context can follow. The service disruption is temporary, so avoid suggesting a permanent route closure.",
      attachment: "coastal-brief",
      handoff: {
        label: "Pass topic context to Editorial Desk",
        channel: "editorial",
      },
      reply: {
        author: "Alex Morgan",
        text: "That helps. I’ll use that distinction in the opening and send the revised public copy through Production Coordination for release review.",
      },
    },
  ],
  "education-skills": [
    {
      id: "skills-context",
      author: "Felix Ward",
      time: "Yesterday, 14:10",
      text: "The audio intro should explain what people will learn before listing the sessions. The Future Skills Week evaluation is useful context, but this programme has a different audience. Keep the practical outcome in the first sentence.",
      attachment: "audio-script",
      handoff: {
        label: "Send the reviewed context to Publications & Email",
        channel: "publications",
      },
      reply: {
        author: "Rory Bell",
        text: "I’ll adapt that opening for the email and social copy. The reviewed script stays in the workspace so each desk can use the same source.",
      },
      reactions: [{ emoji: "👍", count: 2 }],
    },
  ],
  "digital-society": [
    {
      id: "digital-context",
      author: "Sana Malik",
      time: "Today, 09:20",
      text: "The public explanation should describe the service before asking people to register. Keep the eligibility wording separate from the form instructions; people need to understand whether it is useful to them first. The technical requirements are with Dev.",
      attachment: "landing-brief",
      handoff: {
        label: "Review the public explanation in Editorial Desk",
        channel: "editorial",
      },
      reply: {
        author: "Inez Hart",
        text: "Agreed. I’ll move the explanation above the registration link, check the headings, and send the content order back for review.",
      },
    },
  ],
  "arts-culture": [
    {
      id: "culture-context",
      author: "Leo Moreno",
      time: "Yesterday, 16:00",
      text: "The programme names and image credits are checked in the selects sheet. These photos are cleared for print only. Please keep those credits with the layout; a digital version needs a separate rights check before release.",
      attachment: "print-selects",
      handoff: { label: "Coordinate the visual handoff", channel: "video" },
      reply: {
        author: "Alex Morgan",
        text: "I’ll keep the credits in the print layout and flag the digital rights check in the production handoff. The approved selects sheet stays alongside the working files.",
      },
    },
  ],
  "coastal-flooding": [
    {
      id: "coastal-update",
      author: "Alex Morgan",
      time: "Today, 08:45",
      text: "Transport update draft is attached. @Noor can you check the questions people are asking before Editorial signs it off? Keep the operational briefing in the restricted area — this is just the public copy.",
      attachment: "rapid-copy",
      reply: {
        author: "Noor Bennett",
        text: "On it. I’ll check the common questions and keep individual enquiries out of the draft.",
      },
      reactions: [{ emoji: "👍", count: 3 }],
    },
    {
      id: "coastal-social",
      author: "Rory Bell",
      time: "Today, 09:35",
      text: "Social copy now matches the web headings. Ready for the accessibility check.",
      attachment: "coastal-social",
    },
  ],
  "clean-water-week": [
    {
      id: "water-planning",
      author: "Alex Morgan",
      time: "Today, 10:23",
      text: "Summit brief is ready for review. We still need to settle the opening and illustration direction before I lock the Planable schedule. Can you look this morning?",
      attachment: "water-brief",
      reply: {
        author: "Nadia Stein",
        text: "I can look at 11. I’ll check the audience angle and city context, then link the research summary from the brief.",
      },
      reactions: [{ emoji: "✅", count: 2 }],
    },
  ],
  "community-week": [
    {
      id: "community-close",
      author: "Alex Morgan",
      time: "30 September, 16:30",
      text: "That’s Future Skills Week wrapped. Final copy, the publication register and evaluation are in Published & Final Content. I’m archiving the channel now. The asset rights have expired, so don’t reuse them for the next campaign.",
      attachment: "community-final",
      reply: {
        author: "Taylor Brooks",
        text: "Evaluation is back with Audience Research. Thanks all — that was a busy week.",
      },
      reactions: [{ emoji: "👍", count: 4 }],
    },
  ],
};
