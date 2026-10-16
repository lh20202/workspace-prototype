import { useState, useEffect } from "react";
import { functionalConfigs } from "../workspaces/config";
import { technicalChannels } from "../workspaces/technicalTeams";
import TechnicalConversation from "../workspaces/TechnicalConversation";
import { workspaces, staff, rememberStaff, selectedStaffId } from "./catalog";
import {
  files as logisticsFiles,
  type OperationalFile,
} from "../logistics/data";
import { documents as serviceFiles } from "../services/data";
import { files as audienceFiles } from "../audience/data";
import { files as contentFiles } from "../content/data";
import { files as financialFiles } from "../finance/data";
import { visibleFiles as executiveFiles } from "../executive/data";
import { documents as planningFiles } from "../data/workspace";
import DepartmentChannel from "../coordination/DivisionChannel";
import {
  departments,
  departmentHref,
  resolveDepartment,
} from "../coordination/data";
import { currentProjects, projectHref, projectTitle } from "../projects/data";
import TeamsShell, {
  TeamsComposer,
  initials,
  type TeamsGroup,
} from "../teams/TeamsShell";
import DocumentLibrary, {
  type LibraryDocument,
} from "../sharepoint/DocumentLibrary";
import { planningPath } from "../utils/routes";

// Conversation contexts are chosen deliberately; SharePoint areas are not channels.
const channelMap: Record<string, string[]> = {
  projects: ["General"],
  planning: ["General", "Planning coordination"],
  logistics: [
    "General",
    "In-person Operations",
    "Calling Campaigns",
    "Pet photos",
  ],
  services: ["General"],
  audience: ["General", "Research coordination"],
  content: ["General", "Production coordination"],
  finance: ["General", "Close coordination"],
  executive: ["General"],
};
export const sharedFiles: Record<string, OperationalFile[]> = {
  logistics: logisticsFiles,
  services: serviceFiles,
  audience: audienceFiles,
  content: contentFiles,
  finance: financialFiles,
  executive: executiveFiles("base"),
};
for (const config of functionalConfigs) {
  channelMap[config.id] =
    config.id === "digital" ? technicalChannels : ["General"];
  sharedFiles[config.id] = config.files;
}
const logisticsChannel: Record<string, string> = {
  General: "general",
  "In-person Operations": "street",
  "Calling Campaigns": "telephone",
  "Pet photos": "pets",
};
const digitalArea: Record<string, string> = {
  Engineering: "engineering",
  Innovators: "engineering",
  "AI Lab": "ai-automation",
  "Web & CRM DevOps": "web-crm",
  "M365 & SPFx": "m365",
  "Architecture & Governance": "architecture",
  "Platform Operations": "operations",
};
export default function TeamsPreview() {
  const params = new URLSearchParams(location.search);
  const person =
    staff.find((s) => s.id === params.get("staff")) ||
    staff.find((s) => s.id === selectedStaffId()) ||
    staff[0];
  const department = resolveDepartment(
    params.get("department") || params.get("division"),
  );
  const workspace =
    workspaces.find((w) => w.id === params.get("workspace")) ||
    workspaces.find((w) => w.id === person.workspace)!;
  const requested = params.get("channel") || "General";
  const initialChannel = (channelMap[workspace.id] || ["General"]).includes(
    requested,
  )
    ? requested
    : "General";
  const [channel, setChannel] = useState(initialChannel);
  const [tab, setTab] = useState(
    params.get("tab") === "Shared" || params.get("tab") === "Files"
      ? "Shared"
      : "Posts",
  );
  const [search, setSearch] = useState("");
  useEffect(() => {
    rememberStaff(person.id);
    if (!department && workspace.id === "logistics") {
      location.replace(
        `/logistics/teams?${new URLSearchParams({ staff: person.id, channel: logisticsChannel[initialChannel] || "general", tab })}`,
      );
    }
  }, [person.id, workspace.id, department, initialChannel, tab]);
  function chooseChannel(workspaceId: string, name: string) {
    const query = new URLSearchParams({
      staff: person.id,
      workspace: workspaceId,
      channel: name,
      tab: "Posts",
    });
    if (department || workspaceId !== workspace.id)
      location.assign(`/teams?${query}`);
    else {
      setChannel(name);
      setTab("Posts");
      setSearch("");
      history.pushState({}, "", `/teams?${query}`);
    }
  }
  function chooseTab(value: string) {
    setTab(value);
    setSearch("");
    const query = new URLSearchParams(location.search);
    query.set("tab", value);
    history.replaceState({}, "", `/teams?${query}`);
  }
  useEffect(() => {
    const back = () => {
      const query = new URLSearchParams(location.search);
      const name = query.get("channel") || "General";
      setChannel(
        (channelMap[workspace.id] || ["General"]).includes(name)
          ? name
          : "General",
      );
      setTab(
        ["Files", "Shared"].includes(query.get("tab") || "")
          ? "Shared"
          : "Posts",
      );
      setSearch("");
    };
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, [workspace.id]);
  const groups: TeamsGroup[] = [
    ...workspaces
      .filter((w) => w.id !== "projects")
      .map((w) => ({
        id: w.id,
        label: w.title,
        channels: (channelMap[w.id] || ["General"]).map((name) => ({
          id: `${w.id}:${name}`,
          label: name,
          unread: w.id === "digital" && name === "AI Lab",
          private: name === "Security Engineering",
          onSelect: () => chooseChannel(w.id, name),
        })),
      })),
    ...departments.map((d) => ({
      id: d.id,
      label: d.name,
      channels: [
        {
          id: `${d.id}:General`,
          label: "General",
          private: d.channelAccess === "Department-only",
          onSelect: () => location.assign(departmentHref(person.id, d.id)),
        },
      ],
    })),
    ...currentProjects.map((p) => ({
      id: p.code,
      label: projectTitle(p),
      channels: [
        {
          id: `${p.code}:General`,
          label: "General",
          private: p.access === "Restricted",
          onSelect: () =>
            location.assign(`${projectHref(p)}/teams?staff=${person.id}`),
        },
      ],
    })),
  ];
  const securityDenied =
    workspace.id === "digital" && channel === "Security Engineering";
  const files = (sharedFiles[workspace.id] || []).filter((f) => {
    if (securityDenied) return false;
    if (workspace.id === "digital" && channel !== "General")
      return (
        (f as OperationalFile & { area: string }).area === digitalArea[channel]
      );
    if (workspace.id === "finance" && channel === "Close coordination")
      return ["reconciliation", "accounting", "payments"].includes(f.folder);
    return true;
  });
  const documents: LibraryDocument[] =
    workspace.id === "planning"
      ? planningFiles
          .filter((f) => f.library !== "restricted")
          .map((f) => ({
            id: f.id,
            name: f.name,
            folder: f.folderPath,
            modified: f.modified,
            owner: f.owner,
            status: f.status,
          }))
      : files.map((f) => ({
          id: f.id,
          name: f.name,
          folder: f.folder,
          modified: f.modified,
          owner: f.owner,
          status: f.status,
        }));
  const visibleDocuments = search.trim()
    ? documents.filter((f) =>
        `${f.name} ${f.folder}`.toLowerCase().includes(search.toLowerCase()),
      )
    : documents;
  function openSharePoint() {
    const id = new URLSearchParams(location.search).get("file");
    const source = files.find((f) => f.id === id) as
      (OperationalFile & { area?: string }) | undefined;
    if (workspace.id === "planning" && id) {
      const document = planningFiles.find(
        (f) => f.id === id && f.library !== "restricted",
      );
      if (document)
        location.assign(
          `${planningPath(document.library)}?${new URLSearchParams({ document: id, folder: document.folderPath })}`,
        );
      return;
    }
    let suffix = source?.area ? `/${source.area}` : "";
    if (source && workspace.id === "finance") suffix = `/${source.folder}`;
    if (source && workspace.id === "content") {
      const content = contentFiles.find((f) => f.id === id);
      suffix =
        content &&
        ["PKG-101", "PKG-103", "PKG-104", "PKG-105"].includes(content.packageId)
          ? "/production"
          : content?.area === "editorial"
            ? "/editorial"
            : "/creative";
    }
    if (source && workspace.id === "executive") suffix = "/coordination";
    location.assign(
      `${workspace.href}${suffix}${id ? `?file=${encodeURIComponent(id)}` : ""}`,
    );
  }
  if (!department && workspace.id === "logistics")
    return <div role="status">Opening Teams…</div>;
  return (
    <TeamsShell
      userName={person.name}
      teamName={department?.name || workspace.title}
      channelName={department ? "General" : channel}
      groups={groups}
      selectedChannelId={
        department ? `${department.id}:General` : `${workspace.id}:${channel}`
      }
      activeTab={tab}
      onTabChange={chooseTab}
      privateChannel={
        department?.channelAccess === "Department-only" || securityDenied
      }
      onOpenSharePoint={department ? undefined : openSharePoint}
      searchValue={search}
      onSearchChange={setSearch}
    >
      {department ? (
        <DepartmentChannel
          key={`${department.id}-${person.id}`}
          department={department}
          person={person}
          tab={tab}
          onTabChange={chooseTab}
          searchQuery={search}
        />
      ) : securityDenied ? (
        <section className="m365-teams-empty">
          <h2>Access denied</h2>
          <p>Security Engineering requires specific technical authorisation.</p>
        </section>
      ) : workspace.id === "projects" ? (
        <div className="m365-teams-files">
          <h2>Project teams</h2>
          {currentProjects.map((p) => (
            <button
              key={p.code}
              onClick={() =>
                location.assign(`${projectHref(p)}/teams?staff=${person.id}`)
              }
            >
              {projectTitle(p)}
            </button>
          ))}
        </div>
      ) : tab === "Shared" ? (
        <div className="m365-teams-files">
          <DocumentLibrary
            key={`${workspace.id}:${channel}:${search}`}
            title="Documents"
            files={visibleDocuments}
            headingLevel={2}
            readOnly={["planning", "archives", "executive"].includes(
              workspace.id,
            )}
          />
        </div>
      ) : workspace.id === "digital" ? (
        <TechnicalConversation
          key={channel}
          channel={channel}
          userName={person.name}
          searchQuery={search}
        />
      ) : (
        <CoordinationFeed
          key={`${workspace.id}:${channel}`}
          workspaceId={workspace.id}
          channel={channel}
          userName={person.name}
          query={search}
        />
      )}
    </TeamsShell>
  );
}
const updates: Record<string, { author: string; text: string }> = {
  planning: {
    author: "Casey Blake",
    text: "The annual planning guidance is ready for review. Please raise any questions about department submissions in this thread before Friday.",
  },
  services: {
    author: "Jordan Lee",
    text: "The office setup checklist is updated. Please add any remaining equipment or reception cover requirements before the next review.",
  },
  audience: {
    author: "Taylor Brooks",
    text: "The segmentation research brief is ready for the team’s comments. Please flag any recruitment or analysis dependencies here.",
  },
  content: {
    author: "Alex Morgan",
    text: "The welcome series review is scheduled for Thursday. Please confirm which production items are ready for review and flag any outstanding approvals.",
  },
  finance: {
    author: "Sam Patel",
    text: "Please add outstanding reconciliation questions before the close review. The working notes and checklist are in Shared.",
  },
  executive: {
    author: "Robin Avery",
    text: "Please confirm briefing contributions for the next coordination meeting. The approved schedule is in Shared.",
  },
  quality: {
    author: "Jordan Lee",
    text: "Please review the open corrective actions before the quarterly quality meeting and add any dependencies to the working notes.",
  },
  people: {
    author: "Elena Rossi",
    text: "The next onboarding session is ready for review. Please confirm the session owners and any remaining learning materials.",
  },
  legal: {
    author: "Jordan Lee",
    text: "Please add non-confidential coordination questions for the next review meeting. Restricted advice remains in the protected workspace.",
  },
  customer: {
    author: "Jordan Lee",
    text: "The monthly interaction review is ready. Please confirm follow-up owners before the relationship meeting.",
  },
  archives: {
    author: "Jordan Lee",
    text: "The next transfer review is scheduled. Please update the appraisal worksheet with any outstanding questions before the meeting.",
  },
};
function CoordinationFeed({
  workspaceId,
  userName,
  query,
}: {
  workspaceId: string;
  channel: string;
  userName: string;
  query: string;
}) {
  const update = updates[workspaceId] || updates.services;
  const [draft, setDraft] = useState("");
  const [posts, setPosts] = useState<string[]>([]);
  const [liked, setLiked] = useState(false);
  const [reply, setReply] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [replies, setReplies] = useState<string[]>([]);
  return (
    <div className="m365-teams-feed">
      {(!query ||
        `${update.text} ${update.author}`
          .toLowerCase()
          .includes(query.toLowerCase())) && (
        <article className="m365-teams-post">
          <div className="m365-teams-post-header">
            <span className="m365-teams-avatar">{initials(update.author)}</span>
            <div>
              <strong>{update.author}</strong>
              <small>Today, 09:15</small>
            </div>
          </div>
          <p>{update.text}</p>
          {replies.map((text, i) => (
            <div className="m365-teams-reply" key={i}>
              <span className="m365-teams-avatar">{initials(userName)}</span>
              <div>
                <strong>{userName}</strong>
                <small> · Now</small>
                <p>{text}</p>
              </div>
            </div>
          ))}
          <div className="m365-teams-reactions">
            <button aria-pressed={liked} onClick={() => setLiked(!liked)}>
              👍 {liked ? 3 : 2}
            </button>
            <button onClick={() => setReply(!reply)}>Reply</button>
          </div>
          {reply && (
            <TeamsComposer
              compact
              value={replyDraft}
              onChange={setReplyDraft}
              placeholder="Reply to thread"
              onSend={() => {
                setReplies([...replies, replyDraft]);
                setReplyDraft("");
                setReply(false);
              }}
            />
          )}
        </article>
      )}
      {posts
        .filter(
          (text) => !query || text.toLowerCase().includes(query.toLowerCase()),
        )
        .map((text, i) => (
          <article className="m365-teams-post" key={i}>
            <div className="m365-teams-post-header">
              <span className="m365-teams-avatar">{initials(userName)}</span>
              <div>
                <strong>{userName}</strong>
                <small>Now</small>
              </div>
            </div>
            <p>{text}</p>
          </article>
        ))}
      {!query && (
        <TeamsComposer
          value={draft}
          onChange={setDraft}
          onSend={() => {
            setPosts([...posts, draft]);
            setDraft("");
          }}
        />
      )}
      {query &&
        !`${update.text} ${update.author}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        !posts.some((text) =>
          text.toLowerCase().includes(query.toLowerCase()),
        ) && <p className="m365-teams-empty">No messages found.</p>}
    </div>
  );
}
