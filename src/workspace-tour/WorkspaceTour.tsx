import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight20Regular,
  BookOpen24Regular,
  Calendar24Regular,
  CheckmarkCircle20Regular,
  DocumentFolder24Regular,
  Document24Regular,
  Home24Regular,
  Info20Regular,
  People24Regular,
} from "@fluentui/react-icons";
import WorkspaceIcon from "../components/WorkspaceIcon";
import ArchitectureContent from "../intranet/ArchitectureContent";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import type { OperationalFile } from "../logistics/data";
import DocumentLibrary from "../sharepoint/DocumentLibrary";
import TeamsShell, { TeamsComposer } from "../teams/TeamsShell";
import { withExplicitStaff } from "../utils/staffNavigation";
import { matchesDisplayText } from "../i18n/search";
import {
  activityChannels,
  activityFiles,
  activityFolders,
  activityLibrary,
  activitySearchFiles,
} from "./data";
import "../intranet/architecture-page.css";
import "../intranet/architecture-hubs.css";
import "../intranet/styles.css";
import "../sharepoint/fidelity.css";
import "../sharepoint/styles.css";
import "../teams/styles.css";
import "./styles.css";

function destination(path: string) {
  return withExplicitStaff(path);
}

function libraryDestination(file?: string) {
  const current = new URLSearchParams(location.search);
  const params = new URLSearchParams();
  for (const key of ["staff", "demo"]) {
    const value = current.get(key);
    if (value) params.set(key, value);
  }
  params.set("library", activityLibrary.name);
  if (file) params.set("file", file);
  else params.delete("file");
  params.delete("folder");
  return withExplicitStaff(`/workspace-tour/workspace/documents?${params}`);
}

function channelDestination(channel = "coordination", tab = "Posts") {
  const current = new URLSearchParams(location.search);
  const params = new URLSearchParams();
  for (const key of ["staff", "demo"]) {
    const value = current.get(key);
    if (value) params.set(key, value);
  }
  params.set("channel", channel);
  params.set("tab", tab);
  return withExplicitStaff(`/workspace-tour/channels?${params}`);
}

