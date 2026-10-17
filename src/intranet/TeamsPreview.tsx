import { useState, useEffect } from "react";
import { functionalConfigs } from "../workspaces/config";
import {
  functionalLibraries,
  functionalLibraryDocuments,
  libraryForFile,
} from "../workspaces/siteArchitecture";
import TechnicalConversation from "../workspaces/TechnicalConversation";
import { workspaces, staff, rememberStaff, selectedStaffId } from "./catalog";
import {
  files as logisticsFiles,
  type OperationalFile,
} from "../logistics/data";
import { documents as serviceFiles } from "../services/data";
import { files as audienceFiles } from "../audience/data";
import {
  documentFor as audienceDocument,
  libraryFor as audienceLibrary,
  definitions as audienceDefinitions,
} from "../audience/libraries";
import {
  documentFor as contentDocument,
  libraryFor as contentLibrary,
  definitions as contentDefinitions,
} from "../content/libraries";
import {
  financialDocument,
  libraries as financeLibraries,
  definitions as financeDefinitions,
} from "../finance/libraries";
import { executiveDocument, executiveDefinition } from "../executive/libraries";
import { files as contentFiles } from "../content/data";
import ContentConversation from "../content/ContentConversation";
import {
  resolveContentChannel,
  visibleContentChannels,
  contentFilesForChannel,
  contentChannelReadOnly,
} from "../content/channels";
import { files as financialFiles } from "../finance/data";
import { visibleFiles as executiveFiles } from "../executive/data";
import { documents as planningFiles } from "../data/workspace";
import DepartmentChannel from "../coordination/DivisionChannel";
import { resolveDepartment } from "../coordination/data";
import { currentProjects, projectHref, projectTitle } from "../projects/data";
import TeamsShell, { TeamsComposer, initials } from "../teams/TeamsShell";
import DocumentLibrary, {
  type LibraryDocument,
} from "../sharepoint/DocumentLibrary";
import { planningPath } from "../utils/routes";

import { teamsGroups } from "../teams/navigation";
import {
  canSeeDepartment,
  canSeeProject,
  canSeeWorkspace,
  canSeeWorkspaceChannel,
  workspaceChannels,
} from "../teams/visibility";
import TeamsAdministration from "../teams/Administration";

