import { useId, useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerHeaderTitle,
  Input,
  Select,
  Textarea,
} from "@fluentui/react-components";
import { ArrowLeft20Regular, Dismiss20Regular } from "@fluentui/react-icons";
import {
  sensitivityLabels,
  isSensitivityLabel,
  type SensitivityLabel,
} from "../sharepoint/sensitivity";
import type { SiteAdminModel, AdminContent } from "./model";
import { getSiteAdminModel } from "./model";
import { previewRoles } from "../access/policy";
import { useTranslation } from "../i18n/Language";
import "./library-administration.css";

interface LibraryPreviewSettings {
  name: string;
  description: string;
  defaultSensitivity: SensitivityLabel | "";
  versionMode: "major" | "major-minor";
  limitMode: "automatic" | "manual";
  majorVersions: number;
  expirationDays: number;
  contentApproval: boolean;
  draftReaders: "readers" | "editors" | "approvers";
  requireCheckout: boolean;
  allowContentTypes: boolean;
  allowFolders: boolean;
  openInBrowser: boolean;
  requiredColumns: Record<string, boolean>;
  viewColumns: Record<string, string[]>;
}
type SettingsArea =
  | "overview"
  | "general"
  | "versioning"
  | "permissions"
  | "advanced"
  | "column"
  | "view"
  | "type";
interface LibraryAdministrationProps {
  site: SiteAdminModel;
  content: AdminContent;
  onBack: () => void;
  onClose: () => void;
  onMessage: (message: string) => void;
}

const storageKey = (siteId: string, contentId: string) =>
  `library-administration-preview:${siteId}:${contentId}`;
const defaults = (content: AdminContent): LibraryPreviewSettings => ({
  name: content.name,
  description: content.description || "",
  defaultSensitivity: content.definition?.defaultSensitivity || "",
  versionMode: "major",
  limitMode: "manual",
  majorVersions: 500,
  expirationDays: 0,
  contentApproval: false,
  draftReaders: "readers",
  requireCheckout: false,
  allowContentTypes: !!content.definition?.contentTypes?.length,
  allowFolders: content.kind === "library",
  openInBrowser: true,
  requiredColumns: {},
  viewColumns: {},
});

/** Read only preview configuration; never hydrate file records or business access. */
export function readLibraryPreview(
  siteId: string,
  content: AdminContent,
): LibraryPreviewSettings {
  const initial = defaults(content);
  try {
    const saved: unknown = JSON.parse(
      sessionStorage.getItem(storageKey(siteId, content.id)) || "null",
    );
    if (!saved || typeof saved !== "object") return initial;
    const value = saved as Partial<LibraryPreviewSettings>;
    return {
      ...initial,
      name:
        typeof value.name === "string" && value.name.trim()
          ? value.name
          : initial.name,
      description:
        typeof value.description === "string"
          ? value.description
          : initial.description,
      defaultSensitivity:
        content.definition?.defaultSensitivity &&
        (value.defaultSensitivity === "" ||
          isSensitivityLabel(value.defaultSensitivity))
          ? value.defaultSensitivity
          : initial.defaultSensitivity,
      versionMode:
        value.versionMode === "major-minor" && content.kind === "library"
          ? "major-minor"
          : "major",
      limitMode:
        content.kind === "library" && value.limitMode === "automatic"
          ? "automatic"
          : "manual",
      majorVersions:
        typeof value.majorVersions === "number" &&
        value.majorVersions >= (content.kind === "library" ? 100 : 1) &&
        value.majorVersions <= 50000
          ? Math.floor(value.majorVersions)
          : initial.majorVersions,
      expirationDays:
        content.kind === "library" &&
        typeof value.expirationDays === "number" &&
        (value.expirationDays === 0 || value.expirationDays >= 30)
          ? Math.floor(value.expirationDays)
          : initial.expirationDays,
      contentApproval: value.contentApproval === true,
      draftReaders:
        value.draftReaders === "editors" || value.draftReaders === "approvers"
          ? value.draftReaders
          : "readers",
      requireCheckout:
        content.kind === "library" && value.requireCheckout === true,
      allowContentTypes:
        typeof value.allowContentTypes === "boolean"
          ? value.allowContentTypes
          : initial.allowContentTypes,
      allowFolders:
        typeof value.allowFolders === "boolean"
          ? value.allowFolders
          : initial.allowFolders,
      openInBrowser: value.openInBrowser !== false,
      requiredColumns: Object.fromEntries(
        content.columns
          .filter(
            (column) =>
              typeof value.requiredColumns?.[column.key] === "boolean",
          )
          .map((column) => [column.key, value.requiredColumns![column.key]]),
      ),
      viewColumns: Object.fromEntries(
        content.views
          .filter((view) => Array.isArray(value.viewColumns?.[view.id]))
          .map((view) => [
            view.id,
            value.viewColumns![view.id].filter((key) =>
              content.columns.some((column) => column.key === key),
            ),
          ]),
      ),
    };
  } catch {
    return initial;
  }
}

