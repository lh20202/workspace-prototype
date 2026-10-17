import SensitivityBadge from "../sharepoint/SensitivityBadge";
import { useState } from "react";
import { Document20Regular } from "@fluentui/react-icons";
import { TeamsComposer, initials } from "../teams/TeamsShell";
import {
  contentFilesForChannel,
  resolveContentChannel,
  contentTeamsHref,
  canSeeContentChannel,
} from "./channels";
import { studioPosts, type StudioPost } from "./conversations";
import { matchesDisplayText } from "../i18n/search";
import "./styles.css";

export default function ContentConversation({
  channel,
  userName,
  personId,
  query,
  onOpenFile,
}: {
  channel: string;
  userName: string;
  personId: string;
  query: string;
  onOpenFile: (id: string) => void;
}) {
  const context = resolveContentChannel(channel)!;
  const readOnly = context.lifecycle === "Archived";
  const [draft, setDraft] = useState("");
  const [posts, setPosts] = useState<StudioPost[]>(
    studioPosts[context.id] || [],
  );
  const [reactions, setReactions] = useState<Record<string, boolean>>({});
  const [replyTo, setReplyTo] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [replies, setReplies] = useState<Record<string, string[]>>({});
  const matching = posts.filter((post) =>
    matchesDisplayText(
      [
        post.author,
        post.text,
        post.reply?.text || "",
        ...(replies[post.id] || []),
      ].join("\n"),
      query,
    ),
  );
  const attachments = contentFilesForChannel(channel);
  return (
    <div className="m365-teams-feed content-room-conversation">
      {(context.kind === "temporary" || context.kind === "topic") && (
        <p className="content-room-channel-note" role="note">
          <strong>
            {context.kind === "topic"
              ? "Topic desk"
              : readOnly
                ? "Archived coverage · Read-only"
                : "Temporary coverage"}
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
            <p data-no-translate={post.id.startsWith("local-") || undefined}>
              {post.text}
            </p>
            {attachment && (
              <button
                className="m365-teams-attachment"
                onClick={() => onOpenFile(attachment.id)}
              >
                <Document20Regular />
                <span>
                  {attachment.name}
                  <SensitivityBadge value={attachment.sensitivity} />
                  <small>SharePoint · {attachment.type.toUpperCase()}</small>
                </span>
              </button>
            )}
            {post.handoff &&
              canSeeContentChannel(personId, post.handoff.channel) && (
                <p>
                  <a href={contentTeamsHref(personId, post.handoff.channel)}>
                    {post.handoff.label} →
                  </a>
                </p>
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
                  <p data-no-translate>{text}</p>
                </div>
              </div>
            ))}
            <div className="m365-teams-reactions">
              {(post.reactions || []).map(({ emoji, count }) => {
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
                    {emoji} {count + (reactions[key] ? 1 : 0)}
                  </button>
                );
              })}
              {!post.reactions?.length && !readOnly && (
                <button
                  aria-label="Like this post"
                  aria-pressed={!!reactions[`${post.id}:👍`]}
                  onClick={() =>
                    setReactions({
                      ...reactions,
                      [`${post.id}:👍`]: !reactions[`${post.id}:👍`],
                    })
                  }
                >
                  {reactions[`${post.id}:👍`] ? "👍 1" : "Like"}
                </button>
              )}
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
