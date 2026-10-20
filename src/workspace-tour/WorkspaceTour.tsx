import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight20Regular,
  BookOpen24Regular,
  Calendar24Regular,
  CheckmarkCircle20Regular,
  ChevronRight16Regular,
  DocumentFolder24Regular,
  Document24Regular,
  Home24Regular,
  Info20Regular,
  People24Regular,
} from "@fluentui/react-icons";
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

type TourTopic = {
  id: string;
  label: string;
  body: string;
  target?: string;
};
function WorkspaceTourGuide({
  topics,
  children,
}: {
  topics: TourTopic[];
  children: ReactNode;
}) {
  const [selectedId, setSelectedId] = useState(topics[0]?.id ?? "");
  const [visible, setVisible] = useState(true);
  const selected = topics.find((topic) => topic.id === selectedId) ?? topics[0];
  const selectTopic = (id: string) => {
    setSelectedId(id);
    const topic = topics.find((item) => item.id === id);
    const target = topic?.target
      ? document.querySelector<HTMLElement>(
          `[data-tour-target="${topic.target}"]`,
        )
      : null;
    document
      .querySelectorAll(".workspace-tour-target-active")
      .forEach((element) =>
        element.classList.remove("workspace-tour-target-active"),
      );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("workspace-tour-target-active");
      window.setTimeout(
        () => target.classList.remove("workspace-tour-target-active"),
        2400,
      );
    }
  };
  return (
    <div className="workspace-tour-guided-layout">
      <div className="workspace-tour-guided-site">{children}</div>
      {visible ? (
        <aside
          className="workspace-tour-guide"
          aria-label="Interactive tour guide"
        >
          <div className="workspace-tour-guide-heading">
            <span>Guided example</span>
            <button type="button" onClick={() => setVisible(false)}>
              Hide guidance
            </button>
          </div>
          <h2>Explore this page</h2>
          <p className="workspace-tour-guide-intro">
            This guide sits outside the workspace. Choose a label to see what
            each part does.
          </p>
          <nav aria-label="Explore topics">
            {topics.map((topic, index) => (
              <button
                key={topic.id}
                type="button"
                aria-pressed={selected?.id === topic.id}
                onClick={() => selectTopic(topic.id)}
              >
                <span>{index + 1}</span>
                <strong>{topic.label}</strong>
                <ChevronRight16Regular aria-hidden="true" />
              </button>
            ))}
          </nav>
          {selected && (
            <section
              className="workspace-tour-guide-detail"
              aria-live="polite"
              aria-label={`About ${selected.label}`}
            >
              <div>
                <Info20Regular aria-hidden="true" />
                <span>About this part</span>
              </div>
              <h3>{selected.label}</h3>
              <p>{selected.body}</p>
            </section>
          )}
        </aside>
      ) : (
        <button
          className="workspace-tour-guide-show"
          type="button"
          onClick={() => setVisible(true)}
        >
          <Info20Regular aria-hidden="true" /> Show guidance
        </button>
      )}
    </div>
  );
}

const homeTopics: TourTopic[] = [
  {
    id: "workspace",
    label: "Workspace",
    body: "A shared starting point for current work, useful links and recent files.",
    target: "home-overview",
  },
  {
    id: "navigation",
    label: "Navigation",
    body: "Use the menu inside the workspace to move between its home, files, reference material and calendar.",
    target: "workspace-navigation",
  },
  {
    id: "channels",
    label: "Channels",
    body: "Open Channels for conversations and coordination. Shared files remain in the workspace library.",
    target: "open-channels",
  },
  {
    id: "settings",
    label: "Settings",
    body: "The site settings and language controls are available in the workspace header.",
    target: "workspace-settings",
  },
  {
    id: "recent-files",
    label: "Recent files",
    body: "Recently updated files link directly to the relevant document in the library.",
    target: "home-recent-files",
  },
];

