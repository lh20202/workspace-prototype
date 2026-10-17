import { withExplicitStaff } from "../utils/staffNavigation";
import { canAccessArea } from "../access/policy";
import { publishingPosts } from "../workspaces/publishingTeams";
import { useState, useEffect } from "react";
import { functionalConfigs } from "../workspaces/config";
import {
  functionalLibraries,
  functionalLibraryDocuments,
  libraryForFile,
} from "../workspaces/siteArchitecture";
import TechnicalConversation from "../workspaces/TechnicalConversation";
import { workspaces, rememberStaff, resolveStaffPerson } from "./catalog";
import {
  channels as logisticsChannels,
  files as logisticsFiles,
  type OperationalFile,
} from "../logistics/data";
import {
  documentFor as contentDocument,
  libraryFor as contentLibrary,
  definitions as contentDefinitions,
} from "../content/libraries";
import { files as contentFiles } from "../content/data";
import ContentConversation from "../content/ContentConversation";
import {
  resolveContentChannel,
  contentFilesForChannel,
  contentChannelReadOnly,
  contentDefaultTab,
} from "../content/channels";
import { documents as planningFiles } from "../data/workspace";
import DepartmentChannel from "../coordination/DivisionChannel";
import { resolveDepartment } from "../coordination/data";
import TeamsShell, { TeamsComposer, initials } from "../teams/TeamsShell";
import DocumentLibrary, {
  type LibraryDocument,
} from "../sharepoint/DocumentLibrary";

import { teamsGroups, defaultTeamsContext } from "../teams/navigation";
import {
  canSeeDepartment,
  canSeeWorkspace,
  canSeeWorkspaceChannel,
  visibleWorkspaceChannels,
} from "../teams/visibility";
import AccessBoundary from "../access/AccessBoundary";
import { hasWorkspaceTeams } from "../workspaces/registry";
import { sharepointDestination } from "../teams/sharepointDestination";