export const sharedFiles: Record<string, OperationalFile[]> = {
  logistics: logisticsFiles,
  services: serviceFiles,
  audience: audienceFiles,
  content: contentFiles,
  finance: financialFiles,
  executive: executiveFiles("base"),
};
for (const config of functionalConfigs) {
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
  const contentChannelName = (value: string) => {
    const resolved = resolveContentChannel(value);
    if (
      value === "General" &&
      !visibleContentChannels(person.id).some(
        (item) => item.id === resolved?.id,
      )
    )
      return (
        visibleContentChannels(person.id)[0]?.name || "Production Coordination"
      );
    return resolved?.name || value;
  };
  const initialChannel =
    workspace.id === "content"
      ? contentChannelName(requested)
      : (workspaceChannels[workspace.id] || ["General"]).includes(requested)
        ? requested
        : "General";
  const [channel, setChannel] = useState(initialChannel);
  const [tab, setTab] = useState(
    params.get("tab") === "Shared" || params.get("tab") === "Files"
      ? "Shared"
      : "Posts",
  );
  const [search, setSearch] = useState("");
  const [sharedLibraryId, setSharedLibraryId] = useState(
    params.get("documentLibrary") || "",
  );
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
      const restoredContentChannel = resolveContentChannel(name);
      setChannel(
        workspace.id === "content"
          ? name === "General"
            ? visibleContentChannels(person.id).find(
                (item) => item.id === restoredContentChannel?.id,
              )?.name ||
              visibleContentChannels(person.id)[0]?.name ||
              "Production Coordination"
            : restoredContentChannel?.name || name
          : (workspaceChannels[workspace.id] || ["General"]).includes(name)
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
  }, [workspace.id, person.id]);
  const groups = teamsGroups(person).map((group) => ({
    ...group,
    channels: group.channels.map((item) => ({
      ...item,
      onSelect:
        group.id === workspace.id && !department
          ? () => chooseChannel(workspace.id, item.label)
          : item.onSelect,
    })),
  }));
  const workspaceDenied = department
    ? !canSeeDepartment(person, department.id)
    : workspace.id === "projects"
      ? !currentProjects.some((p) => canSeeProject(person, p.code))
      : !canSeeWorkspace(person, workspace.id);
  const channelDenied =
    !department &&
    workspace.id !== "projects" &&
    !canSeeWorkspaceChannel(person, workspace.id, channel);
  const securityDenied =
    workspace.id === "digital" && channel === "Security Engineering";
  const files = (sharedFiles[workspace.id] || []).filter((f) => {
    if (securityDenied || workspaceDenied || channelDenied) return false;
    if (workspace.id === "content")
      return contentFilesForChannel(channel).some((file) => file.id === f.id);
    if (workspace.id === "digital" && channel !== "General")
      return (
        (f as OperationalFile & { area: string }).area === digitalArea[channel]
      );
    if (workspace.id === "finance" && channel === "Close coordination")
      return ["reconciliation", "accounting", "payments"].includes(f.folder);
    return true;
  });
  const documents: LibraryDocument[] =
    workspaceDenied || channelDenied
      ? []
      : workspace.id === "planning"
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
        : functionalConfigs.some((config) => config.id === workspace.id)
          ? functionalLibraries[workspace.id]
              .flatMap((library) =>
                functionalLibraryDocuments(
                  functionalConfigs.find(
                    (config) => config.id === workspace.id,
                  )!,
                  library,
                ),
              )
              .filter((document) =>
                files.some((file) => file.id === document.id),
              )
          : files.map((f) =>
              workspace.id === "audience"
                ? audienceDocument(
                    audienceFiles.find((source) => source.id === f.id)!,
                  )
                : workspace.id === "content"
                  ? contentDocument(
                      contentFiles.find((source) => source.id === f.id)!,
                    )
                  : workspace.id === "finance"
                    ? financialDocument(f)
                    : workspace.id === "executive"
                      ? executiveDocument(
                          executiveFiles("base").find(
                            (source) => source.id === f.id,
                          )!,
                        )
                      : {
                          id: f.id,
                          name: f.name,
                          folder: f.folder,
                          modified: f.modified,
                          owner: f.owner,
                          status: f.status,
                        },
            );
  const selectedFileId = new URLSearchParams(location.search).get("file");
  const selectedAudience = audienceFiles.find((f) => f.id === selectedFileId);
  const selectedContent = contentFiles.find((f) => f.id === selectedFileId);
  const selectedFinance = financialFiles.find((f) => f.id === selectedFileId);
  const defaultDefinition =
    workspace.id === "audience"
      ? audienceDefinitions[
          selectedAudience ? audienceLibrary(selectedAudience) : "research"
        ]
      : workspace.id === "content"
        ? contentDefinitions[
            selectedContent
              ? contentLibrary(selectedContent)
              : files[0]
                ? contentLibrary(files[0] as (typeof contentFiles)[number])
                : "production"
          ]
        : workspace.id === "finance"
          ? financeDefinitions[
              financeLibraries.find((l) =>
                l.areas.includes(selectedFinance?.folder || "income"),
              )!.id
            ]
          : workspace.id === "executive"
            ? executiveDefinition("coordination")
            : functionalConfigs.some((config) => config.id === workspace.id)
              ? libraryForFile(
                  functionalConfigs.find(
                    (config) => config.id === workspace.id,
                  )!,
                  selectedFileId || "",
                ) || functionalLibraries[workspace.id][0]
              : undefined;
  const availableLibraries =
    workspace.id === "audience"
      ? Object.values(audienceDefinitions)
      : workspace.id === "content"
        ? Object.values(contentDefinitions).filter((definition) =>
            files.some(
              (file) =>
                contentLibrary(file as (typeof contentFiles)[number]) ===
                definition.id,
            ),
          )
        : workspace.id === "finance"
          ? Object.values(financeDefinitions)
          : functionalLibraries[workspace.id] ||
            (defaultDefinition ? [defaultDefinition] : []);
  const definition =
    availableLibraries.find((library) => library.id === sharedLibraryId) ||
    defaultDefinition;
  const documentsForLibrary =
    definition && availableLibraries.length > 1
      ? documents.filter((document) => {
          const audience = audienceFiles.find(
            (file) => file.id === document.id,
          );
          const content = contentFiles.find((file) => file.id === document.id);
          const finance = financialFiles.find(
            (file) => file.id === document.id,
          );
          const functionalConfig = functionalConfigs.find(
            (config) => config.id === workspace.id,
          );
          const libraryId =
            workspace.id === "audience" && audience
              ? audienceLibrary(audience)
              : workspace.id === "content" && content
                ? contentLibrary(content)
                : workspace.id === "finance" && finance
                  ? financeLibraries.find((library) =>
                      library.areas.includes(finance.folder),
                    )?.id
                  : functionalConfig
                    ? libraryForFile(functionalConfig, document.id)?.id
                    : undefined;
          return libraryId === definition.id;
        })
      : documents;
  const visibleDocuments = search.trim()
    ? documentsForLibrary.filter((f) =>
        `${f.name} ${f.folder} ${f.contentType || ""} ${Object.values(f.metadata || {}).join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : documentsForLibrary;
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
    let suffix = source?.area
      ? `/${source.area}`
      : definition
        ? `/${definition.id}`
        : "";
    const functionalConfig = functionalConfigs.find(
      (config) => config.id === workspace.id,
    );
    if (source && functionalConfig) {
      const sourceLibrary = libraryForFile(functionalConfig, source.id);
      if (sourceLibrary) suffix = `/${sourceLibrary.id}`;
    }
    if (source && workspace.id === "finance") suffix = `/${source.folder}`;
    if (source && workspace.id === "audience") {
      const audience = audienceFiles.find((f) => f.id === id);
      if (audience) suffix = `/${audienceLibrary(audience)}`;
    }
    if (source && workspace.id === "content") {
      const content = contentFiles.find((f) => f.id === id);
      if (content) suffix = `/${contentLibrary(content)}`;
    }
    if (source && workspace.id === "executive") suffix = "/coordination";
    location.assign(
      `${workspace.href}${suffix}${id ? `?${new URLSearchParams({ file: id, folder: documents.find((f) => f.id === id)?.folder || "" })}` : ""}`,
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
      onOpenSharePoint={
        department || workspaceDenied || channelDenied || securityDenied
          ? undefined
          : openSharePoint
      }
      navigationFooter={<TeamsAdministration person={person} groups={groups} />}
      headerActions={
        workspace.id === "content" &&
        resolveContentChannel(channel)?.kind === "temporary" ? (
          <small className="content-room-header-cue">
            {contentChannelReadOnly(channel)
              ? "Archived · Read-only"
              : "Temporary coverage"}
          </small>
        ) : undefined
      }
      searchValue={search}
      onSearchChange={setSearch}
    >
      {workspaceDenied || channelDenied ? (
        <section className="m365-teams-empty">
          <h2>Access denied</h2>
          <p>This team or channel is not included in your membership.</p>
          <button onClick={() => location.assign(`/teams?staff=${person.id}`)}>
            Open your Teams view
          </button>
        </section>
      ) : department ? (
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
          {currentProjects
            .filter((p) => canSeeProject(person, p.code))
            .map((p) => (
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
          {availableLibraries.length > 1 && (
            <label className="teams-shared-library-picker">
              Document library
              <select
                value={definition?.id || ""}
                onChange={(event) => {
                  setSharedLibraryId(event.target.value);
                  const query = new URLSearchParams(location.search);
                  query.set("documentLibrary", event.target.value);
                  for (const field of ["library", "folder", "file", "view"])
                    query.delete(field);
                  history.replaceState({}, "", `${location.pathname}?${query}`);
                }}
              >
                {availableLibraries.map((library) => (
                  <option key={library.id} value={library.id}>
                    {library.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <DocumentLibrary
            key={`${workspace.id}:${channel}:${definition?.id}:${search}`}
            title={definition?.name || "Documents"}
            files={visibleDocuments}
            definition={definition}
            headingLevel={2}
            readOnly={
              ["planning", "archives", "executive"].includes(workspace.id) ||
              (workspace.id === "content" &&
                (contentChannelReadOnly(channel) ||
                  definition?.id === "published"))
            }
          />
        </div>
      ) : workspace.id === "content" ? (
        <ContentConversation
          key={channel}
          channel={channel}
          userName={person.name}
          query={search}
          onOpenFile={(id) => {
            const source = contentFiles.find((file) => file.id === id);
            if (!source || !files.some((file) => file.id === id)) return;
            const libraryId = contentLibrary(source);
            setSharedLibraryId(libraryId);
            setTab("Shared");
            setSearch("");
            const query = new URLSearchParams(location.search);
            query.set("tab", "Shared");
            query.set("documentLibrary", libraryId);
            query.set("file", id);
            query.set("folder", contentDocument(source).folder);
            query.delete("library");
            query.delete("view");
            history.replaceState({}, "", `/teams?${query}`);
          }}
        />
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
  employment: {
    author: "Jamie Ellis",
    text: "Please confirm the vacancy setup checklist and interview coordination guidance before the next hiring round. Candidate decisions and individual employee records stay in their protected areas.",
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