const libraryTopics: TourTopic[] = [
  {
    id: "document-library",
    label: "Document library",
    body: "The library is the shared home for working files. Folders, search and saved views help people find the right item.",
    target: "document-library",
  },
  {
    id: "columns",
    label: "Columns",
    body: "Columns organise the list. Each file shows its name, owner, status, sensitivity and last modified date.",
    target: "library-columns",
  },
  {
    id: "owners",
    label: "File owners",
    body: "The Owner column shows who is responsible for each file. Open its details for the complete set of properties.",
    target: "library-owner",
  },
  {
    id: "metadata",
    label: "Metadata",
    body: "Status, sensitivity, workstream and period describe a file and make it easier to sort, filter and search.",
    target: "library-metadata",
  },
  {
    id: "file-details",
    label: "File details",
    body: "Use a file’s action menu and choose Details to see its owner, metadata and version history.",
    target: "library-file-actions",
  },
  {
    id: "search-and-views",
    label: "Search and views",
    body: "Search finds files by name, owner, status or metadata. Saved views show useful subsets of the same library.",
    target: "library-search",
  },
  {
    id: "folders",
    label: "Folders",
    body: "Folders group working files, reference material and completed work while the library keeps them together.",
    target: "document-library",
  },
  {
    id: "links-out",
    label: "Links out",
    body: "Use Channels for the discussion around a file. The file itself stays in this library, with its properties and versions together.",
    target: "open-channels",
  },
];

const calendarTopics: TourTopic[] = [
  {
    id: "calendar",
    label: "Shared calendar",
    body: "The calendar highlights key dates connected to the work in this workspace.",
    target: "workspace-calendar",
  },
  {
    id: "channels",
    label: "Channels",
    body: "Open Channels to discuss dates and coordinate next steps with the group.",
    target: "open-channels",
  },
];

const channelPostTopics: TourTopic[] = [
  {
    id: "posts",
    label: "Channel posts",
    body: "Posts keep updates and questions together by topic. Use the channel list to switch conversations.",
    target: "channel-posts",
  },
  {
    id: "shared-files",
    label: "Shared files",
    body: "The Shared tab shows the same workspace files as the library, so the conversation and documents stay connected.",
    target: "channel-tabs",
  },
  {
    id: "workspace-library",
    label: "Workspace library",
    body: "Open Working documents to use folders, saved views and the full file details.",
    target: "channel-tabs",
  },
];

