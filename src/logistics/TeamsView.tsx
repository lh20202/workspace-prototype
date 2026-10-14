import { useState } from "react";
import { Button, Input } from "@fluentui/react-components";
import {
  ArrowLeft20Regular,
  ArrowRight20Regular,
  Search20Regular,
  MoreHorizontal24Regular,
  Alert24Regular,
  Chat24Regular,
  PeopleTeam24Regular,
  Calendar24Regular,
  Call24Regular,
  Folder24Regular,
  Apps24Regular,
  ChevronDown16Regular,
  ChevronRight16Regular,
  NumberSymbol24Regular,
  Add20Regular,
  Document24Regular,
  Send20Regular,
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
import { filesForChannel } from "./query";
import FileTable from "./FileTable";
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
  const channel = channels.find((c) => c.id === channelId) ?? channels[2];
  const tab =
    channel.team === "company"
      ? "Posts"
      : ["Posts", "Shared", "Notes", "Planner"].includes(activeTab)
        ? activeTab
        : "Posts";
  const [search, setSearch] = useState("");
  const [pane, setPane] = useState("Channels");
  const [companyOpen, setCompanyOpen] = useState(true);
  const [logisticsOpen, setLogisticsOpen] = useState(true);
  const [otherTeam, setOtherTeam] = useState("");
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
    <div className="teams-app">
      <header className="teams-topbar">
        <div className="teams-history">
          <button aria-label="Back" onClick={() => history.back()}>
            <ArrowLeft20Regular />
          </button>
          <button aria-label="Forward" onClick={() => history.forward()}>
            <ArrowRight20Regular />
          </button>
        </div>
        <div className="teams-global-search">
          <Input
            contentBefore={<Search20Regular />}
            placeholder="Search"
            aria-label="Search Teams"
            value={search}
            onChange={(_, d) => setSearch(d.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSearch("");
            }}
          />
          {search.trim() && (
            <div className="workspace-results teams-search-results">
              <div className="search-results-heading">Channels</div>
              {searchChannels.map((c) => (
                <button key={c.id} onClick={() => selectChannel(c.id)}>
                  <NumberSymbol24Regular />
                  {c.name}
                </button>
              ))}
              <div className="search-results-heading">Files</div>
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
          )}
        </div>
        <div className="teams-user">
          <button
            aria-label="Teams options"
            onClick={() =>
              onMessage(
                "Notifications and appearance use the default Teams preferences.",
              )
            }
          >
            <MoreHorizontal24Regular />
          </button>
          <button
            className="profile-button"
            aria-label="Signed in as Maya Chen"
            onClick={() =>
              onMessage("Maya Chen · Workspace member and contributor")
            }
          >
            <img src="/maya-avatar.svg" alt="Illustrated avatar of Maya Chen" />
          </button>
        </div>
      </header>
      <div className="teams-body">
        <nav className="teams-app-rail" aria-label="Teams apps">
          {[
            ["Activity", Alert24Regular],
            ["Chat", Chat24Regular],
            ["Channels", PeopleTeam24Regular],
            ["Calendar", Calendar24Regular],
            ["Calls", Call24Regular],
            ["Files", Folder24Regular],
            ["Apps", Apps24Regular],
          ].map(([label, Icon]) => {
            const Glyph = Icon as typeof Alert24Regular;
            return (
              <button
                key={String(label)}
                className={label === "Channels" ? "rail-active" : ""}
                aria-current={label === "Channels" ? "page" : undefined}
                onClick={() => {
                  if (label === "Channels") setPane("Channels");
                  else if (label === "Chat") setPane("Chats");
                  else
                    onMessage(
                      `${label} is illustrative here. Use Channels for operational collaboration.`,
                    );
                }}
              >
                <Glyph />
                <span>{String(label)}</span>
              </button>
            );
          })}
        </nav>
        <aside className="teams-channel-panel">
          <div className="chat-heading">
            <h2>Chat</h2>
            <button
              aria-label="Chat options"
              onClick={() => onMessage("Your channels are organised by Team.")}
            >
              <MoreHorizontal24Regular />
            </button>
          </div>
          <div className="teams-panel-tabs">
            {["Unread", "Channels", "Chats", "Meeting chats"].map((item) => (
              <button
                key={item}
                className={pane === item ? "selected" : ""}
                onClick={() => setPane(item)}
              >
                {item}
              </button>
            ))}
          </div>
          {pane === "Chats" || pane === "Meeting chats" ? (
            <div className="teams-chat-list">
              <span className="teams-nav-caption">{pane}</span>
              {(pane === "Chats"
                ? ["Jamie Brooks", "Jordan Lee"]
                : ["Weekly operations check-in", "Starter session"]
              ).map((name, i) => (
                <button
                  key={name}
                  onClick={() => {
                    selectChannel(i === 0 ? "general" : "onboarding");
                    onMessage(
                      "This example keeps coordination in the shared logistics channels.",
                    );
                  }}
                >
                  <span className="post-avatar">
                    {name
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <span>
                    {name}
                    <small>
                      {pane === "Chats"
                        ? "Operational coordination"
                        : "Meeting conversation"}
                    </small>
                  </span>
                </button>
              ))}
              <button
                className="back-to-channels"
                onClick={() => setPane("Channels")}
              >
                Back to channels
              </button>
            </div>
          ) : (
            <>
              <div className="teams-list">
                <div className="team-group">
                  <button
                    className="team-toggle"
                    aria-expanded={companyOpen}
                    onClick={() => setCompanyOpen(!companyOpen)}
                  >
                    {companyOpen ? (
                      <ChevronDown16Regular />
                    ) : (
                      <ChevronRight16Regular />
                    )}
                    <span className="team-monogram company">CU</span>
                    <strong>COMPANY UPDATES</strong>
                  </button>
                  {companyOpen &&
                    channels
                      .filter(
                        (c) =>
                          c.team === "company" &&
                          (pane !== "Unread" ||
                            ["important", "pets"].includes(c.id)),
                      )
                      .map((c) => (
                        <button
                          key={c.id}
                          className={`channel-link ${channel.id === c.id ? "channel-active" : ""}`}
                          aria-current={
                            channel.id === c.id ? "page" : undefined
                          }
                          onClick={() => selectChannel(c.id)}
                        >
                          <span>#</span>
                          {c.name}
                          {pane === "Unread" && <i />}
                        </button>
                      ))}
                </div>
                <div className="team-group">
                  <button
                    className="team-toggle"
                    aria-expanded={logisticsOpen}
                    onClick={() => setLogisticsOpen(!logisticsOpen)}
                  >
                    {logisticsOpen ? (
                      <ChevronDown16Regular />
                    ) : (
                      <ChevronRight16Regular />
                    )}
                    <span className="team-monogram logistics">CL</span>
                    <strong>
                      STREET & TELEPHONE
                      <br />
                      CAMPAIGN LOGISTICS
                    </strong>
                  </button>
                  {logisticsOpen &&
                    channels
                      .filter(
                        (c) =>
                          c.team === "logistics" &&
                          (pane !== "Unread" ||
                            ["central-city", "telephone", "general"].includes(
                              c.id,
                            )),
                      )
                      .map((c) => (
                        <button
                          key={c.id}
                          className={`channel-link ${channel.id === c.id ? "channel-active" : ""}`}
                          aria-current={
                            channel.id === c.id ? "page" : undefined
                          }
                          onClick={() => selectChannel(c.id)}
                        >
                          <span>#</span>
                          {c.name}
                          {pane === "Unread" && <i />}
                        </button>
                      ))}
                </div>
                {["Digital Projects", "People & Culture"].map((name) => (
                  <div className="team-group" key={name}>
                    <button
                      className="team-toggle"
                      aria-expanded={otherTeam === name}
                      onClick={() =>
                        setOtherTeam(otherTeam === name ? "" : name)
                      }
                    >
                      {otherTeam === name ? (
                        <ChevronDown16Regular />
                      ) : (
                        <ChevronRight16Regular />
                      )}
                      <span className="team-monogram other">
                        {name === "Digital Projects" ? "DP" : "PC"}
                      </span>
                      <strong>{name}</strong>
                    </button>
                    {otherTeam === name && (
                      <p className="collapsed-team-note">
                        No active conversations in this example.
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="teams-sidebar-bottom">
                <button onClick={onWorkspace}>
                  <Folder24Regular />
                  Open logistics workspace
                </button>
              </div>
            </>
          )}
        </aside>
        <main className="teams-main">
          <header className="channel-header">
            <div className="channel-heading">
              <span className="channel-symbol">
                <NumberSymbol24Regular />
              </span>
              <div>
                <h1>{channel.name}</h1>
                <span>
                  {channel.team === "logistics"
                    ? workspaceTitle
                    : "Company Updates"}
                </span>
              </div>
              {channel.team === "logistics" && (
                <Button
                  appearance="subtle"
                  icon={<Folder24Regular />}
                  onClick={onWorkspace}
                >
                  Open workspace
                </Button>
              )}
              <button
                className="channel-options"
                aria-label="Channel information"
                onClick={() =>
                  onMessage(
                    `${channel.purpose}${channel.team === "logistics" ? " Standard channel · shared workspace membership." : ""}`,
                  )
                }
              >
                <MoreHorizontal24Regular />
              </button>
            </div>
            <div
              className="channel-tabs"
              role="tablist"
              aria-label="Channel tabs"
            >
              {(channel.team === "logistics"
                ? ["Posts", "Shared", "Notes", "Planner"]
                : ["Posts"]
              ).map((item) => (
                <button
                  role="tab"
                  aria-selected={tab === item}
                  key={item}
                  className={tab === item ? "active" : ""}
                  onClick={() => onNavigate(channel.id, item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </header>
          <div
            role="tabpanel"
            aria-label={`${channel.name} ${tab}`}
            className={`channel-content ${tab === "Posts" ? "posts-canvas" : ""}`}
          >
            {tab === "Posts" ? (
              <>
                <div className="channel-purpose">
                  <NumberSymbol24Regular />
                  <p>{channel.purpose}</p>
                </div>
                {visiblePosts.map((p) => (
                  <article className="teams-post" key={p.id}>
                    <div className="post-top">
                      <span className="post-avatar">
                        {p.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                      <div>
                        <strong>{p.author}</strong>
                        <span>{p.time}</span>
                      </div>
                      <button
                        aria-label={`Post options for ${p.author}`}
                        onClick={() =>
                          onMessage("This is a fictional channel conversation.")
                        }
                      >
                        <MoreHorizontal24Regular />
                      </button>
                    </div>
                    {p.title && <h3>{p.title}</h3>}
                    <p>{p.text}</p>
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
                      <a
                        className="post-tracker-link"
                        href="/logistics/locations"
                      >
                        Open Locations & Permits
                      </a>
                    )}
                    {p.reply && (
                      <div className="post-reply">
                        <Chat24Regular />
                        <span>{p.reply}</span>
                      </div>
                    )}
                    {localReplies[p.id]?.map((text, i) => (
                      <div className="post-reply" key={i}>
                        <span className="post-avatar small">MC</span>
                        <span>
                          <strong>Maya Chen</strong> {text}
                        </span>
                      </div>
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
                      <form
                        className="reply-composer"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!reply.trim()) return;
                          setLocalReplies({
                            ...localReplies,
                            [p.id]: [
                              ...(localReplies[p.id] ?? []),
                              reply.trim(),
                            ],
                          });
                          setReply("");
                          setReplyTo("");
                          onMessage(
                            "Reply added locally to this fictional conversation.",
                          );
                        }}
                      >
                        <Input
                          aria-label="Reply text"
                          placeholder="Write a reply"
                          value={reply}
                          onChange={(_, d) => setReply(d.value)}
                        />
                        <Button
                          type="submit"
                          appearance="primary"
                          disabled={!reply.trim()}
                          icon={<Send20Regular />}
                        >
                          Send
                        </Button>
                      </form>
                    )}
                  </article>
                ))}
                {localPosts
                  .filter((p) => p.channel === channel.id)
                  .map((p, i) => (
                    <article className="teams-post" key={i}>
                      <div className="post-top">
                        <img
                          className="post-avatar"
                          src="/maya-avatar.svg"
                          alt="Maya Chen"
                        />
                        <div>
                          <strong>Maya Chen</strong>
                          <span>Just now</span>
                        </div>
                      </div>
                      <p>{p.text}</p>
                    </article>
                  ))}
                <form
                  className="post-composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!draft.trim()) return;
                    setLocalPosts([
                      ...localPosts,
                      { channel: channel.id, text: draft.trim() },
                    ]);
                    setDraft("");
                    onMessage(
                      "Post added locally. No message has been sent to Microsoft Teams.",
                    );
                  }}
                >
                  <label htmlFor="new-post">Start a post</label>
                  <textarea
                    id="new-post"
                    placeholder="Share an operational update"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={2}
                  />
                  <Button
                    appearance="primary"
                    type="submit"
                    icon={<Send20Regular />}
                    disabled={!draft.trim()}
                  >
                    Post
                  </Button>
                </form>
              </>
            ) : tab === "Shared" ? (
              <section className="teams-shared">
                <div className="section-heading">
                  <h2>Shared</h2>
                  <span>{channelFiles.length} files</span>
                </div>
                <p className="shared-description">
                  Files and current resources used in {channel.name}.
                </p>
                <div className="shared-command-bar">
                  <Button
                    appearance="subtle"
                    icon={<Folder24Regular />}
                    onClick={() => {
                      const file =
                        channelFiles.find((f) => f.library === "operations") ??
                        channelFiles[0];
                      if (file)
                        window.location.assign(
                          `/logistics/${file.library}${file.folder ? "?folder=" + encodeURIComponent(file.folder) : ""}`,
                        );
                      else onWorkspace();
                    }}
                  >
                    Open in SharePoint
                  </Button>
                  <Button
                    appearance="subtle"
                    icon={<Add20Regular />}
                    onClick={() =>
                      onMessage(
                        "Prototype: files are added to the shared workspace and linked here.",
                      )
                    }
                  >
                    Add file
                  </Button>
                </div>
                <FileTable
                  items={channelFiles}
                  onOpen={onOpenFile}
                  sharePointLinks
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
                  {(
                    ["To do", "In progress", "Blocked", "Done"] as TaskState[]
                  ).map((state) => (
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
                                {[
                                  "To do",
                                  "In progress",
                                  "Blocked",
                                  "Done",
                                ].map((v) => (
                                  <option key={v}>{v}</option>
                                ))}
                              </select>
                            </label>
                          </article>
                        ))}
                      {!tasks.some(
                        (t) => t.channel === channel.id && t.state === state,
                      ) && <p className="planner-empty">No tasks</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
function librariesName(id: string) {
  return (
    {
      operations: "Campaign Operations",
      resources: "Operational Resources",
      training: "Training & Onboarding",
      records: "Completed Campaign Records",
    } as Record<string, string>
  )[id];
}
