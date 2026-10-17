import { useState } from "react";
import { Document20Regular } from "@fluentui/react-icons";
import { TeamsComposer, initials } from "../teams/TeamsShell";
import { contentFilesForChannel, resolveContentChannel } from "./channels";
import "./styles.css";

type Post = {
  id: string;
  author: string;
  time: string;
  text: string;
  attachment?: string;
  reply?: { author: string; text: string };
};
const conversations: Record<string, Post[]> = {
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
    },
  ],
  web: [
    {
      id: "web-copy",
      author: "Alex Morgan",
      time: "Today, 09:25",
      text: "The sign-up labels and validation messages are ready for content acceptance. Please record copy changes here. CMS configuration and releases stay with Digital & Technology.",
      attachment: "mobile-fields",
    },
  ],
  social: [
    {
      id: "social-adapt",
      author: "Alex Morgan",
      time: "Today, 10:00",
      text: "The welcome series needs shorter social adaptations and image descriptions. Let’s agree the message order before the publishing slot is confirmed.",
      attachment: "welcome-adapt",
    },
  ],
  media: [
    {
      id: "media-copy",
      author: "Alex Morgan",
      time: "Yesterday, 15:20",
      text: "The public release draft is available for wording review. Distribution arrangements remain in the protected area; please keep this conversation to the draft and approved publication steps.",
      attachment: "media-copy",
    },
  ],
  video: [
    {
      id: "video-captions",
      author: "Alex Morgan",
      time: "Today, 10:15",
      text: "The explainer review cut is ready. Please check captions, the service description and the end frame. Silver Fern Creative can access only the scoped production folder.",
      attachment: "video-roughcut",
      reply: {
        author: "Taylor Brooks",
        text: "The service description is clear. I’ve noted one caption timing change for the final review.",
      },
    },
  ],
  coordination: [
    {
      id: "production-handoff",
      author: "Alex Morgan",
      time: "Today, 09:00",
      text: "Today’s priorities: finish the service explainer review, confirm the welcome series publishing slot and consolidate public-information copy in the active coverage room.",
      attachment: "video-delivery",
      reply: {
        author: "Taylor Brooks",
        text: "Audience checks for the welcome series are complete. I’ll bring any remaining wording questions to Editorial Desk.",
      },
    },
  ],
  "coastal-flooding": [
    {
      id: "coastal-update",
      author: "Alex Morgan",
      time: "Today, 08:45",
      text: "This temporary room brings editorial, audience and customer liaison together for our fictional coastal flooding coverage. Please work from the public-information draft; operational briefings stay in their protected area.",
      attachment: "rapid-copy",
      reply: {
        author: "Maya Chen",
        text: "I’ll check that the public copy answers common customer questions. No contact records or operational case details will be added here.",
      },
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
      text: "Clean Water Week is our next fictional publishing series. Let’s settle the opening message and illustration direction here, then use Planable for the approved publishing schedule.",
      attachment: "water-brief",
      reply: {
        author: "Taylor Brooks",
        text: "I’ve joined for audience input. The brief should use the research summary rather than copying individual research notes.",
      },
    },
  ],
  "community-week": [
    {
      id: "community-close",
      author: "Alex Morgan",
      time: "30 September, 16:30",
      text: "Community Week coverage is closed. Final copy, the publication register and the evaluation are retained in Published & Final Content. This channel is now archived and read-only; the expired assets must not be republished.",
      attachment: "community-final",
      reply: {
        author: "Taylor Brooks",
        text: "The evaluation has been handed back to Audience Research. Thank you to everyone who contributed.",
      },
    },
  ],
};

