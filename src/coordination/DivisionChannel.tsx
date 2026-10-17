import SensitivityBadge from "../sharepoint/SensitivityBadge";
import { departmentPreviewFor, type AccessResource } from "../access/policy";
import AccessLock from "../components/AccessLock";
import StaffLink from "../components/StaffLink";
import { useState } from "react";
import AccessBoundary from "../access/AccessBoundary";
import { canSeeDepartment } from "../teams/visibility";
import {
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  Tooltip,
} from "@fluentui/react-components";
import { Folder20Regular, Dismiss20Regular } from "@fluentui/react-icons";
import DocumentIcon from "../components/DocumentIcon";
import { useTranslation } from "../i18n/Language";
import { TeamsComposer } from "../teams/TeamsShell";
import DocumentLibrary from "../sharepoint/DocumentLibrary";
import {
  departmentFolders,
  departmentCodes,
  unitFolders,
  canOpenDepartment,
  canOpenUnit,
  accessibleFiles,
  searchCoordination,
  type Department,
  type CoordinationPerson,
  type AdminFile,
} from "./data";
import "./styles.css";

export function NamedAcknowledgement({
  names,
  person,
}: {
  names: string[];
  person: string;
}) {
  const { t } = useTranslation();
  const [liked, setLiked] = useState(names.includes(person));
  const reactors = [
    ...names.filter((name) => name !== person),
    ...(liked ? [person] : []),
  ];
  return (
    <Tooltip
      content={reactors.join(", ") || t("Like")}
      relationship="description"
    >
      <button
        type="button"
        className="coord-acknowledgement"
        aria-label={
          reactors.length
            ? `${t("Liked by")} ${reactors.join(", ")}`
            : t("Like")
        }
        aria-pressed={liked}
        title={reactors.join(", ") || t("Like")}
        onClick={() => setLiked(!liked)}
      >
        👍 {reactors.length || t("Like")}
      </button>
    </Tooltip>
  );
}

