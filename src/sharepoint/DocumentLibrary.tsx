import { useEffect, useId, useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from "@fluentui/react-components";
import {
  Add20Regular,
  ArrowLeft20Regular,
  ArrowUpload20Regular,
  ChevronRight16Regular,
  ChevronDown16Regular,
  Dismiss20Regular,
  Document20Regular,
  Folder24Filled,
  History20Regular,
  Info20Regular,
  MoreHorizontal20Regular,
  Filter20Regular,
  Search20Regular,
  TextBulletList20Regular,
} from "@fluentui/react-icons";
import DocumentIcon from "../components/DocumentIcon";
import {
  childLibraryFolders,
  documentProperties,
  documentVersions,
  libraryDate,
  libraryFolders,
  libraryLocation,
  libraryColumns,
  libraryFields,
  libraryValue,
  libraryViewDefinitions,
  contentTypeDefaults,
  normaliseFolder,
  queryLibrary,
  type LibraryDocument,
  type LibraryDefinition,
  type LibraryColumn,
  type LibrarySort,
  type LibraryView,
} from "./library";
import "./styles.css";

export type {
  LibraryDocument,
  LibraryDefinition,
  LibraryColumn,
  LibraryContentType,
  LibraryViewDefinition,
} from "./library";
export interface DocumentLibraryProps {
  title: string;
  definition?: LibraryDefinition;
  files: LibraryDocument[];
  folders?: string[];
  readOnly?: boolean;
  embedded?: boolean;
  headingLevel?: 1 | 2;
  initialFolder?: string;
  onOpen?: (file: LibraryDocument) => void;
}

type Surface =
  "preview" | "details" | "versions" | "new" | "upload" | "edit" | null;

/** A small, working SharePoint-style library. Supplied file IDs remain canonical. */
export default function DocumentLibrary({
  title,
  definition,
  files,
  folders = [],
  readOnly = false,
  embedded = false,
  headingLevel,
  initialFolder = "",
  onOpen,
}: DocumentLibraryProps) {
  const headingId = useId();
  const Heading = (headingLevel ?? (embedded ? 2 : 1)) === 1 ? "h1" : "h2";
  const [folder, setFolder] = useState(
    () =>
      libraryLocation(
        new URLSearchParams(location.search),
        title,
        files,
        initialFolder,
      ).folder,
  );
  const [activeId, setActiveId] = useState<string | null>(
    () =>
      libraryLocation(
        new URLSearchParams(location.search),
        title,
        files,
        initialFolder,
      ).file?.id ?? null,
  );
  const [surface, setSurface] = useState<Surface>(() =>
    libraryLocation(
      new URLSearchParams(location.search),
      title,
      files,
      initialFolder,
    ).file
      ? "preview"
      : null,
  );
  const views = libraryViewDefinitions(definition);
  const defaultView = views[0].id;
  const [view, setView] = useState<LibraryView>(defaultView);
  const isDefaultView = view === defaultView;
  const columns = libraryColumns(definition, view);
  const fields = libraryFields(definition);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<LibrarySort>(
    embedded ? "modified" : (views[0].sortBy ?? "name"),
  );
  const [descending, setDescending] = useState(
    embedded || (views[0].descending ?? views[0].sortBy === "modified"),
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [created, setCreated] = useState<LibraryDocument[]>([]);
  const [createdFolders, setCreatedFolders] = useState<string[]>([]);
  const [edits, setEdits] = useState<Record<string, Partial<LibraryDocument>>>(
    {},
  );
  const [notice, setNotice] = useState("");
  const [newKind, setNewKind] = useState("Document");
  const [newName, setNewName] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editOwner, setEditOwner] = useState("");
  const [formError, setFormError] = useState("");
  const [newMetadata, setNewMetadata] = useState<Record<string, string>>({});
  const [editMetadata, setEditMetadata] = useState<Record<string, string>>({});
  const [editContentType, setEditContentType] = useState("Document");
  const selectedType = definition?.contentTypes?.find(
    (type) => type.id === newKind || type.name === newKind,
  );
  const editingType = definition?.contentTypes?.find(
    (type) => type.id === editContentType || type.name === editContentType,
  );
  const metadataFields = (typeFields?: string[]) =>
    fields.filter(
      (field) =>
        ![
          "name",
          "modified",
          "owner",
          "status",
          "contentType",
          "folder",
        ].includes(field.key) &&
        (!typeFields || typeFields.includes(field.key)),
    );
  const allFiles = [...files, ...created].map((file) =>
    edits[file.id] ? { ...file, ...edits[file.id] } : file,
  );
  const active = allFiles.find((file) => file.id === activeId);
  const paths = libraryFolders(allFiles, [...folders, ...createdFolders]);
  const folderPaths =
    !embedded && isDefaultView && !search && !status
      ? childLibraryFolders(paths, folder)
      : [];
  const rows = queryLibrary(allFiles, {
    folder: embedded ? "" : folder,
    search,
    status,
    view,
    sort,
    descending,
    embedded,
    definition,
  });
  const visibleRows = embedded ? rows.slice(0, 5) : rows;
  const statuses = [
    ...new Set([
      ...allFiles.map((file) => file.status ?? "Draft"),
      "Draft",
      "In review",
      "Approved",
    ]),
  ].sort();
  const selectedFile =
    selected.size === 1
      ? allFiles.find((file) => selected.has(file.id))
      : undefined;

  function updateUrl(nextFolder: string, file?: LibraryDocument, push = false) {
    const url = new URL(location.href);
    url.searchParams.set("library", title);
    if (nextFolder) url.searchParams.set("folder", nextFolder);
    else url.searchParams.delete("folder");
    if (file) url.searchParams.set("file", file.id);
    else url.searchParams.delete("file");
    if (push) history.pushState(history.state, "", url);
    else history.replaceState(history.state, "", url);
  }

  useEffect(() => {
    const restore = () => {
      const restored = libraryLocation(
        new URLSearchParams(location.search),
        title,
        files,
        initialFolder,
      );
      setFolder(restored.folder);
      setActiveId(restored.file?.id ?? null);
      setSurface(restored.file ? "preview" : null);
      setSelected(new Set());
    };
    addEventListener("popstate", restore);
    return () => removeEventListener("popstate", restore);
  }, [title, files, initialFolder]);

  function navigateFolder(next: string) {
    const path = normaliseFolder(next);
    setFolder(path);
    setSelected(new Set());
    setSearch("");
    setStatus("");
    setView(defaultView);
    setSurface(null);
    setActiveId(null);
    updateUrl(path, undefined, true);
  }

  function showFile(
    file: LibraryDocument,
    nextSurface: "preview" | "details" | "versions",
  ) {
    setActiveId(file.id);
    setSurface(nextSurface);
    updateUrl(file.folder, file);
  }

  function openFile(file: LibraryDocument) {
    if (onOpen) {
      updateUrl(file.folder, file);
      onOpen(file);
    } else showFile(file, "preview");
  }

  function closeSurface() {
    setSurface(null);
    setActiveId(null);
    if (new URLSearchParams(location.search).get("library") === title)
      updateUrl(folder);
    setFormError("");
  }

  function changeSort(key: LibrarySort) {
    if (key === sort) setDescending(!descending);
    else {
      setSort(key);
      setDescending(key === "modified");
    }
  }

  function addItem() {
    const name = (surface === "upload" ? uploadName : newName).trim();
    if (!name) {
      setFormError(
        surface === "upload"
          ? "Choose a file to continue."
          : "Enter a name to continue.",
      );
      return;
    }
    if (/[\\/]/.test(name)) {
      setFormError("Use a name without a slash.");
      return;
    }
    if (newKind === "Folder" && surface === "new") {
      const path = [folder, name].filter(Boolean).join("/");
      if (paths.includes(path)) {
        setFormError("A folder with this name already exists here.");
        return;
      }
      setCreatedFolders((current) => [...current, path]);
      setNotice(`Folder “${name}” created.`);
    } else {
      const filename =
        surface === "upload" || /\.[a-z0-9]{1,6}$/i.test(name)
          ? name
          : `${name}.${selectedType?.extension?.replace(/^\./, "") ?? "docx"}`;
      if (
        allFiles.some(
          (file) => file.name === filename && file.folder === folder,
        )
      ) {
        setFormError("A file with this name already exists here.");
        return;
      }
      const required = metadataFields(selectedType?.fields).find(
        (field) => field.required && !newMetadata[field.key]?.trim(),
      );
      if (required) {
        setFormError(`Enter ${required.label.toLocaleLowerCase()}.`);
        return;
      }
      const defaults = contentTypeDefaults(selectedType);
      setCreated((current) => [
        ...current,
        {
          id: `preview-${crypto.randomUUID()}`,
          name: filename,
          folder,
          modified: new Date().toISOString().slice(0, 10),
          owner: defaults.owner,
          status: defaults.status,
          contentType: selectedType?.id ?? "Document",
          metadata: { ...defaults.metadata, ...newMetadata },
          summary: selectedType?.template ?? "New working document.",
        },
      ]);
      setNotice(`“${filename}” ${surface === "upload" ? "added" : "created"}.`);
    }
    setSearch("");
    setStatus("");
    setView(defaultView);
    setSurface(null);
    setFormError("");
    setNewName("");
    setUploadName("");
  }

  function beginEdit(file: LibraryDocument) {
    setEditName(file.name);
    setEditOwner(file.owner ?? "");
    setEditStatus(file.status ?? "Draft");
    setEditMetadata({ ...file.metadata });
    setEditContentType(file.contentType ?? "Document");
    setSurface("edit");
  }

  function saveEdit() {
    if (!active || !editName.trim() || !editOwner.trim()) {
      setFormError("Enter a file name and owner.");
      return;
    }
    const required = metadataFields(editingType?.fields).find(
      (field) => field.required && !editMetadata[field.key]?.trim(),
    );
    if (required) {
      setFormError(`Enter ${required.label.toLocaleLowerCase()}.`);
      return;
    }
    setEdits((current) => ({
      ...current,
      [active.id]: {
        name: editName.trim(),
        owner: editOwner.trim(),
        status: editStatus,
        contentType: editContentType,
        metadata: editMetadata,
      },
    }));
    setNotice("Properties updated.");
    setSurface("details");
    setFormError("");
  }

  function beginNew(kind: string) {
    const type = definition?.contentTypes?.find((item) => item.id === kind);
    setNewKind(kind);
    setNewName("");
    setNewMetadata(contentTypeDefaults(type).metadata);
    setFormError("");
    setSurface("new");
  }

  function metadataInput(
    field: LibraryColumn,
    values: Record<string, string>,
    onChange: (values: Record<string, string>) => void,
  ) {
    const value = values[field.key] ?? "";
    return (
      <label key={field.key}>
        {field.label}
        {field.required ? " *" : ""}
        {field.choices?.length ? (
          <select
            value={value}
            onChange={(event) =>
              onChange({ ...values, [field.key]: event.target.value })
            }
          >
            <option value="">Choose {field.label.toLocaleLowerCase()}</option>
            {[...new Set([...field.choices, ...(value ? [value] : [])])].map(
              (choice) => (
                <option key={choice}>{choice}</option>
              ),
            )}
          </select>
        ) : (
          <Input
            type={field.type === "date" ? "date" : "text"}
            value={value}
            onChange={(_, data) =>
              onChange({ ...values, [field.key]: data.value })
            }
          />
        )}
      </label>
    );
  }

  function fileActions(file: LibraryDocument) {
    return (
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Button
            appearance="subtle"
            size="small"
            icon={<MoreHorizontal20Regular />}
            aria-label={`More actions for ${file.name}`}
          />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem
              onClick={() => showFile(file, "preview")}
              icon={<Document20Regular />}
            >
              Preview
            </MenuItem>
            <MenuItem
              onClick={() => showFile(file, "details")}
              icon={<Info20Regular />}
            >
              Details
            </MenuItem>
            <MenuItem
              onClick={() => showFile(file, "versions")}
              icon={<History20Regular />}
            >
              Version history
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    );
  }

  return (
    <section
      className={`sp-document-library${embedded ? " sp-library-embedded" : ""}`}
      aria-labelledby={headingId}
    >
      <div className="sp-library-heading">
        <Heading id={headingId}>{title}</Heading>
        {readOnly && <span className="sp-library-readonly">Read only</span>}
      </div>
      {!embedded && definition?.purpose && (
        <p className="sp-library-purpose">{definition.purpose}</p>
      )}
      {!embedded && (
        <>
          {folder && (
            <nav
              className="sp-library-breadcrumbs"
              aria-label={`${title} folders`}
            >
              {folder && (
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<ArrowLeft20Regular />}
                  aria-label="Back to parent folder"
                  onClick={() =>
                    navigateFolder(folder.split("/").slice(0, -1).join("/"))
                  }
                />
              )}
              <button
                onClick={() => navigateFolder("")}
                aria-current={!folder ? "page" : undefined}
              >
                {title}
              </button>
              {folder
                .split("/")
                .filter(Boolean)
                .map((part, i, parts) => (
                  <span key={parts.slice(0, i + 1).join("/")}>
                    <ChevronRight16Regular aria-hidden="true" />
                    <button
                      onClick={() =>
                        navigateFolder(parts.slice(0, i + 1).join("/"))
                      }
                      aria-current={i === parts.length - 1 ? "page" : undefined}
                    >
                      {part}
                    </button>
                  </span>
                ))}
            </nav>
          )}
          <div className="sp-library-commandbar">
            <div className="sp-library-commands">
              {!readOnly && (
                <>
                  <Menu>
                    <MenuTrigger disableButtonEnhancement>
                      <Button
                        appearance="primary"
                        icon={<Add20Regular />}
                        iconPosition="before"
                      >
                        New <ChevronDown16Regular />
                      </Button>
                    </MenuTrigger>
                    <MenuPopover>
                      <MenuList>
                        <MenuItem
                          icon={<Document20Regular />}
                          onClick={() => beginNew("Document")}
                        >
                          Document
                        </MenuItem>
                        {(definition?.contentTypes ?? [])
                          .filter(
                            (type) =>
                              type.id !== "Document" &&
                              type.name !== "Document",
                          )
                          .map((type) => (
                            <MenuItem
                              key={type.id}
                              icon={<Document20Regular />}
                              onClick={() => beginNew(type.id)}
                            >
                              {type.name}
                            </MenuItem>
                          ))}
                        <MenuItem
                          icon={<Folder24Filled />}
                          onClick={() => beginNew("Folder")}
                        >
                          Folder
                        </MenuItem>
                      </MenuList>
                    </MenuPopover>
                  </Menu>
                  <Button
                    appearance="subtle"
                    icon={<ArrowUpload20Regular />}
                    onClick={() => {
                      setUploadName("");
                      setNewKind("Document");
                      setNewMetadata({});
                      setFormError("");
                      setSurface("upload");
                    }}
                  >
                    Upload
                  </Button>
                </>
              )}
              {selectedFile && (
                <>
                  <Button
                    appearance="subtle"
                    icon={<Info20Regular />}
                    onClick={() => showFile(selectedFile, "details")}
                  >
                    Details
                  </Button>
                  <Button
                    appearance="subtle"
                    icon={<History20Regular />}
                    onClick={() => showFile(selectedFile, "versions")}
                  >
                    Version history
                  </Button>
                </>
              )}
              {selected.size > 0 && (
                <Button
                  appearance="subtle"
                  size="small"
                  onClick={() => setSelected(new Set())}
                >
                  {selected.size} selected · Clear
                </Button>
              )}
            </div>
            <label className="sp-library-view">
              <span className="sr-only">Library view</span>
              <TextBulletList20Regular aria-hidden="true" />
              <select
                value={view}
                onChange={(event) => {
                  const next = event.target.value as LibraryView;
                  setView(next);
                  setSelected(new Set());
                  const nextView = views.find((item) => item.id === next);
                  const nextSort =
                    nextView?.sortBy ??
                    (next === "Recent documents" ? "modified" : "name");
                  setSort(nextSort);
                  setDescending(
                    nextView?.descending ?? nextSort === "modified",
                  );
                }}
              >
                {views.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown16Regular aria-hidden="true" />
            </label>
          </div>
          <div className="sp-library-filters">
            <Input
              aria-label={`Search ${title}`}
              placeholder="Search this library"
              contentBefore={<Search20Regular />}
              value={search}
              onChange={(_, data) => {
                setSearch(data.value);
                setSelected(new Set());
              }}
            />
            <label className="sp-library-status-filter">
              <span className="sr-only">Filter by status</span>
              <Filter20Regular aria-hidden="true" />
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setSelected(new Set());
                }}
              >
                <option value="">All statuses</option>
                {statuses.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
              <ChevronDown16Regular aria-hidden="true" />
            </label>
            {(search || status || !isDefaultView) && (
              <Button
                appearance="transparent"
                size="small"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setView(defaultView);
                }}
              >
                Clear filters
              </Button>
            )}
            <span className="sp-library-count">
              {folderPaths.length > 0
                ? `${folderPaths.length} folder${folderPaths.length === 1 ? "" : "s"}${rows.length ? " · " : ""}`
                : ""}
              {rows.length > 0 || !folderPaths.length
                ? `${rows.length} document${rows.length === 1 ? "" : "s"}`
                : ""}
            </span>
          </div>
        </>
      )}
      {notice && (
        <div className="sp-library-notice" role="status">
          <Info20Regular />
          <span>{notice}</span>
          <Button
            appearance="subtle"
            size="small"
            icon={<Dismiss20Regular />}
            aria-label="Dismiss library notification"
            onClick={() => setNotice("")}
          />
        </div>
      )}
      <div className="sp-library-table-scroll">
        <table className="sp-library-table" aria-label={`${title} documents`}>
          <thead>
            <tr>
              {!embedded && (
                <th className="sp-library-select">
                  <Checkbox
                    aria-label="Select all documents"
                    checked={
                      visibleRows.length > 0 &&
                      visibleRows.every((file) => selected.has(file.id))
                        ? true
                        : visibleRows.some((file) => selected.has(file.id))
                          ? "mixed"
                          : false
                    }
                    onChange={(_, data) =>
                      setSelected(
                        data.checked === true
                          ? new Set(visibleRows.map((file) => file.id))
                          : new Set(),
                      )
                    }
                    disabled={!visibleRows.length}
                  />
                </th>
              )}
              <th className="sp-library-type" aria-label="File type" />
              {columns.map(({ key, label }) => (
                <th
                  key={key}
                  className={`sp-library-column-${["name", "modified", "owner", "status"].includes(key) ? key : "metadata"}`}
                  aria-sort={
                    sort === key
                      ? descending
                        ? "descending"
                        : "ascending"
                      : "none"
                  }
                >
                  <button onClick={() => changeSort(key)}>
                    {label}
                    <span aria-hidden="true">
                      {sort === key ? (descending ? " ↓" : " ↑") : ""}
                    </span>
                  </button>
                </th>
              ))}
              <th className="sp-library-actions" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {folderPaths.map((path) => {
              const count = allFiles.filter(
                (file) =>
                  file.folder === path || file.folder.startsWith(path + "/"),
              ).length;
              return (
                <tr key={`folder:${path}`} className="sp-library-folder-row">
                  {!embedded && <td />}
                  <td className="sp-library-type">
                    <Folder24Filled aria-label="Folder" />
                  </td>
                  <td>
                    <button
                      className="sp-library-name"
                      onClick={() => navigateFolder(path)}
                    >
                      {path.split("/").pop()}
                    </button>
                    <span className="sp-library-folder-count">
                      {count} document{count === 1 ? "" : "s"}
                    </span>
                  </td>
                  {columns.length > 1 && <td colSpan={columns.length - 1} />}
                  <td />
                </tr>
              );
            })}
            {visibleRows.map((file) => (
              <tr
                key={file.id}
                className={
                  selected.has(file.id) ? "sp-library-row-selected" : ""
                }
              >
                {!embedded && (
                  <td className="sp-library-select">
                    <Checkbox
                      aria-label={`Select ${file.name}`}
                      checked={selected.has(file.id)}
                      onChange={(_, data) =>
                        setSelected((current) => {
                          const next = new Set(current);
                          if (data.checked) next.add(file.id);
                          else next.delete(file.id);
                          return next;
                        })
                      }
                    />
                  </td>
                )}
                <td className="sp-library-type">
                  <DocumentIcon name={file.name} />
                </td>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`sp-library-column-${["name", "modified", "owner", "status"].includes(column.key) ? column.key : "metadata"}`}
                  >
                    {column.key === "name" ? (
                      <>
                        <button
                          className="sp-library-name"
                          onClick={() => openFile(file)}
                        >
                          {file.name}
                        </button>
                        {(embedded || search || !isDefaultView) &&
                          file.folder && (
                            <small className="sp-library-file-location">
                              {file.folder}
                            </small>
                          )}
                      </>
                    ) : column.key === "status" ? (
                      <span className="sp-library-status">
                        {file.status ?? "Draft"}
                      </span>
                    ) : column.type === "date" || column.key === "modified" ? (
                      libraryDate(libraryValue(file, column.key, definition))
                    ) : (
                      libraryValue(file, column.key, definition) || "—"
                    )}
                  </td>
                ))}
                <td className="sp-library-actions">{fileActions(file)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!visibleRows.length && !folderPaths.length && (
        <div className="sp-library-empty">
          <Search20Regular />
          <p>
            {search || status || !isDefaultView
              ? "No documents match this view."
              : "This folder is empty."}
          </p>
          {(search || status || !isDefaultView) && (
            <Button
              appearance="transparent"
              onClick={() => {
                setSearch("");
                setStatus("");
                setView(defaultView);
              }}
            >
              Show all documents
            </Button>
          )}
        </div>
      )}
      {/* Keep the Fluent overlay owners mounted so their closed-state lifecycle
          restores focus and accessibility before their surfaces leave the DOM. */}
      <Drawer
        className="sp-details-pane"
        type="overlay"
        modalType="non-modal"
        position="end"
        size="medium"
        open={surface === "details" && !!active}
        onOpenChange={(_, data) => {
          if (!data.open) closeSurface();
        }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss20Regular />}
                aria-label="Close details"
                onClick={closeSurface}
              />
            }
          >
            Details
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {active && (
            <div className="sp-library-details">
              <div className="sp-library-detail-title">
                <DocumentIcon name={active.name} />
                <h3>{active.name}</h3>
              </div>
              {active.summary && <p>{active.summary}</p>}
              <div className="sp-library-detail-actions">
                <Button appearance="primary" onClick={() => openFile(active)}>
                  Open document
                </Button>
                <Button
                  icon={<History20Regular />}
                  onClick={() => showFile(active, "versions")}
                >
                  Version history
                </Button>
              </div>
              <div className="sp-library-properties-heading">
                <h4>Properties</h4>
                {!readOnly && (
                  <Button
                    appearance="subtle"
                    size="small"
                    onClick={() => beginEdit(active)}
                  >
                    Edit all
                  </Button>
                )}
              </div>
              <dl>
                {documentProperties(active, definition).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              {readOnly && (
                <p className="sp-library-muted">Read-only library</p>
              )}
            </div>
          )}
        </DrawerBody>
      </Drawer>
      <Dialog
        open={surface !== null && surface !== "details"}
        onOpenChange={(_, data) => {
          if (!data.open) closeSurface();
        }}
      >
        <DialogSurface
          className={
            surface === "preview" ? "sp-library-preview-surface" : undefined
          }
        >
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  icon={<Dismiss20Regular />}
                  aria-label={
                    surface === "preview"
                      ? "Close document preview"
                      : "Close library dialog"
                  }
                  onClick={closeSurface}
                />
              }
            >
              {surface === "versions"
                ? "Version history"
                : surface === "new"
                  ? "New item"
                  : surface === "upload"
                    ? "Upload file"
                    : surface === "edit"
                      ? "Edit properties"
                      : "Document preview"}
            </DialogTitle>
            <DialogContent>
              {surface === "preview" && active && (
                <div className="sp-library-preview">
                  <p className="sp-library-preview-label">
                    {title} / {active.folder || "Documents"}
                  </p>
                  <article className="sp-library-paper">
                    <DocumentIcon name={active.name} />
                    <h2>{active.name}</h2>
                    <p>
                      {active.summary ??
                        `Working information for ${active.folder || title}.`}
                    </p>
                    <dl>
                      {documentProperties(active, definition).map(
                        ([key, value]) => (
                          <div key={key}>
                            <dt>{key}</dt>
                            <dd>{value}</dd>
                          </div>
                        ),
                      )}
                    </dl>
                  </article>
                </div>
              )}
              {surface === "versions" && active && (
                <>
                  <p className="sp-library-dialog-filename">{active.name}</p>
                  <ol className="sp-library-versions">
                    {documentVersions(active).map((version) => (
                      <li key={version.version}>
                        <strong>{version.version}</strong>
                        <div>
                          <span>
                            {version.note}
                            {version.current ? " · Current version" : ""}
                          </span>
                          <small>
                            {version.date} · {version.author}
                          </small>
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              )}
              {(surface === "new" || surface === "upload") && (
                <div className="sp-library-form">
                  <p className="sp-library-muted">
                    {title}
                    {folder ? ` / ${folder}` : ""}
                  </p>
                  {surface === "new" ? (
                    <>
                      <label>
                        Item type
                        <select
                          value={newKind}
                          onChange={(event) => {
                            const kind = event.target.value;
                            const type = definition?.contentTypes?.find(
                              (item) => item.id === kind,
                            );
                            setNewKind(kind);
                            setNewMetadata(contentTypeDefaults(type).metadata);
                          }}
                        >
                          <option>Document</option>
                          {(definition?.contentTypes ?? [])
                            .filter(
                              (type) =>
                                type.id !== "Document" &&
                                type.name !== "Document",
                            )
                            .map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.name}
                              </option>
                            ))}
                          <option>Folder</option>
                        </select>
                      </label>
                      {selectedType?.template && (
                        <p className="sp-library-template-cue">
                          {selectedType.template}
                        </p>
                      )}
                      <label>
                        {newKind === "Folder" ? "Folder name" : "Document name"}
                        <Input
                          value={newName}
                          onChange={(_, data) => setNewName(data.value)}
                          placeholder={
                            newKind === "Folder"
                              ? "New folder"
                              : "Document name.docx"
                          }
                        />
                      </label>
                      {newKind !== "Folder" &&
                        metadataFields(selectedType?.fields).map((field) =>
                          metadataInput(field, newMetadata, setNewMetadata),
                        )}
                    </>
                  ) : (
                    <label>
                      Choose a file
                      <input
                        type="file"
                        aria-label="Choose file to upload"
                        onChange={(event) =>
                          setUploadName(event.target.files?.[0]?.name ?? "")
                        }
                      />
                    </label>
                  )}
                  {surface === "upload" &&
                    metadataFields().map((field) =>
                      metadataInput(field, newMetadata, setNewMetadata),
                    )}
                  {formError && (
                    <p className="sp-library-form-error" role="alert">
                      {formError}
                    </p>
                  )}
                </div>
              )}
              {surface === "edit" && active && (
                <div className="sp-library-form">
                  <label>
                    File name
                    <Input
                      value={editName}
                      onChange={(_, data) => setEditName(data.value)}
                    />
                  </label>
                  {!!definition?.contentTypes?.length && (
                    <label>
                      Content type
                      <select
                        value={editContentType}
                        onChange={(event) =>
                          setEditContentType(event.target.value)
                        }
                      >
                        <option>Document</option>
                        {definition.contentTypes
                          .filter(
                            (type) =>
                              type.id !== "Document" &&
                              type.name !== "Document",
                          )
                          .map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  )}
                  <label>
                    Modified by
                    <Input
                      value={editOwner}
                      onChange={(_, data) => setEditOwner(data.value)}
                    />
                  </label>
                  <label>
                    Status
                    <select
                      value={editStatus}
                      onChange={(event) => setEditStatus(event.target.value)}
                    >
                      {statuses.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  {metadataFields(editingType?.fields).map((field) =>
                    metadataInput(field, editMetadata, setEditMetadata),
                  )}
                  {formError && (
                    <p className="sp-library-form-error" role="alert">
                      {formError}
                    </p>
                  )}
                </div>
              )}
            </DialogContent>
            <DialogActions>
              {surface === "preview" && active && (
                <>
                  <Button onClick={() => showFile(active, "details")}>
                    Details
                  </Button>
                  <Button
                    icon={<History20Regular />}
                    onClick={() => showFile(active, "versions")}
                  >
                    Version history
                  </Button>
                </>
              )}
              {(surface === "new" || surface === "upload") && (
                <Button appearance="primary" onClick={addItem}>
                  {surface === "upload" ? "Add file" : "Create"}
                </Button>
              )}
              {surface === "edit" && (
                <Button appearance="primary" onClick={saveEdit}>
                  Save
                </Button>
              )}
              <Button onClick={closeSurface}>
                {surface === "new" || surface === "upload" || surface === "edit"
                  ? "Cancel"
                  : "Close"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </section>
  );
}
