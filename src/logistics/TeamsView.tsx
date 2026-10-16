import { useState } from "react";
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from "@fluentui/react-components";
import {
  MoreHorizontal24Regular,
  Chat24Regular,
  NumberSymbol24Regular,
  Document24Regular,
} from "@fluentui/react-icons";
import {
  channels,
  posts,
  files,
  filesById,
  initialTasks,
  workspaceTitle,
  type OperationalFile,
  type TaskState,
} from "./data";
import { fileHref, filesForChannel } from "./query";
import { staff, selectedStaffId } from "../intranet/catalog";
import DocumentLibrary from "../sharepoint/DocumentLibrary";
import TeamsShell, { TeamsComposer } from "../teams/TeamsShell";
import "../teams/integrations.css";
import DocumentIcon from "../components/DocumentIcon";
export default function TeamsView({
  channelId,
  activeTab,
  onNavigate,
  onOpenFile,
  onWorkspace,
  onMessage,
}: {
  channelId: string;
  activeTab: string;
  onNavigate: (channel: string, tab: string) => void;
  onOpenFile: (file: OperationalFile) => void;
  onWorkspace: () => void;
  onMessage: (m: string) => void;
}) {
  const person =
    staff.find(
      (s) =>
        s.id ===
        (new URLSearchParams(location.search).get("staff") ||
          selectedStaffId()),
    ) || staff[1];
  const channel = channels.find((c) => c.id === channelId) ?? channels[2];
  const tab =
    channel.team === "company"
      ? "Posts"
      : ["Posts", "Shared", "Notes", "Planner"].includes(activeTab)
        ? activeTab
        : "Posts";
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState(initialTasks);
  const [draft, setDraft] = useState("");
  const [localPosts, setLocalPosts] = useState<
    { channel: string; text: string }[]
  >([]);
  const [replyTo, setReplyTo] = useState("");
  const [reply, setReply] = useState("");
  const [localReplies, setLocalReplies] = useState<Record<string, string[]>>(
    {},
  );
  const [liked, setLiked] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const visiblePosts = posts.filter((p) => p.channel === channel.id);
  const channelFiles = filesForChannel(channel);
  const searchChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const searchFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  function selectChannel(id: string) {
    onNavigate(id, "Posts");
    setSearch("");
    setReplyTo("");
    setReply("");
    setDraft("");
  }
  return (
    <TeamsShell
      userName={person.name}
      teamName={
        channel.team === "logistics" ? workspaceTitle : "Company Updates"
      }
      channelName={channel.name}
      groups={[
        {
          id: "company",
          label: "Company Updates",
          initials: "CU",
          channels: channels
            .filter((c) => c.team === "company")
            .map((c) => ({
              id: c.id,
              label: c.name,
              unread: ["important", "pets"].includes(c.id),
              onSelect: () => selectChannel(c.id),
            })),
        },
        {
          id: "logistics",
          label: workspaceTitle,
          initials: "AA",
          channels: channels
            .filter((c) => c.team === "logistics")
            .map((c) => ({
              id: c.id,
              label: c.name,
              unread: ["central-city", "telephone"].includes(c.id),
              onSelect: () => selectChannel(c.id),
            })),
        },
      ]}
      selectedChannelId={channel.id}
      activeTab={tab}
      tabs={
        channel.team === "logistics"
          ? ["Posts", "Shared", "Notes", "Planner"]
          : ["Posts"]
      }
      onTabChange={(next) => onNavigate(channel.id, next)}
      onOpenSharePoint={
        channel.team === "logistics"
          ? () => {
              const params = new URLSearchParams(location.search);
              const selectedFile = channelFiles.find(
                (f) => f.id === params.get("file"),
              );
              if (selectedFile) {
                location.assign(fileHref(selectedFile));
                return;
              }
              const source =
                channelFiles.find((f) => f.folder === params.get("folder")) ||
                channelFiles[0];
              if (!source) {
                onWorkspace();
                return;
              }
              const folder = new URLSearchParams(
                source.folder ? { folder: source.folder } : {},
              );
              location.assign(
                `/logistics/${source.library}${folder.size ? "?" + folder : ""}`,
              );
            }
          : undefined
      }
      onChannelInfo={() => onMessage(channel.purpose)}
      searchValue={search}
      onSearchChange={setSearch}
      searchResults={
        search.trim() ? (
          <div className="teams-search-results-content">
            <strong>Channels</strong>
            {searchChannels.map((c) => (
              <button key={c.id} onClick={() => selectChannel(c.id)}>
                <NumberSymbol24Regular />
                {c.name}
              </button>
            ))}
            <strong>Files</strong>
            {searchFiles.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  onOpenFile(f);
                  setSearch("");
                }}
              >
                <DocumentIcon name={f.name} />
                <span>
                  {f.name}
                  <small>{f.campaign}</small>
                </span>
              </button>
            ))}
            {!searchChannels.length && !searchFiles.length && (
              <p>No results found.</p>
            )}
          </div>
        ) : undefined
      }
    >
      <div
        className={`teams-logistics-content ${tab === "Posts" ? "teams-conversation" : ""} ${channel.id === "pets" && tab === "Posts" ? "pets-canvas" : ""}`}
      >
        {tab === "Posts" ? (
          <>
            {visiblePosts.map((p) => (
              <article
                className={`teams-post ${p.id === "post-daisy" ? "daisy-thread" : ""}`}
                key={p.id}
                id={p.id}
              >
                <div className="post-top">
                  <span className="post-avatar" aria-hidden="true">
                    {p.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <div>
                    <strong>{p.author}</strong>
                    <span>{p.time}</span>
                  </div>
                  <Menu>
                    <MenuTrigger disableButtonEnhancement>
                      <button
                        className="teams-post-options"
                        aria-label={`Post options for ${p.author}`}
                      >
                        <MoreHorizontal24Regular />
                      </button>
                    </MenuTrigger>
                    <MenuPopover>
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            const url = new URL(location.href);
                            url.hash = p.id;
                            void navigator.clipboard.writeText(url.href).then(
                              () => onMessage("Link copied."),
                              () => onMessage("The link could not be copied."),
                            );
                          }}
                        >
                          Copy link
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setSaved(
                              saved.includes(p.id)
                                ? saved.filter((id) => id !== p.id)
                                : [...saved, p.id],
                            );
                            onMessage(
                              saved.includes(p.id)
                                ? "Removed from saved messages."
                                : "Message saved.",
                            );
                          }}
                        >
                          {saved.includes(p.id)
                            ? "Remove from saved messages"
                            : "Save this message"}
                        </MenuItem>
                      </MenuList>
                    </MenuPopover>
                  </Menu>
                </div>
                {p.title && <h3>{p.title}</h3>}
                <p>{p.text}</p>
                {p.image && (
                  <img
                    className="post-photo"
                    src={p.image.src}
                    alt={p.image.alt}
                  />
                )}
                {p.pet && (
                  <div
                    className="pet-thumbnail"
                    role="img"
                    aria-label={
                      p.pet === "🐶"
                        ? "Illustrated fictional dog Pickle"
                        : "Illustrated fictional cat Miso"
                    }
                  >
                    {p.pet}
                    <span>{p.pet === "🐶" ? "Pickle" : "Miso"}</span>
                  </div>
                )}
                {p.fileIds.length > 0 && (
                  <div className="post-file-links">
                    {p.fileIds.map((id) => {
                      const f = filesById.get(id)!;
                      return (
                        <button key={id} onClick={() => onOpenFile(f)}>
                          <DocumentIcon name={f.name} />
                          <span>
                            {f.name}
                            <small>
                              {librariesName(f.library)} · {f.status}
                            </small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {p.locationLink && (
                  <a className="post-tracker-link" href="/logistics/locations">
                    Open Locations & Permits
                  </a>
                )}
                {p.reply && (
                  <ThreadReply
                    author={p.reply.split(":")[0]}
                    text={p.reply.slice(p.reply.indexOf(":") + 1).trim()}
                    time="10:24"
                    reactions={p.id === "post-daisy"}
                  />
                )}
                {localReplies[p.id]?.map((text, i) => (
                  <ThreadReply
                    key={i}
                    author={person.name}
                    text={text}
                    time="Just now"
                  />
                ))}
                <div className="post-actions">
                  <button
                    aria-pressed={liked.includes(p.id)}
                    onClick={() =>
                      setLiked(
                        liked.includes(p.id)
                          ? liked.filter((id) => id !== p.id)
                          : [...liked, p.id],
                      )
                    }
                  >
                    👍 {liked.includes(p.id) ? "Liked" : "Like"}
                  </button>
                  <button
                    onClick={() => {
                      setReplyTo(replyTo === p.id ? "" : p.id);
                      setReply("");
                    }}
                  >
                    <Chat24Regular />
                    Reply
                  </button>
                </div>
                {replyTo === p.id && (
                  <TeamsComposer
                    compact
                    value={reply}
                    onChange={setReply}
                    placeholder="Reply in thread"
                    onSend={() => {
                      if (!reply.trim()) return;
                      setLocalReplies({
                        ...localReplies,
                        [p.id]: [...(localReplies[p.id] ?? []), reply.trim()],
                      });
                      setReply("");
                      setReplyTo("");
                    }}
                  />
                )}
              </article>
            ))}
            {localPosts
              .filter((p) => p.channel === channel.id)
              .map((p, i) => (
                <article className="teams-post" key={i}>
                  <div className="post-top">
                    <span className="post-avatar" aria-hidden="true">
                      {person.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <div>
                      <strong>{person.name}</strong>
                      <span>Just now</span>
                    </div>
                  </div>
                  <p>{p.text}</p>
                </article>
              ))}
            <TeamsComposer
              value={draft}
              onChange={setDraft}
              placeholder="Start a post"
              onSend={() => {
                if (!draft.trim()) return;
                setLocalPosts([
                  ...localPosts,
                  { channel: channel.id, text: draft.trim() },
                ]);
                setDraft("");
              }}
            />
          </>
        ) : tab === "Shared" ? (
          <section className="teams-shared">
            <DocumentLibrary
              key={channel.id}
              title="Shared files"
              headingLevel={2}
              files={channelFiles.map((f) => ({
                id: f.id,
                name: f.name,
                folder: f.folder,
                modified: f.modified,
                owner: f.owner,
                status: f.status,
                metadata: {
                  Campaign: f.campaign,
                  "Operation type": f.operation,
                  Library: librariesName(f.library),
                  Location: f.location,
                  "Document type": f.type,
                  "Valid from": f.validFrom,
                  "Valid to": f.validTo,
                  Sensitivity: f.sensitivity,
                  "Record state": f.recordState,
                },
              }))}
            />
          </section>
        ) : tab === "Notes" ? (
          <section className="teams-notes">
            <span className="notes-label">
              <Document24Regular />
              CHANNEL NOTES
            </span>
            <h2>
              {channel.id === "telephone"
                ? "Current campaign notes"
                : `${channel.name} notes`}
            </h2>
            {channel.notes.map((note, i) => (
              <section key={note}>
                <h3>
                  {i === 0
                    ? "Current coordination"
                    : i === 1
                      ? "Known operational issues"
                      : "Handover points"}
                </h3>
                <p>{note}</p>
              </section>
            ))}
            <p className="muted">
              Keep current files in Shared and discuss changes in Posts.
            </p>
          </section>
        ) : (
          <section className="teams-planner">
            <div className="section-heading">
              <h2>Operational tasks</h2>
              <span>{channel.name}</span>
            </div>
            <div className="planner-board">
              {(["To do", "In progress", "Blocked", "Done"] as TaskState[]).map(
                (state) => (
                  <div
                    className={`planner-column ${state.toLowerCase().replaceAll(" ", "-")}`}
                    key={state}
                  >
                    <h3>
                      {state}
                      <span>
                        {
                          tasks.filter(
                            (t) =>
                              t.channel === channel.id && t.state === state,
                          ).length
                        }
                      </span>
                    </h3>
                    {tasks
                      .filter(
                        (t) => t.channel === channel.id && t.state === state,
                      )
                      .map((t) => (
                        <article className="planner-task" key={t.id}>
                          <strong>{t.title}</strong>
                          <span>{t.owner}</span>
                          <small>Due {t.due}</small>
                          <label>
                            <span className="sr-only">
                              Status for {t.title}
                            </span>
                            <select
                              value={t.state}
                              onChange={(e) =>
                                setTasks(
                                  tasks.map((task) =>
                                    task.id === t.id
                                      ? {
                                          ...task,
                                          state: e.target.value as TaskState,
                                        }
                                      : task,
                                  ),
                                )
                              }
                            >
                              {["To do", "In progress", "Blocked", "Done"].map(
                                (v) => (
                                  <option key={v}>{v}</option>
                                ),
                              )}
                            </select>
                          </label>
                        </article>
                      ))}
                    {!tasks.some(
                      (t) => t.channel === channel.id && t.state === state,
                    ) && <p className="planner-empty">No tasks</p>}
                  </div>
                ),
              )}
            </div>
          </section>
        )}
      </div>
    </TeamsShell>
  );
}
function librariesName(id: string) {
  return (
    {
      operations: "Campaign Operations",
      resources: "Shared Operations",
      training: "Training & Onboarding",
      records: "Completed Campaign Records",
    } as Record<string, string>
  )[id];
}

function ThreadReply({
  author,
  text,
  time,
  reactions = false,
}: {
  author: string;
  text: string;
  time: string;
  reactions?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const choices = [
    { emoji: "👍", name: "Like", count: reactions ? 3 : 0 },
    { emoji: "😂", name: "Laugh", count: reactions ? 2 : 0 },
    { emoji: "❤️", name: "Love", count: reactions ? 1 : 0 },
    { emoji: "😮", name: "Surprised", count: 0 },
    { emoji: "🐱", name: "Cat", count: reactions ? 2 : 0 },
    { emoji: "👽", name: "Alien", count: reactions ? 1 : 0 },
  ];
  return (
    <article className="teams-thread-reply" aria-label={`Reply from ${author}`}>
      <span className="post-avatar small" aria-hidden="true">
        {author
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </span>
      <div className="thread-reply-body">
        <header>
          <strong>{author}</strong>
          <span>{time}</span>
        </header>
        <p>{text}</p>
        <div className="thread-reactions" aria-label="Comment reactions">
          {choices.map((r) => (
            <button
              key={r.name}
              title={r.name}
              aria-label={`${r.name} reaction`}
              aria-pressed={selected.includes(r.name)}
              onClick={() =>
                setSelected(
                  selected.includes(r.name)
                    ? selected.filter((n) => n !== r.name)
                    : [...selected, r.name],
                )
              }
            >
              <span aria-hidden="true">{r.emoji}</span>
              {r.count + (selected.includes(r.name) ? 1 : 0) || (
                <span className="reaction-add">+</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