function GuidePanel({
  title = "A few things to notice",
  notes,
}: {
  title?: string;
  notes: string[];
}) {
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem("workspace-tour-guidance-hidden") === "yes";
    } catch {
      return false;
    }
  });
  function toggle() {
    setHidden((current) => {
      const next = !current;
      try {
        sessionStorage.setItem(
          "workspace-tour-guidance-hidden",
          next ? "yes" : "no",
        );
      } catch {
        // Guidance still works if session storage is unavailable.
      }
      return next;
    });
  }
  return (
    <aside className="workspace-tour-guide" aria-label={title}>
      <div className="workspace-tour-guide-heading">
        <div>
          <Info20Regular aria-hidden="true" />
          <h2>{title}</h2>
        </div>
        <button type="button" onClick={toggle} aria-expanded={!hidden}>
          {hidden ? "Show guidance" : "Hide guidance"}
        </button>
      </div>
      {!hidden && (
        <ul>
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function IntranetHeader({ active = false }: { active?: boolean }) {
  return (
    <div className="workspace-tour-intranet-chrome">
      <header className="directory-brand">
        <span className="workspace-tour-app-grid" aria-hidden="true">
          •••
          <br />
          •••
          <br />
          •••
        </span>
        <strong>Site</strong>
        <span className="directory-brand-end">Company intranet</span>
      </header>
      <nav className="directory-nav" aria-label="Intranet navigation">
        <img
          className="directory-company-mark"
          src="/images/company-mark.png"
          alt=""
          width="40"
          height="32"
        />
        <strong>Sample Organisation</strong>
        {["Home", "News", "Our organisation", "Tools & support"].map(
          (label) => (
            <button type="button" disabled key={label}>
              {label}
            </button>
          ),
        )}
        <a
          href={destination("/architecture")}
          aria-current={active ? "page" : undefined}
        >
          Digital Workspaces
        </a>
      </nav>
    </div>
  );
}

function ActivityDirectory() {
  return (
    <div className="workspace-tour-directory-page">
      <IntranetHeader active />
      <main className="workspace-tour-directory-main">
        <div className="directory-heading">
          <div>
            <h1>What is a workspace?</h1>
            <p>See how workspaces, files and channels fit together.</p>
          </div>
          <span className="workspace-tour-in-development">In development</span>
        </div>
        <section
          className="workspace-tour-directory-stage"
          aria-label="Guided workspace example"
        >
          <div
            className="workspace-tour-architecture-context"
            aria-hidden="true"
            inert
          >
            <div className="architecture-poc-page">
              <div className="intranet-directory">
                <main className="directory-main">
                  <ArchitectureContent />
                </main>
              </div>
            </div>
          </div>
          <div className="workspace-tour-entry-card">
            <div className="workspace-tour-entry-heading">
              <span className="workspace-tour-entry-icon">
                <WorkspaceIcon />
              </span>
              <div>
                <span>Guided example</span>
                <h2>Activity Workspace</h2>
              </div>
            </div>
            <p>A sample workspace for everyday project activity.</p>
            <a
              className="workspace-tour-primary-link"
              href={destination("/workspace-tour/workspace")}
            >
              Enter workspace <ArrowRight20Regular aria-hidden="true" />
            </a>
          </div>
          <aside
            className="workspace-tour-directory-guide"
            aria-label="How to find and use workspaces"
          >
            <div className="workspace-tour-steps-heading">
              <Info20Regular aria-hidden="true" />
              <h2>How to find your way</h2>
            </div>
            <ol>
              <li>
                <span>1</span>
                <p>You can find all workspaces directly from the intranet.</p>
              </li>
              <li>
                <span>2</span>
                <p>
                  Choose the workspace for the activity you want to work on.
                </p>
              </li>
              <li>
                <span>3</span>
                <p>
                  Tools you need for the work can be linked from the same place.
                </p>
              </li>
              <li>
                <span>4</span>
                <p>
                  You can see where work happens, while restricted areas still
                  follow access rules.
                </p>
              </li>
            </ol>
            <p className="workspace-tour-bookmark-note">
              You can bookmark the workspaces and folders you use most. During
              rollout, support will help update important links, bookmarks and
              synced folders so your usual shortcuts still work.
            </p>
          </aside>
        </section>
        <p className="workspace-tour-fiction-note">
          Fictional names and sample content for this walkthrough.
        </p>
      </main>
    </div>
  );
}

const workspaceSections = [
  {
    id: "home",
    label: "Home",
    href: "/workspace-tour/workspace",
    icon: Home24Regular,
  },
  {
    id: "documents",
    label: "Working documents",
    href: "/workspace-tour/workspace/documents",
    icon: DocumentFolder24Regular,
  },
  {
    id: "reference",
    label: "Reference & guidance",
    href: "/workspace-tour/workspace/reference",
    icon: BookOpen24Regular,
  },
  {
    id: "calendar",
    label: "Shared calendar",
    href: "/workspace-tour/workspace/calendar",
    icon: Calendar24Regular,
  },
  {
    id: "completed",
    label: "Completed work",
    href: "/workspace-tour/workspace/completed",
    icon: CheckmarkCircle20Regular,
  },
];

function WorkspaceLayout({
  current,
  children,
}: {
  current: string;
  children: ReactNode;
}) {
  const [message, setMessage] = useState("");
  const handleOpen = (file: OperationalFile) =>
    location.assign(libraryDestination(file.id));
  return (
    <div className="app-shell workspace-tour-shell">
      <WorkspaceHeader
        title="Activity Workspace"
        userName="Taylor Reed"
        userRole="Workspace member"
        searchFiles={activitySearchFiles}
        onOpen={handleOpen}
        onTeams={() => location.assign(channelDestination())}
        onMessage={setMessage}
        helpText="Use the workspace home to orient yourself, shared documents for files, and channels for coordination."
        memberCount={18}
      />
      <div className="workspace workspace-tour-workspace">
        <aside className="sidebar workspace-tour-sidebar">
          <nav aria-label="Activity Workspace navigation">
            {workspaceSections.map(({ id, label, href, icon: Icon }) => (
              <a
                key={id}
                href={destination(href)}
                className={current === id ? "nav-active" : ""}
                aria-current={current === id ? "page" : undefined}
              >
                <Icon aria-hidden="true" />
                {label}
              </a>
            ))}
          </nav>
          <div className="sidebar-footer">
            <a href={channelDestination()}>
              <People24Regular aria-hidden="true" />
              Open channels
            </a>
          </div>
        </aside>
        <main
          className="main-content workspace-tour-main"
          id="activity-workspace-main"
        >
          {children}
          {message && (
            <div className="workspace-tour-toast" role="status">
              <span>{message}</span>
              <button
                type="button"
                aria-label="Dismiss message"
                onClick={() => setMessage("")}
              >
                ×
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function WorkspaceHome() {
  return (
    <>
      <GuidePanel
        notes={[
          "The home page brings together the information and shortcuts people need most.",
          "Use the navigation on the left to move between the workspace home, files and reference material.",
          "The workspace header keeps search, channels and workspace details close at hand.",
          "Bookmark this workspace or a folder you use often; support can help keep important shortcuts working during rollout.",
        ]}
      />
      <div className="workspace-tour-page-heading">
        <span>Workspace home</span>
        <h1>Activity Workspace</h1>
        <p>
          A shared place for the work, its files and the conversations around
          it.
        </p>
      </div>
      <div className="workspace-tour-home-grid">
        <section className="workspace-tour-home-card workspace-tour-welcome-card">
          <span className="workspace-tour-card-eyebrow">Start here</span>
          <h2>Keep activity moving</h2>
          <p>
            Find current priorities, shared guidance and the people coordinating
            the work.
          </p>
          <a href={destination("/workspace-tour/workspace/documents")}>
            Browse working documents <ArrowRight20Regular aria-hidden="true" />
          </a>
        </section>
        <section className="workspace-tour-home-card">
          <div className="workspace-tour-card-heading">
            <Document24Regular aria-hidden="true" />
            <h2>Working documents</h2>
          </div>
          <p>Current plans, checklists and meeting notes.</p>
          <a href={destination("/workspace-tour/workspace/documents")}>
            Open files <ArrowRight20Regular aria-hidden="true" />
          </a>
        </section>
        <section className="workspace-tour-home-card">
          <div className="workspace-tour-card-heading">
            <People24Regular aria-hidden="true" />
            <h2>Channels</h2>
          </div>
          <p>Conversations and coordination for this workspace.</p>
          <a href={channelDestination()}>
            Open channels <ArrowRight20Regular aria-hidden="true" />
          </a>
        </section>
        <section className="workspace-tour-home-card">
          <div className="workspace-tour-card-heading">
            <BookOpen24Regular aria-hidden="true" />
            <h2>Reference & guidance</h2>
          </div>
          <p>Reusable templates and practical information.</p>
          <a href={destination("/workspace-tour/workspace/reference")}>
            Browse guidance <ArrowRight20Regular aria-hidden="true" />
          </a>
        </section>
      </div>
      <section
        className="workspace-tour-latest"
        aria-labelledby="workspace-tour-latest-heading"
      >
        <h2 id="workspace-tour-latest-heading">Recently updated</h2>
        {activityFiles.slice(0, 3).map((file) => (
          <a key={file.id} href={libraryDestination(file.id)}>
            <Document24Regular aria-hidden="true" />
            <span>
              {file.name}
              <small>
                {file.owner} · {file.modified}
              </small>
            </span>
            <ArrowRight20Regular aria-hidden="true" />
          </a>
        ))}
      </section>
    </>
  );
}

function WorkspaceLibrary({
  kind,
}: {
  kind: "documents" | "reference" | "completed";
}) {
  const files = useMemo(
    () =>
      kind === "reference"
        ? activityFiles.filter((file) => file.folder === "Reference material")
        : kind === "completed"
          ? activityFiles.filter((file) => file.folder === "Completed work")
          : activityFiles,
    [kind],
  );
  const title =
    kind === "reference"
      ? "Reference & guidance"
      : kind === "completed"
        ? "Completed work"
        : activityLibrary.name;
  const initialFolder =
    kind === "reference"
      ? "Reference material"
      : kind === "completed"
        ? "Completed work"
        : "";
  const selectedFileId = new URLSearchParams(location.search).get("file");
  const [bookmarkedFolders, setBookmarkedFolders] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("activity-workspace-folder-bookmarks") || "[]",
      ) as string[];
    } catch {
      return [];
    }
  });
  const toggleFolderBookmark = (folder: string) => {
    setBookmarkedFolders((current) => {
      const next = current.includes(folder)
        ? current.filter((item) => item !== folder)
        : [...current, folder];
      try {
        localStorage.setItem(
          "activity-workspace-folder-bookmarks",
          JSON.stringify(next),
        );
      } catch {
        // The folder remains available through the library if storage is unavailable.
      }
      return next;
    });
  };
  const notes = selectedFileId
    ? [
        "Open a file’s details to check its owner, status and sensitivity.",
        "Version history shows earlier versions and the notes attached to each change.",
        "A sensitivity label describes how information should be handled; access still follows the relevant rules.",
      ]
    : kind === "documents"
      ? [
          "Keep folders shallow and name files so their purpose is clear.",
          "Search this workspace to find a file by its name, owner, status or metadata.",
          "Use columns to sort and filter by owner, status, sensitivity or other useful metadata.",
          "Open a file’s details for its owner, status and sensitivity; version history keeps earlier versions available.",
        ]
      : [
          "Reference material is kept apart from active work so reusable guidance is easy to find.",
          "Search and columns help narrow the files shown in this library.",
          "Open a file’s details to see its owner, status and sensitivity, or review its version history.",
        ];
  return (
    <>
      <GuidePanel title="Working with files" notes={notes} />
      <div className="workspace-tour-page-heading">
        <span>
          {kind === "documents" ? "Shared files" : "Workspace library"}
        </span>
        <h1>{title}</h1>
        <p>
          Shared files live in this workspace, with clear ownership and useful
          context.
        </p>
      </div>
      {kind === "documents" && (
        <div className="workspace-tour-library-bookmark">
          <Info20Regular aria-hidden="true" />
          <span>
            You can bookmark the workspace and the folders you use most. Support
            can help update important links, bookmarks and synced folders during
            rollout.
          </span>
        </div>
      )}
      {kind === "documents" && (
        <section
          className="workspace-tour-folder-bookmarks"
          aria-label="Folder bookmarks"
        >
          {activityFolders.map((folder) => {
            const params = new URLSearchParams(location.search);
            params.set("library", activityLibrary.name);
            params.set("folder", folder);
            params.delete("file");
            const saved = bookmarkedFolders.includes(folder);
            return (
              <div key={folder}>
                <a
                  href={destination(
                    `/workspace-tour/workspace/documents?${params}`,
                  )}
                >
                  {folder}
                </a>
                <button
                  type="button"
                  aria-pressed={saved}
                  aria-label={`${saved ? "Remove bookmark for" : "Bookmark"} ${folder}`}
                  onClick={() => toggleFolderBookmark(folder)}
                >
                  {saved ? "★ Bookmarked" : "☆ Bookmark"}
                </button>
              </div>
            );
          })}
        </section>
      )}
      <DocumentLibrary
        title={title}
        definition={activityLibrary}
        files={files}
        folders={activityFolders}
        initialFolder={initialFolder}
      />
    </>
  );
}

function WorkspaceCalendar() {
  return (
    <>
      <GuidePanel
        title="Shared calendar"
        notes={[
          "The shared calendar helps people see key dates and coordination points.",
          "Keep working files in the library and use channels for the conversation around them.",
        ]}
      />
      <div className="workspace-tour-page-heading">
        <span>Workspace schedule</span>
        <h1>Shared calendar</h1>
        <p>Upcoming moments for the Activity Workspace.</p>
      </div>
      <section
        className="workspace-tour-calendar"
        aria-label="Upcoming workspace events"
      >
        {[
          ["19 October", "Weekly coordination", "10:00–10:30 · Meeting room 2"],
          ["21 October", "Draft review", "14:00–14:45 · Online"],
          ["23 October", "Share weekly update", "By 16:00 · Updates channel"],
        ].map(([date, title, detail]) => (
          <article key={title}>
            <time>{date}</time>
            <div>
              <h2>{title}</h2>
              <p>{detail}</p>
            </div>
            <Calendar24Regular aria-hidden="true" />
          </article>
        ))}
      </section>
    </>
  );
}

function ChannelPosts({ channel }: { channel: string }) {
  const [draft, setDraft] = useState("");
  const [posts, setPosts] = useState([
    {
      author: "Alex Morgan",
      time: "Today at 09:15",
      text:
        channel === "updates"
          ? "The weekly priorities are ready for review. The current version is in Working documents."
          : channel === "review"
            ? "Please add comments to the delivery checklist by Thursday afternoon."
            : "Welcome to the workspace. Use this channel to coordinate next steps; shared files stay in the workspace library.",
    },
  ]);
  return (
    <div className="workspace-tour-channel-posts">
      <GuidePanel
        title="How channels fit in"
        notes={[
          "Channels are for conversations and coordination; the shared files stay in the workspace.",
          "Use a focused channel for each ongoing topic, and keep channels you do not use out of the way.",
          "Open the Shared tab to see the same workspace files shown in the library.",
        ]}
      />
      <div className="workspace-tour-post-list">
        {posts.map((post, index) => (
          <article
            className="workspace-tour-post"
            key={`${post.author}-${index}`}
          >
            <span className="workspace-tour-post-avatar">
              {post.author
                .split(" ")
                .map((name) => name[0])
                .join("")}
            </span>
            <div>
              <header>
                <strong>{post.author}</strong>
                <time>{post.time}</time>
              </header>
              <p>{post.text}</p>
              {index === 0 && channel === "coordination" && (
                <a href={libraryDestination("activity-weekly-priorities")}>
                  Weekly priorities.docx{" "}
                  <ArrowRight20Regular aria-hidden="true" />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
      <TeamsComposer
        value={draft}
        onChange={setDraft}
        onSend={() => {
          setPosts((current) => [
            { author: "Taylor Reed", time: "Just now", text: draft },
            ...current,
          ]);
          setDraft("");
        }}
        placeholder="Start a post"
      />
    </div>
  );
}

function ActivityChannels() {
  const params = new URLSearchParams(location.search);
  const requestedChannel = params.get("channel") ?? "coordination";
  const channel =
    activityChannels.find((item) => item.id === requestedChannel) ??
    activityChannels[0];
  const tab = params.get("tab") === "Shared" ? "Shared" : "Posts";
  const [search, setSearch] = useState("");
  const groups = [
    {
      id: "activity-workspace",
      label: "Activity Workspace",
      channels: activityChannels.map((item) => ({
        ...item,
        onSelect: () => location.assign(channelDestination(item.id)),
      })),
    },
  ];
  const channelMatches = activityChannels.filter((item) =>
    matchesDisplayText(item.label, search),
  );
  const fileMatches = activityFiles.filter((file) =>
    matchesDisplayText(
      `${file.name} ${file.folder} ${file.owner} ${file.status}`,
      search,
    ),
  );
  const searchResults = search.trim() ? (
    <div className="workspace-tour-channel-search-results">
      <strong>Channels</strong>
      {channelMatches.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => location.assign(channelDestination(item.id))}
        >
          {item.label}
        </button>
      ))}
      <strong>Files</strong>
      {fileMatches.map((file) => (
        <button
          key={file.id}
          type="button"
          onClick={() => location.assign(libraryDestination(file.id))}
        >
          {file.name}
          <small>{file.owner}</small>
        </button>
      ))}
      {!channelMatches.length && !fileMatches.length && (
        <p>No results found.</p>
      )}
    </div>
  ) : undefined;
  return (
    <TeamsShell
      userName="Taylor Reed"
      teamName="Activity Workspace"
      channelName={channel.label}
      channelLabel="Channels"
      groups={groups}
      selectedChannelId={channel.id}
      activeTab={tab}
      tabs={["Posts", "Shared"]}
      onTabChange={(next) =>
        location.assign(channelDestination(channel.id, next))
      }
      onOpenSharePoint={() =>
        location.assign(destination("/workspace-tour/workspace"))
      }
      searchValue={search}
      onSearchChange={setSearch}
      searchResults={searchResults}
    >
      {tab === "Posts" ? (
        <ChannelPosts channel={channel.id} />
      ) : (
        <div className="workspace-tour-shared">
          <GuidePanel
            title="Files shared in this workspace"
            notes={[
              "These are the same files available from Working documents.",
              "Use the workspace library for folders, search, metadata, file details and version history.",
            ]}
          />
          <DocumentLibrary
            title="Shared files"
            definition={activityLibrary}
            files={activityFiles}
            folders={activityFolders}
            embedded
            maxEmbeddedRows={activityFiles.length}
          />
          <a
            className="workspace-tour-text-link"
            href={destination("/workspace-tour/workspace/documents")}
          >
            Open all working documents{" "}
            <ArrowRight20Regular aria-hidden="true" />
          </a>
        </div>
      )}
    </TeamsShell>
  );
}

export default function WorkspaceTour() {
  const path = location.pathname.replace(/\/+$/, "") || "/workspace-tour";
  if (path === "/workspace-tour") return <ActivityDirectory />;
  if (path === "/workspace-tour/channels") return <ActivityChannels />;
  const section = path.split("/")[3] ?? "home";
  const current = ["documents", "reference", "calendar", "completed"].includes(
    section,
  )
    ? section
    : "home";
  return (
    <WorkspaceLayout current={current}>
      {current === "home" ? (
        <WorkspaceHome />
      ) : current === "calendar" ? (
        <WorkspaceCalendar />
      ) : (
        <WorkspaceLibrary
          kind={current as "documents" | "reference" | "completed"}
        />
      )}
    </WorkspaceLayout>
  );
}