export const sharedFiles: Record<string, OperationalFile[]> = {
  logistics: logisticsFiles,
  content: contentFiles,
};
for (const config of functionalConfigs) {
  if (hasWorkspaceTeams(config.id)) sharedFiles[config.id] = config.files;
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
  const person = resolveStaffPerson(params.get("staff"));
  const requestedWorkspace = params.get("workspace");
  const defaultContext = defaultTeamsContext(person);
  const workspace =
    workspaces.find((item) => item.id === requestedWorkspace) ||
    workspaces.find(
      (item) => item.id === (defaultContext.workspaceId || "planning"),
    )!;
  const department =
    resolveDepartment(params.get("department") || params.get("division")) ||
    (!requestedWorkspace
      ? resolveDepartment(defaultContext.departmentId || null)
      : undefined);
  const companyFallback =
    !requestedWorkspace && !department
      ? defaultContext.companyChannelId
      : undefined;
  const workspaceUnavailable = !department && !hasWorkspaceTeams(workspace.id);
  const requested =
    params.get("channel") ||
    (!requestedWorkspace || requestedWorkspace === defaultContext.workspaceId
      ? defaultContext.channel
      : undefined) ||
    "General";
  const contentChannelName = (value: string) =>
    resolveContentChannel(value)?.name || value;
  const initialChannel =
    workspace.id === "logistics"
      ? logisticsChannels.find(
          (channel) => channel.id === requested || channel.name === requested,
        )?.name || requested
      : workspace.id === "content"
        ? contentChannelName(requested)
        : requested;
  const [channel, setChannel] = useState(initialChannel);
  const [tab, setTab] = useState(
    params.get("tab") === "Shared" || params.get("tab") === "Files"
      ? "Shared"
      : params.get("tab") === "Posts"
        ? "Posts"
        : workspace.id === "content"
          ? contentDefaultTab(initialChannel)
          : "Posts",
  );
  const [search, setSearch] = useState("");
  const [sharedLibraryId, setSharedLibraryId] = useState(
    params.get("documentLibrary") || "",
  );
  useEffect(() => {
    rememberStaff(person.id);
    if (companyFallback) {
      location.replace(
        `/logistics/teams?${new URLSearchParams({
          staff: person.id,
          channel: companyFallback,
          tab: "Posts",
        })}`,
      );
      return;
    }
    if (workspaceUnavailable) {
      location.replace(
        sharepointDestination(
          workspace.id,
          new URLSearchParams(location.search).get("file"),
        ),
      );
      return;
    }
    if (!department && workspace.id === "logistics") {
      const targetChannel =
        logisticsChannels.find(
          (channel) =>
            channel.name === initialChannel || channel.id === initialChannel,
        )?.id ||
        logisticsChannel[initialChannel] ||
        initialChannel;
      const query = new URLSearchParams(location.search);
      query.delete("workspace");
      query.set("staff", person.id);
      query.set("channel", targetChannel);
      query.set("tab", tab);
      location.replace(`/logistics/teams?${query}`);
    }
  }, [
    person.id,
    workspace.id,
    department,
    initialChannel,
    tab,
    workspaceUnavailable,
    companyFallback,
  ]);
  function chooseChannel(workspaceId: string, name: string) {
    const query = new URLSearchParams({
      staff: person.id,
      workspace: workspaceId,
      channel: name,
      tab: workspaceId === "content" ? contentDefaultTab(name) : "Posts",
    });
    if (department || workspaceId !== workspace.id)
      location.assign(`/teams?${query}`);
    else {
      setChannel(name);
      setSharedLibraryId("");
      setTab(workspaceId === "content" ? contentDefaultTab(name) : "Posts");
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
      const name =
        query.get("channel") ||
        (!query.get("workspace") ||
        query.get("workspace") === defaultContext.workspaceId
          ? defaultContext.channel
          : undefined) ||
        "General";
      const restoredContentChannel = resolveContentChannel(name);
      setChannel(
        workspace.id === "content"
          ? restoredContentChannel?.name || name
          : name,
      );
      setTab(
        ["Files", "Shared"].includes(query.get("tab") || "")
          ? "Shared"
          : query.get("tab") === "Posts"
            ? "Posts"
            : workspace.id === "content"
              ? contentDefaultTab(name)
              : "Posts",
      );
      setSharedLibraryId(query.get("documentLibrary") || "");
      setSearch("");
    };
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, [
    workspace.id,
    person.id,
    defaultContext.workspaceId,
    defaultContext.channel,
  ]);
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
    : !canSeeWorkspace(person, workspace.id);
  const channelDenied =
    !department && !canSeeWorkspaceChannel(person, workspace.id, channel);
  const securityDenied =
    workspace.id === "digital" &&
    channel === "Security Engineering" &&
    !canAccessArea(person, "digital", "security");
  const files = (sharedFiles[workspace.id] || []).filter((file) => {
    if (securityDenied || workspaceDenied || channelDenied) return false;
    if (workspace.id === "content")
      return contentFilesForChannel(channel).some(
        (item) => item.id === file.id,
      );
    if (workspace.id === "digital") {
      const area = (file as OperationalFile & { area: string }).area;
      if (channel === "Security Engineering")
        return ["operations", "m365"].includes(area);
      return channel === "General"
        ? visibleWorkspaceChannels(person, "digital").some(
            (name) => digitalArea[name] === area,
          )
        : area === digitalArea[channel];
    }
    return true;
  });
  const config = functionalConfigs.find(
    (item) => item.id === workspace.id && hasWorkspaceTeams(item.id),
  );
  const documents: LibraryDocument[] =
    workspaceDenied || channelDenied
      ? []
      : workspace.id === "planning"
        ? planningFiles
            .filter((file) => file.library !== "restricted")
            .map((file) => ({
              id: file.id,
              name: file.name,
              folder: file.folderPath,
              modified: file.modified,
              owner: file.owner,
              status: file.status,
            }))
        : workspace.id === "content"
          ? files.map((file) =>
              contentDocument(
                contentFiles.find((item) => item.id === file.id)!,
              ),
            )
          : config
            ? functionalLibraries[config.id]
                .flatMap((library) =>
                  functionalLibraryDocuments(config, library),
                )
                .filter((document) =>
                  files.some((file) => file.id === document.id),
                )
            : [];
  const selectedFileId = params.get("file");
  const selectedContent = contentFiles.find(
    (file) =>
      file.id === selectedFileId && files.some((item) => item.id === file.id),
  );
  const defaultDefinition =
    workspace.id === "content"
      ? contentDefinitions[
          selectedContent
            ? contentLibrary(selectedContent)
            : resolveContentChannel(channel)?.preferredLibrary
              ? resolveContentChannel(channel)!.preferredLibrary!
              : files[0]
                ? contentLibrary(files[0] as (typeof contentFiles)[number])
                : "production"
        ]
      : config
        ? libraryForFile(config, selectedFileId || "") ||
          functionalLibraries[config.id][0]
        : undefined;
  const availableLibraries =
    workspace.id === "content"
      ? Object.values(contentDefinitions).filter((definition) =>
          files.some(
            (file) =>
              contentLibrary(file as (typeof contentFiles)[number]) ===
              definition.id,
          ),
        )
      : config
        ? functionalLibraries[config.id]
        : [];
  const definition =
    availableLibraries.find((library) => library.id === sharedLibraryId) ||
    defaultDefinition;
  const documentsForLibrary =
    definition && availableLibraries.length > 1
      ? documents.filter((document) => {
          const source = contentFiles.find((file) => file.id === document.id);
          return (
            (workspace.id === "content" && source
              ? contentLibrary(source)
              : config
                ? libraryForFile(config, document.id)?.id
                : undefined) === definition.id
          );
        })
      : documents;
  const visibleDocuments = search.trim()
    ? documentsForLibrary.filter((file) =>
        `${file.name} ${file.folder} ${file.contentType || ""} ${Object.values(file.metadata || {}).join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : documentsForLibrary;
  function openSharePoint() {
    location.assign(
      withExplicitStaff(
        sharepointDestination(
          workspace.id,
          new URLSearchParams(location.search).get("file"),
        ),
      ),
    );
  }
  if (companyFallback) return <div role="status">Opening Teams…</div>;
  if (workspaceUnavailable) return <div role="status">Opening SharePoint…</div>;
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
        department?.channelAccess === "Department-only" ||
        (workspace.id === "digital" && channel === "Security Engineering")
      }
      onOpenSharePoint={
        department || workspaceDenied || channelDenied || securityDenied
          ? undefined
          : openSharePoint
      }
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
        <AccessBoundary
          workspaceId={workspace.id}
          department={department?.id}
          resource={
            department
              ? undefined
              : {
                  kind: "channel",
                  workspaceId: workspace.id,
                  channelId:
                    workspace.id === "content"
                      ? resolveContentChannel(channel)?.id || channel
                      : channel,
                }
          }
          personId={person.id}
          area={department ? `${department.name} / General` : channel}
          location={`${department?.name || workspace.title} / ${department ? "General" : channel}`}
          returnHref={`/teams?staff=${person.id}`}
          returnLabel="Open your Teams view"
          headingLevel={2}
          compact
        />
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
        <AccessBoundary
          workspaceId="digital"
          area="Security Engineering"
          resource={{
            kind: "area",
            workspaceId: "digital",
            areaId: "security",
          }}
          personId={person.id}
          location="Digital & Technology / Security Engineering"
          strict
          returnHref="/digital-tech"
          headingLevel={2}
          compact
        />
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
              workspace.id === "planning" ||
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
          personId={person.id}
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
      ) : workspace.id === "publishing" ? (
        <TechnicalConversation
          key={channel}
          channel={channel}
          userName={person.name}
          searchQuery={search}
          messages={publishingPosts}
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
          userName={person.name}
          query={search}
        />
      )}
    </TeamsShell>
  );
}
const planningUpdate = {
  author: "Casey Blake",
  text: "I’ve updated the annual planning guidance. Any questions about your department’s submission? Let me know before Friday so I can clear them up before the deadline.",
};
function CoordinationFeed({
  userName,
  query,
}: {
  userName: string;
  query: string;
}) {
  const update = planningUpdate;
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
                <p data-no-translate>{text}</p>
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