export default function ContentConversation({
  channel,
  userName,
  query,
  onOpenFile,
}: {
  channel: string;
  userName: string;
  query: string;
  onOpenFile: (id: string) => void;
}) {
  const context = resolveContentChannel(channel)!;
  const readOnly = context.lifecycle === "Archived";
  const [draft, setDraft] = useState("");
  const [posts, setPosts] = useState<Post[]>(conversations[context.id] || []);
  const [reactions, setReactions] = useState<Record<string, boolean>>({});
  const [replyTo, setReplyTo] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [replies, setReplies] = useState<Record<string, string[]>>({});
  const matching = posts.filter((post) =>
    `${post.author} ${post.text} ${post.reply?.text || ""} ${(replies[post.id] || []).join(" ")}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const attachments = contentFilesForChannel(channel);
  return (
    <div className="m365-teams-feed content-room-conversation">
      {context.kind === "temporary" && (
        <p className="content-room-channel-note" role="note">
          <strong>
            {readOnly ? "Archived coverage · Read-only" : "Temporary coverage"}
          </strong>
          <span>{context.purpose}</span>
        </p>
      )}
      {matching.map((post) => {
        const attachment = attachments.find(
          (file) => file.id === post.attachment,
        );
        return (
          <article className="m365-teams-post" key={post.id}>
            <div className="m365-teams-post-header">
              <span className="m365-teams-avatar">{initials(post.author)}</span>
              <div>
                <strong>{post.author}</strong>
                <small>{post.time}</small>
              </div>
            </div>
            <p>{post.text}</p>
            {attachment && (
              <button
                className="m365-teams-attachment"
                onClick={() => onOpenFile(attachment.id)}
              >
                <Document20Regular />
                <span>
                  {attachment.name}
                  <small>SharePoint · {attachment.type.toUpperCase()}</small>
                </span>
              </button>
            )}
            {post.reply && (
              <div className="m365-teams-reply">
                <span className="m365-teams-avatar">
                  {initials(post.reply.author)}
                </span>
                <div>
                  <strong>{post.reply.author}</strong>
                  <small> · {readOnly ? "30 September" : "Today"}</small>
                  <p>{post.reply.text}</p>
                </div>
              </div>
            )}
            {(replies[post.id] || []).map((text, index) => (
              <div className="m365-teams-reply" key={index}>
                <span className="m365-teams-avatar">{initials(userName)}</span>
                <div>
                  <strong>{userName}</strong>
                  <small> · Now</small>
                  <p>{text}</p>
                </div>
              </div>
            ))}
            <div className="m365-teams-reactions">
              {["👍", "❤️", "✅"].map((emoji, index) => {
                const key = `${post.id}:${emoji}`;
                return (
                  <button
                    key={emoji}
                    aria-label={`React ${emoji}`}
                    aria-pressed={!!reactions[key]}
                    disabled={readOnly}
                    onClick={() =>
                      setReactions({ ...reactions, [key]: !reactions[key] })
                    }
                  >
                    {emoji} {2 + index + (reactions[key] ? 1 : 0)}
                  </button>
                );
              })}
              {!readOnly && (
                <button
                  onClick={() => setReplyTo(replyTo === post.id ? "" : post.id)}
                >
                  Reply
                </button>
              )}
            </div>
            {!readOnly && replyTo === post.id && (
              <TeamsComposer
                compact
                value={replyDraft}
                onChange={setReplyDraft}
                placeholder="Reply to thread"
                onSend={() => {
                  if (!replyDraft.trim()) return;
                  setReplies({
                    ...replies,
                    [post.id]: [...(replies[post.id] || []), replyDraft.trim()],
                  });
                  setReplyDraft("");
                  setReplyTo("");
                }}
              />
            )}
          </article>
        );
      })}
      {!matching.length && (
        <p className="m365-teams-empty">No messages found.</p>
      )}
      {!query && !readOnly && (
        <TeamsComposer
          value={draft}
          onChange={setDraft}
          onSend={() => {
            if (!draft.trim()) return;
            setPosts([
              ...posts,
              {
                id: `local-${posts.length}`,
                author: userName,
                time: "Now",
                text: draft.trim(),
              },
            ]);
            setDraft("");
          }}
        />
      )}
    </div>
  );
}
