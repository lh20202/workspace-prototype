import { useState } from "react";
import { Code20Regular } from "@fluentui/react-icons";
import { TeamsComposer } from "../teams/TeamsShell";
import { technicalPosts, gitHref } from "./technicalTeams";
interface ConversationPost {
  id: string;
  author: string;
  text: string;
  time: string;
  reply?: string;
  repo?: string;
  kind?: string;
  ref?: string;
}
interface ConversationMessage {
  channel: string;
  author: string;
  text: string;
  reply?: string;
  repo?: string;
  kind?: string;
  ref?: string;
}
const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
export default function TechnicalConversation({
  channel,
  userName = "Devon Park",
  searchQuery = "",
  messages = technicalPosts,
}: {
  channel: string;
  userName?: string;
  searchQuery?: string;
  messages?: ConversationMessage[];
}) {
  const [draft, setDraft] = useState("");
  const [posts, setPosts] = useState<
    (ConversationPost & { channel: string })[]
  >([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [replies, setReplies] = useState<Record<string, string[]>>({});
  const currentPosts: ConversationPost[] = [
    ...messages
      .filter((p) => p.channel === channel)
      .map((p, i) => ({
        ...p,
        id: `${channel}-${i}`,
        time: `09:${i === 0 ? "12" : i === 1 ? "28" : "45"}`,
      })),
    ...posts.filter((p) => p.channel === channel),
  ].filter((p) =>
    [p.author, p.text, p.reply, p.repo]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase()),
  );
  return (
    <div className="m365-teams-feed technical-conversation">
      {searchQuery.trim() && !currentPosts.length && (
        <p className="m365-teams-empty">No messages found.</p>
      )}
      {currentPosts.map((p) => {
        const separator = p.reply?.indexOf(":") ?? -1;
        const replyAuthor = separator >= 0 ? p.reply!.slice(0, separator) : "";
        const replyText =
          separator >= 0 ? p.reply!.slice(separator + 1).trim() : p.reply;
        return (
          <article className="m365-teams-post" key={p.id}>
            <header className="m365-teams-post-header">
              <span className="m365-teams-avatar">{initials(p.author)}</span>
              <div>
                <strong>{p.author}</strong>
                <small>
                  <time>{p.time}</time>
                </small>
              </div>
            </header>
            <p>{p.text}</p>
            {p.repo && (
              <a
                className="m365-teams-attachment"
                href={gitHref(p.repo, p.kind, p.ref)}
              >
                <Code20Regular />
                <span>
                  {p.repo}
                  {p.ref ? ` #${p.ref}` : ""}
                  <small>
                    {p.kind === "pr"
                      ? "Pull request"
                      : p.kind === "issue"
                        ? "Issue"
                        : p.kind === "release"
                          ? "Release"
                          : "Repository"}
                  </small>
                </span>
              </a>
            )}
            {replyText && (
              <article className="m365-teams-reply">
                <span className="m365-teams-avatar">
                  {initials(replyAuthor)}
                </span>
                <div>
                  <header>
                    <strong>{replyAuthor}</strong>
                    <time>09:48</time>
                  </header>
                  <p>{replyText}</p>
                </div>
              </article>
            )}
            {(replies[p.id] || []).map((text, i) => (
              <article className="m365-teams-reply" key={i}>
                <span className="m365-teams-avatar">{initials(userName)}</span>
                <div>
                  <header>
                    <strong>{userName}</strong>
                    <time>Now</time>
                  </header>
                  <p>{text}</p>
                </div>
              </article>
            ))}
            <div className="m365-teams-reactions">
              <button
                aria-label={`Like post by ${p.author}`}
                aria-pressed={likes.includes(p.id)}
                onClick={() =>
                  setLikes(
                    likes.includes(p.id)
                      ? likes.filter((id) => id !== p.id)
                      : [...likes, p.id],
                  )
                }
              >
                👍 {likes.includes(p.id) ? 3 : 2}
              </button>
              <button
                onClick={() => {
                  setReplyTo(replyTo === p.id ? "" : p.id);
                  setReplyDraft("");
                }}
              >
                Reply
              </button>
            </div>
            {replyTo === p.id && (
              <TeamsComposer
                compact
                value={replyDraft}
                onChange={setReplyDraft}
                placeholder={`Reply to ${p.author}`}
                onSend={() => {
                  if (replyDraft.trim()) {
                    setReplies({
                      ...replies,
                      [p.id]: [...(replies[p.id] || []), replyDraft.trim()],
                    });
                    setReplyDraft("");
                    setReplyTo("");
                  }
                }}
              />
            )}
          </article>
        );
      })}
      <TeamsComposer
        value={draft}
        onChange={setDraft}
        placeholder="Start a post"
        onSend={() => {
          if (draft.trim()) {
            setPosts([
              ...posts,
              {
                id: `local-${posts.length}`,
                channel,
                author: userName,
                text: draft.trim(),
                time: "Now",
              },
            ]);
            setDraft("");
          }
        }}
      />
    </div>
  );
}
