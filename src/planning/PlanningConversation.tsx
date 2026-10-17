import { useState } from "react";
import { Document20Regular, Link20Regular } from "@fluentui/react-icons";
import { TeamsComposer, initials } from "../teams/TeamsShell";
import StaffLink from "../components/StaffLink";
import SensitivityBadge from "../sharepoint/SensitivityBadge";
import { matchesDisplayText } from "../i18n/search";
import {
  planningChannelFiles,
  planningPosts,
  type PlanningPost,
} from "./teams";
import "./planning-teams.css";

export default function PlanningConversation({
  userName,
  userRole,
  query = "",
}: {
  userName: string;
  userRole: string;
  query?: string;
}) {
  const [posts, setPosts] = useState(planningPosts);
  const [draft, setDraft] = useState("");
  const [reactions, setReactions] = useState<Record<string, boolean>>({});
  const [replyTo, setReplyTo] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [replies, setReplies] = useState<Record<string, string[]>>({});
  const matching = posts.filter((post) =>
    matchesDisplayText(
      [
        post.author.name,
        post.author.role,
        post.text,
        post.link?.label,
        ...(post.replies || []).map(
          (reply) => `${reply.author.name} ${reply.text}`,
        ),
        ...(replies[post.id] || []),
      ].join("\n"),
      query,
    ),
  );
  function sendPost() {
    if (!draft.trim()) return;
    const post: PlanningPost = {
      id: `planning-local-${Date.now()}`,
      author: { name: userName, role: userRole },
      time: "Now",
      text: draft.trim(),
      local: true,
    };
    setPosts([...posts, post]);
    setDraft("");
  }
  return (
    <div className="m365-teams-feed planning-conversation">
      {!matching.length && (
        <p className="m365-teams-empty">No messages found.</p>
      )}
      {matching.map((post) => {
        const file = planningChannelFiles.find(
          (item) => item.id === post.link?.documentId,
        );
        return (
          <article
            className="m365-teams-post"
            key={post.id}
            id={`post-${post.id}`}
            tabIndex={-1}
          >
            <div className="m365-teams-post-header">
              <span className="m365-teams-avatar" aria-hidden="true">
                {initials(post.author.name)}
              </span>
              <div>
                <strong>{post.author.name}</strong>
                <small>
                  {post.author.role} · {post.time}
                </small>
              </div>
            </div>
            <p data-no-translate={post.local || undefined}>{post.text}</p>
            {post.link && (
              <StaffLink
                className="m365-teams-attachment planning-post-link"
                href={post.link.href}
              >
                {file ? (
                  <Document20Regular aria-hidden="true" />
                ) : (
                  <Link20Regular aria-hidden="true" />
                )}
                <span>
                  {post.link.label}
                  {file && <SensitivityBadge value={file.sensitivity} />}
                </span>
              </StaffLink>
            )}
            {post.replies?.map((reply) => (
              <div
                className="m365-teams-reply"
                key={`${reply.author.name}:${reply.time}`}
              >
                <span className="m365-teams-avatar" aria-hidden="true">
                  {initials(reply.author.name)}
                </span>
                <div>
                  <strong>{reply.author.name}</strong>
                  <small> · {reply.time}</small>
                  <p>{reply.text}</p>
                </div>
              </div>
            ))}
            {(replies[post.id] || []).map((text, index) => (
              <div className="m365-teams-reply" key={index}>
                <span className="m365-teams-avatar" aria-hidden="true">
                  {initials(userName)}
                </span>
                <div>
                  <strong>{userName}</strong>
                  <small> · Now</small>
                  <p data-no-translate>{text}</p>
                </div>
              </div>
            ))}
            <div className="m365-teams-reactions">
              {(post.reactions || [{ emoji: "👍", people: [] }]).map(
                ({ emoji, people }) => {
                  const key = `${post.id}:${emoji}`;
                  const reacted = reactions[key] ?? people.includes(userName);
                  const names = people.filter((name) => name !== userName);
                  if (reacted) names.push(userName);
                  return (
                    <button
                      key={emoji}
                      title={names.join(", ") || "Like this post"}
                      aria-label={`React ${emoji}`}
                      aria-pressed={reacted}
                      onClick={() =>
                        setReactions({ ...reactions, [key]: !reacted })
                      }
                    >
                      {emoji} {names.length}
                    </button>
                  );
                },
              )}
              <button
                onClick={() => setReplyTo(replyTo === post.id ? "" : post.id)}
              >
                Reply
              </button>
            </div>
            {replyTo === post.id && (
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
      <TeamsComposer
        value={draft}
        onChange={setDraft}
        placeholder="Post to channel"
        onSend={sendPost}
      />
    </div>
  );
}
