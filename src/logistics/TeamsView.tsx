import SensitivityBadge from "../sharepoint/SensitivityBadge";
import { useState, useEffect } from "react";
import AccessBoundary from "../access/AccessBoundary";
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
  postReplies,
  workspaceTitle,
  type OperationalFile,
  type TaskState,
  type Post,
} from "./data";
import { fileHref, filesForChannel } from "./query";
import { rememberStaff } from "../intranet/catalog";
import DocumentLibrary from "../sharepoint/DocumentLibrary";
import TeamsShell, { TeamsComposer } from "../teams/TeamsShell";
import { teamsPersonForSearch } from "../teams/departmentPreview";
import {
  teamsGroups,
  readChannelEntryContext,
  channelNavigationFor,
} from "../teams/navigation";
import { canSeeLogisticsChannel } from "../teams/visibility";
import "../teams/integrations.css";
import DocumentIcon from "../components/DocumentIcon";
import StaffLink from "../components/StaffLink";
import { withExplicitStaff } from "../utils/staffNavigation";
import { matchesDisplayText } from "../i18n/search";
import { useTranslation } from "../i18n/Language";

function PollOptionLabel({ label }: { label: string }) {
  const { language, t } = useTranslation();
  const protectedPhrase = "SharePoint site";
  const phraseStart = label.indexOf(protectedPhrase);
  if (phraseStart < 0) return <span>{t(label)}</span>;

  return (
    <span>
      {t(label.slice(0, phraseStart).trim())}{" "}
      <span data-no-translate>{protectedPhrase}</span>
      {language === "de" && (
        <span data-no-translate aria-hidden="true">
          {" "}
        </span>
      )}
      {t(label.slice(phraseStart + protectedPhrase.length).trim())}
    </span>
  );
}

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
  const person = teamsPersonForSearch(location.search);
  const { language, t } = useTranslation();
  const entryContext = readChannelEntryContext(
    location.pathname,
    location.search,
  );
  useEffect(() => rememberStaff(person.id), [person.id]);
  const requestedChannel = channels.find((c) => c.id === channelId);
  const channel = requestedChannel ?? channels.find((c) => c.id === "general")!;
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
  const navigation = channelNavigationFor({ person, entryContext });
  const navigationIds = new Set(
    navigation.groups.flatMap((group) => group.channels.map((item) => item.id)),
  );
  const companyChannelVisible =
    !!requestedChannel && navigationIds.has(`company:${requestedChannel.id}`);
  useEffect(() => {
    if (requestedChannel?.team === "company" && !companyChannelVisible) {
      const params = new URLSearchParams(location.search);
      params.set("channel", "important");
      params.set("tab", "Posts");
      params.delete("post");
      params.delete("file");
      location.replace(`/logistics/teams?${params}`);
    }
  }, [requestedChannel, companyChannelVisible]);
  const allowed =
    !!requestedChannel &&
    canSeeLogisticsChannel(person, channel) &&
    (channel.team !== "company" || companyChannelVisible);
  const permittedChannels = channels.filter(
    (c) =>
      navigationIds.has(`${c.team}:${c.id}`) &&
      canSeeLogisticsChannel(person, c),
  );
  const permittedFileIds = new Set(permittedChannels.flatMap((c) => c.fileIds));
  const visiblePosts = allowed
    ? posts.filter((p) => p.channel === channel.id)
    : [];
  const channelFiles = allowed ? filesForChannel(channel) : [];
  const searchChannels = permittedChannels.filter((c) =>
    matchesDisplayText(c.name, search),
  );
  const searchFiles = files
    .filter((f) => permittedFileIds.has(f.id))
    .filter((f) => matchesDisplayText(f.name, search));
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
      channelName={requestedChannel?.name || channelId}
      channelDescription={channel.id === "pets" ? "& Other Animals" : undefined}
      groups={teamsGroups(person, entryContext).map((group) => ({
        ...group,
        channels: group.channels.map((item) => ({
          ...item,
          onSelect: ["company", "logistics"].includes(group.id)
            ? () => selectChannel(item.id.split(":")[1])
            : item.onSelect,
        })),
      }))}
      selectedChannelId={`${channel.team}:${channel.id}`}
      activeTab={tab}
      tabs={
        channel.team === "logistics"
          ? ["Posts", "Shared", "Notes", "Planner"]
          : ["Posts"]
      }
      onTabChange={(next) => onNavigate(channel.id, next)}
      onOpenSharePoint={
        channel.team === "logistics" && allowed
          ? () => {
              const params = new URLSearchParams(location.search);
              const selectedFile = channelFiles.find(
                (f) => f.id === params.get("file"),
              );
              if (selectedFile) {
                location.assign(withExplicitStaff(fileHref(selectedFile)));
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
                withExplicitStaff(
                  `/logistics/${source.library}${folder.size ? "?" + folder : ""}`,
                ),
              );
            }
          : undefined
      }
      onChannelInfo={allowed ? () => onMessage(channel.purpose) : undefined}
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
                  <SensitivityBadge value={f.sensitivity} />
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
        {!allowed ? (
          <AccessBoundary
            workspaceId="logistics"
            area="Operational team channel"
            resource={{ kind: "channel", workspaceId: channel.team, channelId }}
            personId={person.id}
            headingLevel={2}
            compact
            returnHref={`/logistics/teams?staff=${person.id}&channel=important`}
            returnLabel="Open company updates"
          />
        ) : tab === "Posts" ? (
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
                {p.poll ? (
                  (() => {
                    const highestVotes = Math.max(
                      ...p.poll.options.map(({ votes }) => votes),
                    );
                    const totalVotes = p.poll.options.reduce(
                      (sum, item) => sum + item.votes,
                      0,
                    );
                    return (
                      <section
                        className="channel-poll"
                        aria-label="Poll results"
                      >
                        <h3>{p.poll.question}</h3>
                        <div className="channel-poll-options">
                          {p.poll.options.map((option) => {
                            const winning = option.votes === highestVotes;
                            return (
                              <div
                                className={`channel-poll-option${winning ? " is-leading" : ""}`}
                                key={option.label}
                              >
                                <div className="channel-poll-option-label">
                                  <PollOptionLabel label={option.label} />
                                  <strong>
                                    {option.votes}{" "}
                                    {t(option.votes === 1 ? "vote" : "votes")}
                                  </strong>
                                </div>
                                <div
                                  className="channel-poll-track"
                                  role="img"
                                  aria-label={
                                    language === "de"
                                      ? `${option.votes} von ${totalVotes} ${t("votes")}`
                                      : `${option.votes} of ${totalVotes} votes`
                                  }
                                >
                                  <span
                                    style={{
                                      width: `${(option.votes / totalVotes) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <small className="channel-poll-total">
                          {totalVotes} {t(totalVotes === 1 ? "vote" : "votes")}
                        </small>
                      </section>
                    );
                  })()
                ) : (
                  <p>{p.text}</p>
                )}
                {p.image && (
                  <PostPhoto image={p.image} first={p.id === "post-daisy"} />
                )}
                {channel.id === "pets" && (
                  <PostReactions reactions={p.reactions || []} t={t} />
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
                            <SensitivityBadge value={f.sensitivity} />
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
                  <StaffLink
                    className="post-tracker-link"
                    href="/logistics/locations"
                  >
                    Open Locations & Permits
                  </StaffLink>
                )}
                {postReplies(p).map((postReply, index) => (
                  <ThreadReply
                    key={`${postReply.author}-${postReply.time || index}`}
                    author={postReply.author}
                    text={postReply.text}
                    time={postReply.time || p.time}
                    reactions={p.id === "post-daisy" && index === 0}
                  />
                ))}
                {localReplies[p.id]?.map((text, i) => (
                  <ThreadReply
                    key={i}
                    author={person.name}
                    text={text}
                    time="Just now"
                    authored
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
                  <p data-no-translate>{p.text}</p>
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
                sensitivity: f.sensitivity,
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

function PostReactions({
  reactions,
  t,
}: {
  reactions: NonNullable<Post["reactions"]>;
  t: (key: string) => string;
}) {
  const [counts, setCounts] = useState(reactions);
  const [selected, setSelected] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const choices = [
    { emoji: "👍", name: "Like" },
    { emoji: "❤️", name: "Love" },
    { emoji: "😂", name: "Laugh" },
    { emoji: "😮", name: "Surprised" },
    { emoji: "🎉", name: "Celebrate" },
  ];

  function toggle(emoji: string) {
    const removing = selected.includes(emoji);
    setSelected((current) =>
      removing ? current.filter((item) => item !== emoji) : [...current, emoji],
    );
    setCounts((current) => {
      const found = current.find((item) => item.emoji === emoji);
      if (!found) return removing ? current : [...current, { emoji, count: 1 }];
      const count = found.count + (removing ? -1 : 1);
      return count > 0
        ? current.map((item) =>
            item.emoji === emoji ? { ...item, count } : item,
          )
        : current.filter((item) => item.emoji !== emoji);
    });
  }

  return (
    <div className="thread-reactions post-reactions" aria-label="Post reactions">
      {counts.map(({ emoji, count }) => (
        <button
          className="post-reaction-chip"
          key={emoji}
          aria-label={`${emoji}, ${count} reactions`}
          aria-pressed={selected.includes(emoji)}
          onClick={() => toggle(emoji)}
        >
          <span aria-hidden="true">{emoji}</span>
          {count}
        </button>
      ))}
      <button
        className="post-reaction-add"
        aria-label={t("Add reaction")}
        aria-expanded={pickerOpen}
        onClick={() => setPickerOpen((open) => !open)}
      >
        <span aria-hidden="true">+</span>
      </button>
      {pickerOpen && (
        <div className="post-reaction-picker" role="group" aria-label={t("Choose a reaction")}>
          {choices.map(({ emoji, name }) => (
            <button
              key={emoji}
              title={t(name)}
              aria-label={t(name)}
              aria-pressed={selected.includes(emoji)}
              onClick={() => {
                toggle(emoji);
                setPickerOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PostPhoto({
  image,
  first,
}: {
  image: NonNullable<Post["image"]>;
  first: boolean;
}) {
  const picture = (
    <img
      className={image.frame ? undefined : "post-photo"}
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading={first ? "eager" : "lazy"}
      fetchPriority={first ? "high" : undefined}
      decoding="async"
      style={
        image.frame
          ? {
              width: `${(image.width / image.frame[2]) * 100}%`,
              left: `${(-image.frame[0] / image.frame[2]) * 100}%`,
              top: `${(-image.frame[1] / image.frame[3]) * 100}%`,
            }
          : undefined
      }
    />
  );
  if (!image.frame) return picture;
  const ratio = image.frame[2] / image.frame[3];
  return (
    <div
      className="post-photo-frame"
      style={{ width: Math.min(300, 280 * ratio), aspectRatio: ratio }}
    >
      {picture}
    </div>
  );
}

function ThreadReply({
  author,
  text,
  time,
  reactions = false,
  authored = false,
}: {
  author: string;
  text: string;
  time: string;
  reactions?: boolean;
  authored?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const choices = reactions
    ? [
        { emoji: "👍", name: "Like", count: reactions ? 3 : 0 },
        { emoji: "😂", name: "Laugh", count: reactions ? 2 : 0 },
        { emoji: "❤️", name: "Love", count: reactions ? 1 : 0 },
        { emoji: "😮", name: "Surprised", count: 0 },
        { emoji: "🐱", name: "Cat", count: reactions ? 2 : 0 },
        { emoji: "👽", name: "Alien", count: reactions ? 1 : 0 },
      ]
    : [
        { emoji: "👍", name: "Like", count: 0 },
        { emoji: "✅", name: "Agreed", count: 0 },
        { emoji: "👀", name: "Seen", count: 0 },
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
        <p data-no-translate={authored || undefined}>{text}</p>
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
