import { useState } from "react";
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
} from "@fluentui/react-components";
import {
  Folder20Regular,
  LockClosed16Regular,
  Dismiss20Regular,
} from "@fluentui/react-icons";
import DocumentIcon from "../components/DocumentIcon";
import {
  divisionFolders,
  unitFolders,
  canOpenDivision,
  canOpenUnit,
  accessibleFiles,
  searchCoordination,
  type Division,
  type CoordinationPerson,
  type AdminFile,
} from "./data";
import "./styles.css";
export default function DivisionChannel({
  division,
  person,
}: {
  division: Division;
  person: CoordinationPerson;
}) {
  const params = new URLSearchParams(location.search),
    initialUnit = division.units.find((u) => u.id === params.get("unit"));
  const entitled = canOpenDivision(division, person);
  const [tab, setTab] = useState(
      params.get("tab") === "Files" ? "Files" : "Posts",
    ),
    [folder, setFolder] = useState(params.get("folder") || ""),
    [unit, setUnit] = useState(initialUnit),
    [section, setSection] = useState(params.get("section") || "");
  const [denied, setDenied] = useState(
      initialUnit && !canOpenUnit(division, initialUnit, person)
        ? "This unit has limited its coordination files to unit members."
        : "",
    ),
    [query, setQuery] = useState(""),
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
  const permittedFiles = accessibleFiles(division, person),
    seededResults = searchCoordination(division, person, query),
    unitAllowed = !!unit && canOpenUnit(division, unit, person);
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
  const selectedUpload = division.posts.find(
    (p) => p.upload?.id === uploadId,
  )?.upload;
  function navigate(
    nextFolder = "",
    nextUnit: typeof unit = undefined,
    nextSection = "",
    nextTab = "Files",
  ) {
    if (nextUnit && !canOpenUnit(division, nextUnit, person)) {
      setDenied(
        nextUnit.access === "Unit-only"
          ? "This unit has limited its coordination files to unit members."
          : "This unit’s coordination files are available to members of its division.",
      );
      return;
    }
    setFolder(nextFolder);
    setUnit(nextUnit);
    setSection(nextSection);
    setTab(nextTab);
    setQuery("");
    setFile(undefined);
    setUploadId("");
    const search = new URLSearchParams({
      staff: person.id,
      division: division.id,
      tab: nextTab,
    });
    if (nextFolder) search.set("folder", nextFolder);
    if (nextUnit) search.set("unit", nextUnit.id);
    if (nextSection) search.set("section", nextSection);
    history.replaceState({}, "", `/teams?${search}`);
  }
  const avatar = (name: string, colour?: string) => (
    <span className="coord-avatar" style={{ background: colour || "#e9e6f2" }}>
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
      <div className="coord-file-list">
        {list.map((f) => (
          <button key={f.id} onClick={() => openFile(f)}>
            <DocumentIcon name={f.name} />
            <span>
              {f.name}
              <small>
                {f.unitId
                  ? `${division.units.find((u) => u.id === f.unitId)?.name} / `
                  : ""}
                {f.folder} · {f.owner} · Local administration
              </small>
            </span>
          </button>
        ))}
      </div>
    );
  }
  const allPosts = [...division.posts, ...extraPosts];
  return (
    <>
      <header className="coord-channel-heading">
        <div>
          <h1>{division.name}</h1>
          <p>
            Division coordination ·{" "}
            <span className="coord-access">{division.channelAccess}</span>
          </p>
        </div>
        <small>
          Coordinator: {division.coordinator.name} · {division.units.length}{" "}
          units
        </small>
      </header>
      {!entitled ? (
        <section className="coord-channel-denied">
          <LockClosed16Regular />
          <h2>You don’t have access to this division channel.</h2>
          <p>
            This channel is limited to division members. Choose a staff preview
            who belongs to {division.name} to explore it.
          </p>
          <p>
            Local team access · No access request to confidential business
            records is needed here.
          </p>
        </section>
      ) : (
        <>
          <div className="coord-toolbar">
            <nav aria-label="Division channel tabs">
              {["Posts", "Files"].map((t) => (
                <button
                  key={t}
                  aria-current={tab === t ? "page" : undefined}
                  onClick={() => navigate("", undefined, "", t)}
                >
                  {t}
                </button>
              ))}
            </nav>
            <input
              aria-label="Search Division Coordination"
              placeholder="Search this division"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {query.trim() ? (
            <section className="coord-search">
              <h2>Search this division</h2>
              <p>Accessible local administration files and channel posts.</p>
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
            <div className="coord-posts">
              {allPosts.map((p) => {
                const original = division.posts.find((x) => x.id === p.id),
                  attachment = original?.attachmentId
                    ? division.library.find(
                        (f) => f.id === original.attachmentId,
                      )
                    : undefined;
                return (
                  <article className="coord-post" key={p.id} id={p.id}>
                    <div className="coord-post-top">
                      {avatar(
                        p.author,
                        p.author === division.coordinator.name
                          ? division.coordinator.colour
                          : undefined,
                      )}
                      <div>
                        <strong>{p.author}</strong>
                        <small>{p.time} · Division Coordination</small>
                      </div>
                    </div>
                    <p>{p.text}</p>
                    {attachment && (
                      <button
                        className="coord-attachment"
                        onClick={() => openFile(attachment)}
                      >
                        <DocumentIcon name={attachment.name} />
                        {attachment.name}
                      </button>
                    )}
                    {original?.upload && (
                      <button
                        className="coord-attachment"
                        onClick={() => setUploadId(original.upload!.id)}
                      >
                        <DocumentIcon name={original.upload.name} />
                        <span>
                          {original.upload.name}
                          <small>
                            Uploaded in this thread · Working location needs
                            updating
                          </small>
                        </span>
                      </button>
                    )}
                    {original?.moderatorReply && (
                      <article
                        className="teams-thread-reply coord-moderator"
                        aria-label={`Moderator reply from ${division.coordinator.name}`}
                      >
                        {avatar(
                          division.coordinator.name,
                          division.coordinator.colour,
                        )}
                        <div className="thread-reply-body">
                          <header>
                            <strong>{division.coordinator.name}</strong>
                            <span className="coord-moderator-badge">
                              MODERATOR
                            </span>
                          </header>
                          <small>{division.coordinator.role}</small>
                          <p>{original.moderatorReply}</p>
                          <a href={original.upload!.destination}>
                            Open destination: {original.upload!.destinationName}{" "}
                            →
                          </a>
                        </div>
                      </article>
                    )}
                    {(replies[p.id] || []).map((reply, i) => (
                      <article
                        className="teams-thread-reply coord-local-reply"
                        key={i}
                      >
                        {avatar(person.name)}
                        <div>
                          <strong>{person.name}</strong>
                          <p>{reply}</p>
                        </div>
                      </article>
                    ))}
                    <div className="coord-reactions">
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
                      <form
                        className="coord-reply-form"
                        onSubmit={(e) => {
                          e.preventDefault();
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
                      >
                        <label>
                          Reply to {p.author}
                          <input
                            value={replyDraft}
                            onChange={(e) => setReplyDraft(e.target.value)}
                          />
                        </label>
                        <Button type="submit" disabled={!replyDraft.trim()}>
                          Post reply
                        </Button>
                      </form>
                    )}
                  </article>
                );
              })}
              <form
                className="coord-composer"
                onSubmit={(e) => {
                  e.preventDefault();
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
              >
                <label>
                  New division coordination post
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="A fictional local update, meeting or cover arrangement…"
                  />
                </label>
                <Button type="submit" disabled={!draft.trim()}>
                  Post update
                </Button>
              </form>
            </div>
          ) : (
            <section className="coord-files">
              <p className="coord-info-strip">
                Division files are for meetings, local planning and team
                administration. Use Digital Workspaces for shared business work.
              </p>
              <nav
                aria-label="Division file location"
                className="coord-breadcrumb"
              >
                <button onClick={() => navigate()}>Files</button>
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
                  {divisionFolders.map((f) => (
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
                    {division.units.map((u) => (
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
                          <LockClosed16Regular />
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
                    <h2>{section}</h2>
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
                  <h2>{folder}</h2>
                  {fileRows(
                    division.library.filter((f) => f.folder === folder),
                  )}
                </>
              )}
            </section>
          )}
          <p className="coord-footnote">
            Local coordination is a normal part of the work. Changes are
            simulated in this browser and reset on reload.
          </p>
        </>
      )}
      <Dialog
        open={!!denied}
        onOpenChange={(_, d) => {
          if (!d.open) setDenied("");
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Access denied</DialogTitle>
            <DialogContent>{denied}</DialogContent>
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
            {file ? "Local administration file" : "Thread upload"}
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {file ? (
            <>
              <h2>{file.name}</h2>
              <p>
                {file.id} · {division.name}
              </p>
              <p>
                {file.folder} · {file.owner}
              </p>
              <p>
                This is the same local-administration object used by the thread
                attachment and Files tab. It contains meeting, planning-process
                or team coordination context.
              </p>
              <p>
                No authoritative business model, customer record or sensitive
                personnel information is included.
              </p>
            </>
          ) : (
            selectedUpload && (
              <>
                <h2>{selectedUpload.name}</h2>
                <p>{selectedUpload.id} · Uploaded example in this thread</p>
                <p>
                  This is substantive business work. The example has not been
                  added to the division administration library. Use the
                  functional working location below; do not upload a second copy
                  here.
                </p>
                <a href={selectedUpload.destination}>
                  Open destination: {selectedUpload.destinationName} →
                </a>
              </>
            )
          )}
        </DrawerBody>
      </Drawer>
    </>
  );
}