const channelSharedTopics: TourTopic[] = libraryTopics;

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
  const annotations = [
    {
      id: "navigation",
      title: "Consistent navigation",
      body: "A familiar menu makes it easy to find your way around.",
      className: "annotation-navigation",
      path: "M160 158 C137 172 108 192 78 216",
      mobilePath: "M151 207 C127 211 101 220 75 232",
    },
    {
      id: "channels",
      title: "Channels for live coordination",
      body: "Talk through day-to-day work while shared files stay in the workspace.",
      className: "annotation-channels",
      path: "M860 72 C884 68 907 71 930 77",
      mobilePath: "M312 66 C315 69 319 73 322 78",
    },
    {
      id: "naming",
      title: "Naming convention",
      body: "Clear names make documents easier to recognise and search.",
      className: "annotation-naming",
      path: "M320 307 C311 329 300 352 290 378",
      mobilePath: "M226 510 C205 503 180 490 155 480",
    },
    {
      id: "status",
      title: "Status",
      body: "See whether a document is draft, in review or complete.",
      className: "annotation-status",
      path: "M710 307 C705 329 699 353 700 378",
      mobilePath: "M164 592 C205 566 246 520 286 480",
    },
    {
      id: "metadata",
      title: "Automatic metadata",
      body: "Useful details are applied consistently, making files easier to organise, filter and find.",
      className: "annotation-metadata",
      path: "M558 302 C561 315 564 328 567 340",
      mobilePath: "M164 470 C184 473 204 477 221 480",
    },
    {
      id: "sensitivity",
      title: "Sensitivity",
      body: "Clear labels show how information should be handled.",
      className: "annotation-sensitivity",
      path: "M900 418 C915 405 930 390 944 378",
      mobilePath: "M226 592 C264 561 308 520 350 480",
    },
  ];
  return (
    <div className="workspace-tour-directory-page">
      <IntranetHeader active />
      <main className="workspace-tour-directory-main">
        <div className="directory-heading">
          <div>
            <h1>What is a workspace?</h1>
            <p className="workspace-tour-directory-subtitle">
              Interactive tour
            </p>
            <p>Explore how workspaces, files and channels fit together.</p>
          </div>
        </div>
        <section
          className="workspace-tour-directory-stage"
          aria-label="Preview of a workspace with explanatory annotations"
        >
          <div
            className="workspace-tour-planning-scene"
            aria-hidden="true"
            inert
          >
            <div className="tour-scene-topbar">
              <span className="tour-scene-apps">⠿</span>
              <b>Site</b>
              <span className="tour-scene-search" />
            </div>
            <div className="tour-scene-titlebar">
              <span className="tour-scene-mark">⌁</span>
              <b>Planning</b>
              <span className="tour-scene-channels">▣ Channels</span>
            </div>
            <div className="tour-scene-layout">
              <nav className="tour-scene-nav">
                <b>Home</b>
                <small>DOCUMENT LIBRARIES</small>
                <b className="selected">▱ Planning Cycles</b>
                <b>▱ Strategy Development</b>
                <b>▱ Performance &amp; Reporting</b>
                <b>▱ Approved Plans &amp; Reports</b>
                <small>JUMP TO</small>
                <b>▱ Department submissions</b>
              </nav>
              <div className="tour-scene-library">
                <small>
                  Workspace / Planning Cycles / 2026 Year End Review
                </small>
                <div className="tour-scene-heading">
                  <div>
                    <h3>2026 Year End Review</h3>
                    <span>
                      Active annual planning and review. Contribute, coordinate
                      and develop the next organisational plan.
                    </span>
                  </div>
                  <span>□ Working information</span>
                </div>
                <div className="tour-scene-toolbar">
                  <b>＋ New</b>
                  <span>↑ Upload</span>
                  <span>↗ Copy link</span>
                  <span className="view">All Documents ⌄ ≡ Filters</span>
                </div>
                <div className="tour-scene-search-library">
                  ⌕ Search this library
                </div>
                <div className="tour-scene-table">
                  <div className="tour-scene-row tour-scene-columns">
                    <span>Name ↑</span>
                    <span>Planning cycle</span>
                    <span>Document type</span>
                    <span>Status</span>
                    <span>Owner</span>
                    <span>Sensitivity</span>
                  </div>
                  <div className="tour-scene-row">
                    <span>
                      <i className="file-icon ppt">P</i> Organisational outcomes
                      map.pptx
                    </span>
                    <span>2026 Year End Review</span>
                    <span>Presentation</span>
                    <span>
                      <i className="status review">In review</i>
                    </span>
                    <span>Alex Morgan</span>
                    <span>
                      <i className="sensitivity">Internal</i>
                    </span>
                  </div>
                  <div className="tour-scene-row">
                    <span>
                      <i className="file-icon xls">X</i> Planning assumptions
                      register.xlsx
                    </span>
                    <span>2026 Year End Review</span>
                    <span>Supporting data</span>
                    <span>
                      <i className="status progress">In progress</i>
                    </span>
                    <span>Alex Morgan</span>
                    <span>
                      <i className="sensitivity">Internal</i>
                    </span>
                  </div>
                  <div className="tour-scene-row">
                    <span>
                      <i className="file-icon doc">W</i> Year end planning
                      lessons 2026.docx
                    </span>
                    <span>2026 Year End Review</span>
                    <span>Analysis</span>
                    <span>
                      <i className="status draft">Draft</i>
                    </span>
                    <span>Alex Morgan</span>
                    <span>
                      <i className="sensitivity">Internal</i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <svg
            className="workspace-tour-annotation-arrows"
            viewBox="0 0 1000 620"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <marker
                id="tour-arrowhead"
                markerWidth="6"
                markerHeight="6"
                markerUnits="userSpaceOnUse"
                refX="5"
                refY="3"
                orient="auto"
              >
                <path d="M1 1 L5 3 L1 5" />
              </marker>
            </defs>
            {annotations.map((annotation) => (
              <path
                key={annotation.id}
                d={annotation.path}
                markerEnd="url(#tour-arrowhead)"
              />
            ))}
          </svg>
          <svg
            className="workspace-tour-annotation-arrows workspace-tour-annotation-arrows-mobile"
            viewBox="0 0 390 1020"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <marker
                id="tour-arrowhead-mobile"
                markerWidth="6"
                markerHeight="6"
                markerUnits="userSpaceOnUse"
                refX="5"
                refY="3"
                orient="auto"
              >
                <path d="M1 1 L5 3 L1 5" />
              </marker>
            </defs>
            {annotations.map((annotation) => (
              <path
                key={annotation.id}
                d={annotation.mobilePath}
                markerEnd="url(#tour-arrowhead-mobile)"
              />
            ))}
          </svg>
          <div
            className="workspace-tour-annotations"
            aria-label="Workspace guidance annotations"
          >
            {annotations.map((annotation) => (
              <div
                className={`workspace-tour-annotation demo-paper-surface ${annotation.className}`}
                key={annotation.id}
              >
                <strong>{annotation.title}</strong>
                <span>{annotation.body}</span>
              </div>
            ))}
          </div>
          <div className="workspace-tour-coming-soon" role="status">
            <span>COMING SOON</span>
            <p>The interactive walkthrough is currently in development.</p>
          </div>
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
    <WorkspaceTourGuide
      topics={
        current === "home"
          ? homeTopics
          : current === "calendar"
            ? calendarTopics
            : libraryTopics
      }
    >
      <div className="app-shell workspace-tour-shell">
        <WorkspaceHeader
          title="Activity Workspace"
          userName="Taylor Reed"
          userRole="Workspace member"
          searchFiles={activitySearchFiles}
          guidedExample
          onOpen={handleOpen}
          onTeams={() => location.assign(channelDestination())}
          onHelp={() =>
            document
              .querySelector<HTMLButtonElement>(
                ".workspace-tour-guide nav button",
              )
              ?.focus()
          }
          onMessage={setMessage}
          helpText=""
          memberCount={18}
        />
        <div className="workspace workspace-tour-workspace">
          <aside className="sidebar workspace-tour-sidebar">
            <nav
              aria-label="Activity Workspace navigation"
              data-tour-target="workspace-navigation"
            >
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
              <a href={channelDestination()} data-tour-target="open-channels">
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
    </WorkspaceTourGuide>
  );
}