export function validateLibraryPreview(
  value: LibraryPreviewSettings,
  kind: AdminContent["kind"] = "library",
): string {
  if (!value.name.trim()) return "Enter a name.";
  if (
    value.limitMode === "manual" &&
    (!Number.isInteger(value.majorVersions) ||
      value.majorVersions < (kind === "library" ? 100 : 1) ||
      value.majorVersions > 50000)
  )
    return kind === "library"
      ? "Enter a version limit between 100 and 50,000."
      : "Enter a version limit between 1 and 50,000.";
  if (
    kind === "library" &&
    value.limitMode === "manual" &&
    value.expirationDays !== 0 &&
    (!Number.isInteger(value.expirationDays) || value.expirationDays < 30)
  )
    return "Enter an expiration of at least 30 days, or select Never.";
  return "";
}

export default function LibraryAdministration(
  props: LibraryAdministrationProps,
) {
  if (
    !props.site.canManage ||
    props.content.kind === "page" ||
    !props.site.contents.some((item) => item.id === props.content.id)
  )
    return null;
  return (
    <LibraryAdministrationView
      key={`${props.site.id}:${props.content.id}`}
      {...props}
    />
  );
}

function LibraryAdministrationView({
  site,
  content,
  onBack,
  onClose,
  onMessage,
}: LibraryAdministrationProps) {
  const formId = useId();
  const { t } = useTranslation();
  const [saved, setSaved] = useState(() => {
    const value = readLibraryPreview(site.id, content);
    return { ...value, name: t(value.name), description: t(value.description) };
  });
  const [draft, setDraft] = useState(saved);
  const [moreOpen, setMoreOpen] = useState(content.kind === "list");
  const [area, setArea] = useState<SettingsArea>("overview");
  const [selection, setSelection] = useState("");
  const [error, setError] = useState("");
  const [permissionsDetails, setPermissionsDetails] = useState(false);
  const [checkPermissions, setCheckPermissions] = useState(false);
  const [checkedRole, setCheckedRole] = useState("");
  const isLibrary = content.kind === "library";
  const title = isLibrary ? "Library settings" : "List settings";
  const types = content.definition?.contentTypes || [];
  const selectedColumn = content.columns.find(
    (column) => column.key === selection,
  );
  const selectedView = content.views.find((view) => view.id === selection);
  const selectedType = types.find((type) => type.id === selection);
  const update = <K extends keyof LibraryPreviewSettings>(
    key: K,
    value: LibraryPreviewSettings[K],
  ) => setDraft({ ...draft, [key]: value });
  function chooseArea(next: SettingsArea, id = "") {
    setArea(next);
    setSelection(id);
    setError("");
    setPermissionsDetails(false);
    setCheckPermissions(false);
    setCheckedRole("");
  }
  function save(close = false) {
    const invalid = validateLibraryPreview(draft, content.kind);
    if (invalid) {
      setError(invalid);
      return;
    }
    try {
      sessionStorage.setItem(
        storageKey(site.id, content.id),
        JSON.stringify(draft),
      );
    } catch {
      /* Local state remains usable without storage. */
    }
    setSaved(draft);
    setError("");
    onMessage(
      isLibrary
        ? "Library settings saved for this preview."
        : "List settings saved for this preview.",
    );
    if (close) onClose();
    else chooseArea("overview");
  }
  function closeFullSettings() {
    setDraft(saved);
    setError("");
    chooseArea("overview");
    if (!isLibrary) onClose();
    else setMoreOpen(false);
  }
  const textFields = (
    <>
      <label className="admin-library-field">
        Name
        <Input
          aria-label="Name"
          required
          value={draft.name}
          onChange={(_, data) => update("name", data.value)}
        />
      </label>
      <label className="admin-library-field">
        Description
        <Textarea
          aria-label="Description"
          resize="vertical"
          value={draft.description}
          onChange={(_, data) => update("description", data.value)}
        />
      </label>
    </>
  );
  const editable = [
    "general",
    "versioning",
    "advanced",
    "column",
    "view",
  ].includes(area);
  return (
    <>
      <DrawerHeader className="admin-library-header">
        <div className="admin-library-heading-actions">
          <Button
            appearance="subtle"
            icon={<ArrowLeft20Regular />}
            onClick={onBack}
          >
            Settings
          </Button>
        </div>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label={
                isLibrary ? "Close library settings" : "Close list settings"
              }
              icon={<Dismiss20Regular />}
              onClick={onClose}
            />
          }
        >
          {title}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        <p className="admin-library-context">
          {site.title} / {content.name}
        </p>
        <form
          className="admin-library-form"
          id={formId}
          onSubmit={(event) => {
            event.preventDefault();
            save(true);
          }}
        >
          {textFields}
          {isLibrary && content.definition?.defaultSensitivity && (
            <label className="admin-library-field">
              Default sensitivity labels
              <Select
                aria-label="Default sensitivity labels"
                value={draft.defaultSensitivity}
                onChange={(event) =>
                  update(
                    "defaultSensitivity",
                    event.target.value as SensitivityLabel | "",
                  )
                }
              >
                <option value="">None</option>
                {sensitivityLabels.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </Select>
              <span className="admin-library-hint">
                Applies to new or edited files. Existing files are not
                relabelled in this preview.
              </span>
            </label>
          )}
          {error && (
            <p className="admin-library-error" role="alert">
              {error}
            </p>
          )}
        </form>
        <Button
          appearance="transparent"
          className="admin-library-more"
          onClick={() => {
            setMoreOpen(true);
            chooseArea("overview");
          }}
        >
          More library settings
        </Button>
      </DrawerBody>
      <DrawerFooter className="admin-library-footer">
        <Button appearance="primary" type="submit" form={formId}>
          Save
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DrawerFooter>
      <Dialog
        open={moreOpen}
        onOpenChange={(_, data) => {
          if (!data.open) closeFullSettings();
        }}
      >
        <DialogSurface
          className="admin-library-settings-dialog"
          data-content-id={content.id}
        >
          <DialogBody>
            <DialogTitle className="admin-library-dialog-title">
              {draft.name}: {title}
            </DialogTitle>
            <DialogContent className="admin-library-dialog-content">
              {area !== "overview" && (
                <Button
                  appearance="transparent"
                  icon={<ArrowLeft20Regular />}
                  onClick={() => chooseArea("overview")}
                >
                  Back to settings
                </Button>
              )}
              {area === "overview" ? (
                <div className="admin-library-overview">
                  <section className="admin-library-section">
                    <h3>General Settings</h3>
                    <ul>
                      <li>
                        <button
                          className="admin-library-settings-link"
                          onClick={() => chooseArea("general")}
                        >
                          Name and description
                        </button>
                      </li>
                      <li>
                        <button
                          className="admin-library-settings-link"
                          onClick={() => chooseArea("versioning")}
                        >
                          Versioning settings
                        </button>
                      </li>
                      <li>
                        <button
                          className="admin-library-settings-link"
                          onClick={() => chooseArea("advanced")}
                        >
                          Advanced settings
                        </button>
                      </li>
                    </ul>
                  </section>
                  <section className="admin-library-section">
                    <h3>Permissions and Management</h3>
                    <button
                      className="admin-library-settings-link"
                      onClick={() => chooseArea("permissions")}
                    >
                      {isLibrary
                        ? "Permissions for this document library"
                        : "Permissions for this list"}
                    </button>
                  </section>
                  <section className="admin-library-section">
                    <h3>Columns</h3>
                    <ul>
                      {content.columns.map((column) => (
                        <li key={column.key}>
                          <button
                            className="admin-library-settings-link"
                            onClick={() => chooseArea("column", column.key)}
                          >
                            {column.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section className="admin-library-section">
                    <h3>Views</h3>
                    <ul>
                      {content.views.map((view) => (
                        <li key={view.id}>
                          <button
                            className="admin-library-settings-link"
                            onClick={() => chooseArea("view", view.id)}
                          >
                            {view.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                  {!!types.length && draft.allowContentTypes && (
                    <section className="admin-library-section">
                      <h3>Content types</h3>
                      <ul>
                        {types.map((type) => (
                          <li key={type.id}>
                            <button
                              className="admin-library-settings-link"
                              onClick={() => chooseArea("type", type.id)}
                            >
                              {type.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              ) : (
                <div className="admin-library-editor">
                  {area === "general" && (
                    <>
                      <h3>Name and description</h3>
                      <div className="admin-library-form">{textFields}</div>
                    </>
                  )}
                  {area === "versioning" && (
                    <>
                      <h3>Versioning settings</h3>
                      <div className="admin-library-form">
                        <label className="admin-library-field">
                          Require content approval
                          <Select
                            aria-label="Require content approval"
                            value={String(draft.contentApproval)}
                            onChange={(event) =>
                              update(
                                "contentApproval",
                                event.target.value === "true",
                              )
                            }
                          >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                          </Select>
                        </label>
                        {isLibrary ? (
                          <label className="admin-library-field">
                            Document Version History
                            <Select
                              aria-label="Document Version History"
                              value={draft.versionMode}
                              onChange={(event) =>
                                update(
                                  "versionMode",
                                  event.target
                                    .value as LibraryPreviewSettings["versionMode"],
                                )
                              }
                            >
                              <option value="major">
                                Create major versions
                              </option>
                              <option value="major-minor">
                                Create major and minor (draft) versions
                              </option>
                            </Select>
                          </label>
                        ) : (
                          <p>
                            Create a version each time you edit an item in this
                            list.
                          </p>
                        )}
                        {isLibrary && (
                          <label className="admin-library-field">
                            Version history limits
                            <Select
                              aria-label="Version history limits"
                              value={draft.limitMode}
                              onChange={(event) =>
                                update(
                                  "limitMode",
                                  event.target
                                    .value as LibraryPreviewSettings["limitMode"],
                                )
                              }
                            >
                              <option value="automatic">Automatic</option>
                              <option value="manual">Manual</option>
                            </Select>
                          </label>
                        )}
                        {(!isLibrary || draft.limitMode === "manual") && (
                          <>
                            <label className="admin-library-field">
                              {isLibrary
                                ? "Number of major versions to keep"
                                : "Number of versions to keep"}
                              <Input
                                aria-label={
                                  isLibrary
                                    ? "Number of major versions to keep"
                                    : "Number of versions to keep"
                                }
                                type="number"
                                min={isLibrary ? 100 : 1}
                                max={50000}
                                value={String(draft.majorVersions)}
                                onChange={(_, data) =>
                                  update("majorVersions", Number(data.value))
                                }
                              />
                            </label>
                            {isLibrary && (
                              <label className="admin-library-field">
                                Delete versions after this period
                                <Select
                                  aria-label="Delete versions after this period"
                                  value={
                                    draft.expirationDays === 0
                                      ? "never"
                                      : "days"
                                  }
                                  onChange={(event) =>
                                    update(
                                      "expirationDays",
                                      event.target.value === "never" ? 0 : 365,
                                    )
                                  }
                                >
                                  <option value="never">Never</option>
                                  <option value="days">
                                    A specified number of days
                                  </option>
                                </Select>
                              </label>
                            )}
                            {isLibrary && draft.expirationDays !== 0 && (
                              <label className="admin-library-field">
                                Days
                                <Input
                                  aria-label="Days"
                                  type="number"
                                  min={30}
                                  value={String(draft.expirationDays)}
                                  onChange={(_, data) =>
                                    update("expirationDays", Number(data.value))
                                  }
                                />
                              </label>
                            )}
                          </>
                        )}
                        {(draft.contentApproval ||
                          (isLibrary &&
                            draft.versionMode === "major-minor")) && (
                          <label className="admin-library-field">
                            Who should see draft items?
                            <Select
                              aria-label="Who should see draft items?"
                              value={draft.draftReaders}
                              onChange={(event) =>
                                update(
                                  "draftReaders",
                                  event.target
                                    .value as LibraryPreviewSettings["draftReaders"],
                                )
                              }
                            >
                              <option value="readers">
                                Any user who can read items
                              </option>
                              <option value="editors">
                                Only users who can edit items
                              </option>
                              <option value="approvers">
                                Only users who can approve items (and the
                                author)
                              </option>
                            </Select>
                          </label>
                        )}
                        {isLibrary && (
                          <label className="admin-library-field">
                            Require documents to be checked out before they can
                            be edited?
                            <Select
                              aria-label="Require documents to be checked out before they can be edited?"
                              value={String(draft.requireCheckout)}
                              onChange={(event) =>
                                update(
                                  "requireCheckout",
                                  event.target.value === "true",
                                )
                              }
                            >
                              <option value="false">No</option>
                              <option value="true">Yes</option>
                            </Select>
                            {draft.requireCheckout && (
                              <span className="admin-library-hint">
                                Required check out prevents simultaneous
                                editing.
                              </span>
                            )}
                          </label>
                        )}
                      </div>
                    </>
                  )}
                  {area === "permissions" && (
                    <>
                      <h3>
                        {isLibrary
                          ? "Permissions for this document library"
                          : "Permissions for this list"}
                      </h3>
                      <p>
                        {content.permissionMode === "inherited"
                          ? "Inherits permissions from this site"
                          : "Unique permissions"}
                      </p>
                      <p>{site.title}</p>
                      <button
                        className="admin-library-settings-link"
                        aria-expanded={permissionsDetails}
                        onClick={() =>
                          setPermissionsDetails(!permissionsDetails)
                        }
                      >
                        {content.permissionMode === "inherited"
                          ? "View inherited permissions"
                          : "View permission details"}
                      </button>
                      {permissionsDetails &&
                        (content.permissionMode === "inherited" ? (
                          <table className="admin-library-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Permission levels</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                ["Owners", "Full Control"],
                                ["Members", "Edit"],
                                ["Visitors", "Read"],
                              ].map(([name, level]) => (
                                <tr key={name}>
                                  <td>
                                    {site.title} {name}
                                  </td>
                                  <td>{level}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p>
                            Access to this area is managed separately from the
                            site's groups.
                          </p>
                        ))}
                      <p>
                        <button
                          className="admin-library-settings-link"
                          aria-expanded={checkPermissions}
                          onClick={() => setCheckPermissions(!checkPermissions)}
                        >
                          Check Permissions
                        </button>
                      </p>
                      {checkPermissions && (
                        <label className="admin-library-field">
                          Check permissions for
                          <Select
                            aria-label="Check permissions for"
                            value={checkedRole}
                            onChange={(event) =>
                              setCheckedRole(event.target.value)
                            }
                          >
                            <option value="">Select a colleague</option>
                            {previewRoles.map((person) => (
                              <option key={person.id} value={person.id}>
                                {person.name}
                              </option>
                            ))}
                          </Select>
                        </label>
                      )}
                      {checkPermissions &&
                        checkedRole &&
                        (() => {
                          const target = new URL(
                            content.href,
                            "https://workspace.invalid",
                          );
                          const permitted = getSiteAdminModel(
                            checkedRole,
                            target.pathname,
                            target.search,
                          )?.contents.some((item) => item.id === content.id);
                          return (
                            <p role="status">
                              {
                                previewRoles.find(
                                  (person) => person.id === checkedRole,
                                )?.name
                              }
                              :{" "}
                              {permitted
                                ? "Access available"
                                : "Access required"}
                            </p>
                          );
                        })()}
                      <p className="admin-library-hint">
                        Access remains controlled by the site's groups and
                        separately authorised areas. This preview does not grant
                        access.
                      </p>
                    </>
                  )}
                  {area === "advanced" && (
                    <>
                      <h3>Advanced settings</h3>
                      <div className="admin-library-form">
                        <label className="admin-library-field">
                          Allow management of content types?
                          <Select
                            aria-label="Allow management of content types?"
                            value={String(draft.allowContentTypes)}
                            onChange={(event) =>
                              update(
                                "allowContentTypes",
                                event.target.value === "true",
                              )
                            }
                          >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                          </Select>
                        </label>
                        <label className="admin-library-field">
                          Make the New Folder command available?
                          <Select
                            aria-label="Make the New Folder command available?"
                            value={String(draft.allowFolders)}
                            onChange={(event) =>
                              update(
                                "allowFolders",
                                event.target.value === "true",
                              )
                            }
                          >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                          </Select>
                        </label>
                        {isLibrary && (
                          <label className="admin-library-field">
                            Opening Documents in the Browser
                            <Select
                              aria-label="Opening Documents in the Browser"
                              value={
                                draft.openInBrowser ? "browser" : "application"
                              }
                              onChange={(event) =>
                                update(
                                  "openInBrowser",
                                  event.target.value === "browser",
                                )
                              }
                            >
                              <option value="browser">
                                Open in the browser
                              </option>
                              <option value="application">
                                Open in the client application
                              </option>
                            </Select>
                          </label>
                        )}
                      </div>
                    </>
                  )}
                  {area === "column" && selectedColumn && (
                    <>
                      <h3>{selectedColumn.label}</h3>
                      <dl className="admin-library-properties">
                        <dt>Column name</dt>
                        <dd>{selectedColumn.label}</dd>
                        <dt>Type</dt>
                        <dd>
                          {selectedColumn.key === "sensitivity"
                            ? "Sensitivity label"
                            : selectedColumn.type === "choice" ||
                                selectedColumn.choices
                              ? "Choice"
                              : selectedColumn.type === "date"
                                ? "Date and time"
                                : "Single line of text"}
                        </dd>
                      </dl>
                      {selectedColumn.key === "sensitivity" && (
                        <p className="admin-library-hint">
                          This built-in file property is read-only here. Manage
                          the default label in Library settings where available.
                        </p>
                      )}
                      {selectedColumn.key !== "sensitivity" && (
                        <label className="admin-library-field">
                          Require that this column contains information
                          <Select
                            aria-label="Require that this column contains information"
                            value={String(
                              draft.requiredColumns[selectedColumn.key] ??
                                !!selectedColumn.required,
                            )}
                            onChange={(event) =>
                              update("requiredColumns", {
                                ...draft.requiredColumns,
                                [selectedColumn.key]:
                                  event.target.value === "true",
                              })
                            }
                          >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                          </Select>
                        </label>
                      )}
                      {!!selectedColumn.choices?.length && (
                        <>
                          <h4>Choices</h4>
                          <ul>
                            {selectedColumn.choices.map((choice) => (
                              <li key={choice}>{choice}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </>
                  )}
                  {area === "view" && selectedView && (
                    <>
                      <h3>{selectedView.name}</h3>
                      <p>Choose the columns to show in this view.</p>
                      <div className="admin-library-form">
                        {content.columns.map((column) => (
                          <Checkbox
                            key={column.key}
                            label={column.label}
                            checked={(
                              draft.viewColumns[selectedView.id] ||
                              selectedView.columns ||
                              content.columns.map((item) => item.key)
                            ).includes(column.key)}
                            onChange={(_, data) => {
                              const current =
                                draft.viewColumns[selectedView.id] ||
                                selectedView.columns ||
                                content.columns.map((item) => item.key);
                              update("viewColumns", {
                                ...draft.viewColumns,
                                [selectedView.id]: data.checked
                                  ? [...current, column.key]
                                  : current.filter((key) => key !== column.key),
                              });
                            }}
                          />
                        ))}
                      </div>
                      {!!selectedView.filters?.length && (
                        <>
                          <h4>Filter</h4>
                          <ul>
                            {selectedView.filters.map((filter, index) => (
                              <li key={index}>
                                {content.columns.find(
                                  (column) => column.key === filter.field,
                                )?.label || filter.field}
                                :{" "}
                                {Array.isArray(filter.value)
                                  ? filter.value.join(", ")
                                  : filter.value}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </>
                  )}
                  {area === "type" && selectedType && (
                    <>
                      <h3>{selectedType.name}</h3>
                      <dl className="admin-library-properties">
                        <dt>Content type</dt>
                        <dd>{selectedType.name}</dd>
                        {selectedType.template && (
                          <>
                            <dt>Document template</dt>
                            <dd>{selectedType.template}</dd>
                          </>
                        )}
                      </dl>
                      <h4>Columns</h4>
                      <ul>
                        {(selectedType.fields || []).map((key) => (
                          <li key={key}>
                            {content.columns.find(
                              (column) => column.key === key,
                            )?.label || key}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {error && (
                    <p className="admin-library-error" role="alert">
                      {error}
                    </p>
                  )}
                </div>
              )}
              <p className="admin-library-hint">
                Changes are saved in this browser session.
              </p>
            </DialogContent>
            <DialogActions>
              {editable && (
                <Button appearance="primary" onClick={() => save()}>
                  OK
                </Button>
              )}
              <Button
                onClick={
                  area === "overview"
                    ? closeFullSettings
                    : () => {
                        setDraft(saved);
                        chooseArea("overview");
                      }
                }
              >
                {area === "overview" ? "Close" : "Cancel"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