export default function DepartmentChannel({
  department,
  person,
  tab,
  onTabChange,
  searchQuery,
}: {
  department: Department;
  person: CoordinationPerson;
  tab: string;
  onTabChange: (tab: string) => void;
  searchQuery?: string;
}) {
  const params = new URLSearchParams(location.search),
    initialUnit = department.units.find((u) => u.id === params.get("unit"));
  const entitled =
    canSeeDepartment(person, department.id) &&
    canOpenDepartment(department, person);
  const genericPreview = !!departmentPreviewFor(person);
  const [deniedResource, setDeniedResource] = useState<
    AccessResource | undefined
  >(
    initialUnit
      ? {
          kind: "unit",
          departmentId: department.id,
          unitId: initialUnit.id,
          unitOnly: initialUnit.access === "Unit-only",
        }
      : undefined,
  );
  const [folder, setFolder] = useState(params.get("folder") || ""),
    [unit, setUnit] = useState(initialUnit),
    [section, setSection] = useState(params.get("section") || "");
  const [denied, setDenied] = useState(
      initialUnit && !canOpenUnit(department, initialUnit, person)
        ? "This unit has limited its coordination files to unit members."
        : "",
    ),
    [localQuery, setQuery] = useState(""),
    [file, setFile] = useState<AdminFile>(),
    [uploadId, setUploadId] = useState("");
  const [draft, setDraft] = useState(""),
    [extraPosts, setExtraPosts] = useState<
      { id: string; author: string; text: string; time: string }[]
    >([]),
    [likes, setLikes] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState(""),
    [replyDraft, setReplyDraft] = useState(""),
    [replies, setReplies] = useState<Record<string, string[]>>({});
  const [sharePointOpen, setSharePointOpen] = useState(false);
  const query = searchQuery ?? localQuery;
  const permittedFiles = entitled ? accessibleFiles(department, person) : [],
    seededResults = entitled
      ? searchCoordination(department, person, query)
      : { files: [], posts: [] },
    unitAllowed = !!unit && canOpenUnit(department, unit, person);
  const results = {
    ...seededResults,
    posts: [
      ...seededResults.posts,
      ...(entitled
        ? extraPosts.filter((p) =>
            `${p.author} ${p.text}`
              .toLowerCase()
              .includes(query.trim().toLowerCase()),
          )
        : []),
    ],
  };
  const selectedUpload = department.posts.find(
    (p) => p.upload?.id === uploadId && !p.upload.removed,
  )?.upload;
  function navigate(
    nextFolder = "",
    nextUnit: typeof unit = undefined,
    nextSection = "",
    nextTab = "Shared",
  ) {
    if (
      nextUnit &&
      (genericPreview || !canOpenUnit(department, nextUnit, person))
    ) {
      setDeniedResource({
        kind: "unit",
        departmentId: department.id,
        unitId: nextUnit.id,
        unitOnly: nextUnit.access === "Unit-only",
      });
      setDenied(
        nextUnit.access === "Unit-only"
          ? "This unit has limited its coordination files to unit members."
          : "This unit’s coordination files are available to members of its department.",
      );
      return;
    }
    setFolder(nextFolder);
    setUnit(nextUnit);
    setSection(nextSection);
    onTabChange(nextTab === "Files" ? "Shared" : nextTab);
    setQuery("");
    setFile(undefined);
    setUploadId("");
    const search = new URLSearchParams({
      staff: person.id,
      department: departmentCodes[department.id],
      tab: nextTab === "Files" ? "Shared" : nextTab,
    });
    if (genericPreview) search.set("departmentPreview", department.id);
    if (nextFolder) search.set("folder", nextFolder);
    if (nextUnit) search.set("unit", nextUnit.id);
    if (nextSection) search.set("section", nextSection);
    history.replaceState({}, "", `/teams?${search}`);
  }
  const avatar = (name: string, colour?: string) => (
    <span
      className="m365-teams-avatar coord-avatar"
      style={{ background: colour || "#e9e6f2" }}
    >
      {name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
  function openFile(f: AdminFile) {
    if (permittedFiles.includes(f)) setFile(f);
  }
  function fileRows(list: AdminFile[]) {
    return (
      <table className="coord-shared-table" aria-label="Shared documents">
        <thead>
          <tr>
            <th>Name</th>
            <th>Modified by</th>
          </tr>
        </thead>
        <tbody>
          {list.map((f) => (
            <tr key={f.id}>
              <td>
                <button onClick={() => openFile(f)}>
                  <DocumentIcon name={f.name} />
                  {f.name}
                  <SensitivityBadge value={f.sensitivity} />
                </button>
              </td>
              <td>{f.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  const allPosts = [...department.posts, ...extraPosts];
  return (
    <div className="department-channel-body">
      {!entitled ? (
        <AccessBoundary
          workspaceId="department"
          department={department.id}
          resource={{ kind: "department", departmentId: department.id }}
          area="Department channel"
          personId={person.id}
          headingLevel={2}
          compact
          returnHref={`/teams?staff=${person.id}`}
          returnLabel="Open your Teams view"
        />
      ) : (
        <>
          {searchQuery === undefined && (
            <div className="coord-toolbar">
              <input
                aria-label="Search Department Coordination"
                placeholder="Search this department"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}
          {query.trim() ? (
            <section className="coord-search">
              <h2>Search results</h2>
              {fileRows(results.files)}
              {results.posts.map((p) => (
                <button
                  key={p.id}
                  className="coord-search-post"
                  onClick={() => {
                    navigate("", undefined, "", "Posts");
                    requestAnimationFrame(() =>
                      document
                        .getElementById(p.id)
                        ?.scrollIntoView({ block: "center" }),
                    );
                  }}
                >
                  <strong>{p.author}</strong>
                  <span>{p.text}</span>
                </button>
              ))}
              {!results.files.length && !results.posts.length && (
                <p>No accessible coordination items found.</p>
              )}
            </section>
          ) : tab === "Posts" ? (
            <div className="m365-teams-feed coord-posts">
              {allPosts.map((p) => {
                const original = department.posts.find((x) => x.id === p.id),
                  attachment = original?.attachmentId
                    ? department.library.find(
                        (f) => f.id === original.attachmentId,
                      )
                    : undefined;
                return (
                  <article
                    className="m365-teams-post coord-post"
                    key={p.id}
                    id={p.id}
                  >
                    <div className="m365-teams-post-header coord-post-top">
                      {avatar(
                        p.author,
                        p.author === department.coordinator.name
                          ? department.coordinator.colour
                          : undefined,
                      )}
                      <div>
                        <strong>{p.author}</strong>
                        <small>{p.time}</small>
                      </div>
                    </div>
                    <p data-no-translate={!original || undefined}>{p.text}</p>
                    {attachment && (
                      <button
                        className="coord-attachment"
                        onClick={() => openFile(attachment)}
                      >
                        <DocumentIcon name={attachment.name} />
                        {attachment.name}
                        <SensitivityBadge value={attachment.sensitivity} />
                      </button>
                    )}
                    {original?.upload &&
                      (original.upload.removed ? (
                        <div className="coord-attachment coord-attachment-removed">
                          <DocumentIcon name={original.upload.name} />
                          <span>
                            <s>{original.upload.name}</s>
                            <SensitivityBadge
                              value={original.upload.sensitivity}
                            />
                            <small>Attachment removed</small>
                          </span>
                        </div>
                      ) : (
                        <button
                          className="coord-attachment"
                          onClick={() => setUploadId(original.upload!.id)}
                        >
                          <DocumentIcon name={original.upload.name} />
                          <span>{original.upload.name}</span>
                          <SensitivityBadge
                            value={original.upload.sensitivity}
                          />
                        </button>
                      ))}
                    {original?.moderatorReply && (
                      <article
                        className="m365-teams-reply coord-moderator"
                        aria-label={`Moderator reply from ${department.coordinator.name}`}
                      >
                        {avatar(
                          department.coordinator.name,
                          department.coordinator.colour,
                        )}
                        <div className="thread-reply-body">
                          <header>
                            <strong>{department.coordinator.name}</strong>
                            <span className="coord-moderator-badge">
                              MODERATOR
                            </span>
                          </header>
                          <p>{original.moderatorReply}</p>
                          <StaffLink href={original.upload!.destination}>
                            Open destination: {original.upload!.destinationName}{" "}
                            →
                          </StaffLink>
                          {original.moderatorLikedBy && (
                            <NamedAcknowledgement
                              names={original.moderatorLikedBy}
                              person={person.name}
                            />
                          )}
                        </div>
                      </article>
                    )}
                    {original?.replies?.map((reply, i) => (
                      <article
                        className={`m365-teams-reply coord-local-reply${reply.moderator ? " coord-moderator" : ""}`}
                        aria-label={
                          reply.moderator
                            ? `Moderator reply from ${reply.author}`
                            : `Reply from ${reply.author}`
                        }
                        key={`seed-${i}`}
                      >
                        {avatar(reply.author)}
                        <div className="thread-reply-body">
                          <header>
                            <strong>{reply.author}</strong>
                            {reply.moderator && (
                              <span className="coord-moderator-badge">
                                MODERATOR
                              </span>
                            )}
                            <span>{reply.time}</span>
                          </header>
                          <p>{reply.text}</p>
                          {reply.link && (
                            <StaffLink href={reply.link.href}>
                              {reply.link.label}
                            </StaffLink>
                          )}
                        </div>
                      </article>
                    ))}
                    {(replies[p.id] || []).map((reply, i) => (
                      <article
                        className="m365-teams-reply coord-local-reply"
                        key={i}
                      >
                        {avatar(person.name)}
                        <div>
                          <strong>{person.name}</strong>
                          <p data-no-translate>{reply}</p>
                        </div>
                      </article>
                    ))}
                    <div className="m365-teams-reactions coord-reactions">
                      <button
                        aria-pressed={likes.includes(p.id)}
                        onClick={() =>
                          setLikes(
                            likes.includes(p.id)
                              ? likes.filter((id) => id !== p.id)
                              : [...likes, p.id],
                          )
                        }
                      >
                        👍 {likes.includes(p.id) ? "1" : "Like"}
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
                              [p.id]: [
                                ...(replies[p.id] || []),
                                replyDraft.trim(),
                              ],
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
                    setExtraPosts([
                      ...extraPosts,
                      {
                        id: `local-${extraPosts.length}`,
                        author: person.name,
                        text: draft.trim(),
                        time: "Now",
                      },
                    ]);
                    setDraft("");
                  }
                }}
              />
            </div>
          ) : (
            <section className="coord-files">
              <div className="m365-teams-files-toolbar">
                <Button
                  appearance="subtle"
                  onClick={() => setSharePointOpen(true)}
                >
                  Open in SharePoint ↗
                </Button>
              </div>

              <nav
                aria-label="Department file location"
                className="coord-breadcrumb"
              >
                <button onClick={() => navigate()}>Documents</button>
                {folder && (
                  <>
                    <span>/</span>
                    <button onClick={() => navigate(folder)}>{folder}</button>
                  </>
                )}
                {unit && (
                  <>
                    <span>/</span>
                    <button onClick={() => navigate("Unit Coordination", unit)}>
                      {unit.name}
                    </button>
                  </>
                )}
                {section && (
                  <>
                    <span>/</span>
                    <span>{section}</span>
                  </>
                )}
              </nav>
              {!folder ? (
                <div className="coord-folders">
                  {departmentFolders
                    .filter((f) => !genericPreview || f !== "Unit Coordination")
                    .map((f) => (
                      <button key={f} onClick={() => navigate(f)}>
                        <Folder20Regular />
                        {f}
                        <span>›</span>
                      </button>
                    ))}
                </div>
              ) : folder === "Unit Coordination" ? (
                !unit ? (
                  <div className="coord-folders">
                    {department.units.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => navigate("Unit Coordination", u)}
                      >
                        <Folder20Regular />
                        <span>
                          {u.name}
                          <small>{u.access}</small>
                        </span>
                        {u.access === "Unit-only" ? (
                          <AccessLock />
                        ) : (
                          <span>›</span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : !unitAllowed ? (
                  <p>
                    This unit’s coordination files are unavailable for this
                    staff preview.
                  </p>
                ) : !section ? (
                  <div className="coord-folders">
                    {unitFolders.map((f) => (
                      <button
                        key={f}
                        onClick={() => navigate("Unit Coordination", unit, f)}
                      >
                        <Folder20Regular />
                        {f}
                        <span>›</span>
                      </button>
                    ))}
                  </div>
                ) : section === "Absence & Cover Calendar" ? (
                  <>
                    <h2>Absence & Cover Calendar</h2>
                    <p>Availability and cover only · October 2026</p>
                    <table className="coord-cover">
                      <thead>
                        <tr>
                          <th>Colleague</th>
                          <th>Availability</th>
                          <th>Dates</th>
                          <th>Cover</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unit.calendarItems.map((c, i) => (
                          <tr key={i}>
                            <td>{c.person}</td>
                            <td>{c.availability}</td>
                            <td>{c.dates}</td>
                            <td>{c.cover}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <>
                    {fileRows(unit.files.filter((f) => f.folder === section))}
                    {!unit.files.some((f) => f.folder === section) && (
                      <p>
                        No current local administration files in this folder.
                      </p>
                    )}
                  </>
                )
              ) : (
                <>
                  {fileRows(
                    department.library.filter((f) => f.folder === folder),
                  )}
                </>
              )}
            </section>
          )}
        </>
      )}
      <Dialog
        open={sharePointOpen}
        onOpenChange={(_, data) => setSharePointOpen(data.open)}
      >
        <DialogSurface className="department-sharepoint-library">
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  icon={<Dismiss20Regular />}
                  aria-label="Close SharePoint documents"
                  onClick={() => setSharePointOpen(false)}
                />
              }
            >
              {department.name} · SharePoint
            </DialogTitle>
            <DialogContent>
              <DocumentLibrary
                title="Documents"
                headingLevel={2}
                files={permittedFiles.map((f) => ({
                  id: f.id,
                  sensitivity: f.sensitivity,
                  name: f.name,
                  folder: f.unitId
                    ? `Unit Coordination/${department.units.find((u) => u.id === f.unitId)?.name}/${f.folder}`
                    : f.folder,
                  owner: f.owner,
                  status: "Current",
                }))}
              />
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      <Dialog
        open={!!denied}
        onOpenChange={(_, d) => {
          if (!d.open) setDenied("");
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Department access</DialogTitle>
            <DialogContent>
              <AccessBoundary
                workspaceId="department"
                department={department.id}
                resource={deniedResource}
                area={denied || "Restricted department coordination"}
                personId={person.id}
                headingLevel={2}
                compact
                returnHref={`/teams?staff=${person.id}`}
                returnLabel="Open your Teams view"
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setDenied("");
                  if (unit && !unitAllowed) navigate("Unit Coordination");
                }}
              >
                Close
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      <Drawer
        open={!!file || !!selectedUpload}
        onOpenChange={(_, d) => {
          if (!d.open) {
            setFile(undefined);
            setUploadId("");
          }
        }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                icon={<Dismiss20Regular />}
                aria-label="Close coordination file"
                onClick={() => {
                  setFile(undefined);
                  setUploadId("");
                }}
              />
            }
          >
            {file ? "Details" : "Attachment"}
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {file ? (
            <>
              <h2>{file.name}</h2>
              <dl>
                <dt>Sensitivity</dt>
                <dd>
                  <SensitivityBadge value={file.sensitivity} />
                </dd>
                <dt>Team</dt>
                <dd>{department.name}</dd>
                <dt>Folder</dt>
                <dd>{file.folder}</dd>
                <dt>Modified by</dt>
                <dd>{file.owner}</dd>
              </dl>
            </>
          ) : (
            selectedUpload && (
              <>
                <h2>{selectedUpload.name}</h2>
                <p>
                  Sensitivity:{" "}
                  <SensitivityBadge value={selectedUpload.sensitivity} />
                </p>
                <StaffLink href={selectedUpload.destination}>
                  Open destination: {selectedUpload.destinationName} →
                </StaffLink>
              </>
            )
          )}
        </DrawerBody>
      </Drawer>
    </div>
  );
}