function WorkspaceHome() {
  return (
    <>
      <div className="workspace-tour-page-heading">
        <span data-tour-target="home-overview">Workspace home</span>
        <h1>Activity Workspace</h1>
        <p>
          A shared place for the work, its files and the conversations around
          it.
        </p>
      </div>
      <div className="workspace-tour-home-grid">
        <section
          className="workspace-tour-home-card workspace-tour-welcome-card"
          data-tour-target="home-overview-card"
        >
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
        <section
          className="workspace-tour-home-card"
          data-tour-target="home-channels"
        >
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
        data-tour-target="home-recent-files"
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
  return (
    <>
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
      <DocumentLibrary
        title={title}
        definition={activityLibrary}
        files={files}
        folders={activityFolders}
        initialFolder={initialFolder}
        readOnly
        tourTargets
      />
    </>
  );
}

function WorkspaceCalendar() {
  return (
    <>
      <div className="workspace-tour-page-heading">
        <span>Workspace schedule</span>
        <h1>Shared calendar</h1>
        <p>Upcoming moments for the Activity Workspace.</p>
      </div>
      <section
        className="workspace-tour-calendar"
        aria-label="Upcoming workspace events"
        data-tour-target="workspace-calendar"
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
    <div
      className="workspace-tour-channel-posts"
      data-tour-target="channel-posts"
    >
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
    <WorkspaceTourGuide
      topics={tab === "Shared" ? channelSharedTopics : channelPostTopics}
    >
      <TeamsShell
        userName="Taylor Reed"
        teamName="Activity Workspace"
        channelName={channel.label}
        channelLabel="Channels"
        guidedExample
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
            <DocumentLibrary
              title="Shared files"
              definition={activityLibrary}
              files={activityFiles}
              folders={activityFolders}
              embedded
              maxEmbeddedRows={activityFiles.length}
              readOnly
              tourTargets
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
    </WorkspaceTourGuide>
  );
}

export default function WorkspaceTour() {
  const path = location.pathname.replace(/\/+$/, "") || "/workspace-tour";
  let content: ReactNode;
  if (path === "/workspace-tour") content = <ActivityDirectory />;
  else if (path === "/workspace-tour/channels") content = <ActivityChannels />;
  else {
    const section = path.split("/")[3] ?? "home";
    const current = [
      "documents",
      "reference",
      "calendar",
      "completed",
    ].includes(section)
      ? section
      : "home";
    content = (
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
  return content;
}
