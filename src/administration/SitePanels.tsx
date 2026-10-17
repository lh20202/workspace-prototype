import { useState } from "react";
import {
  Button,
  Checkbox,
  Input,
  Select,
  Textarea,
} from "@fluentui/react-components";
import { ChevronRight20Regular } from "@fluentui/react-icons";
import StaffLink from "../components/StaffLink";
import WorkspaceIcon from "../components/WorkspaceIcon";
import { previewRoles } from "../access/policy";
import { useTranslation } from "../i18n/Language";
import { withExplicitStaff } from "../utils/staffNavigation";
import { getSiteAdminModel, type SiteAdminModel } from "./model";

export type SiteSurface =
  | "settings"
  | "information"
  | "permissions"
  | "appearance"
  | "templates"
  | "contents"
  | "usage"
  | "advanced"
  | "site-columns"
  | "site-types"
  | "navigation"
  | "regional";
export const siteSurfaceTitles: Record<SiteSurface, string> = {
  settings: "Settings",
  information: "Site information",
  permissions: "Site permissions",
  appearance: "Change the look",
  templates: "Apply a site template",
  contents: "Site contents",
  usage: "Site usage",
  advanced: "Site settings",
  "site-columns": "Site columns",
  "site-types": "Site content types",
  navigation: "Navigation",
  regional: "Regional settings",
};

function savedValue<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(sessionStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function savePreview(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Preview also works without storage. */
  }
}
interface SitePanelProps {
  site: SiteAdminModel;
  onSurface: (surface: SiteSurface) => void;
  onClose: () => void;
  onMessage: (message: string) => void;
}
function PreviewActions({
  onSave,
  onClose,
}: {
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="site-admin-actions">
      <Button appearance="primary" onClick={onSave}>
        Save
      </Button>
      <Button onClick={onClose}>Cancel</Button>
    </div>
  );
}

export function SiteInformation({
  site,
  onSurface,
  onClose,
  onMessage,
}: SitePanelProps) {
  const { t } = useTranslation();
  const storageKey = `site-information-preview:${site.id}`;
  const [value, setValue] = useState(() =>
    savedValue(storageKey, {
      name: t(site.title),
      description: t(site.description),
      privacy: "private",
    }),
  );
  return (
    <>
      <label className="site-admin-field">
        <span>
          Site name <span aria-hidden="true">*</span>
        </span>
        <Input
          aria-label="Site name"
          required
          value={value.name}
          onChange={(_, data) => setValue({ ...value, name: data.value })}
        />
      </label>
      <label className="site-admin-field">
        Site description
        <Textarea
          aria-label="Site description"
          resize="vertical"
          value={value.description}
          onChange={(_, data) =>
            setValue({ ...value, description: data.value })
          }
        />
      </label>
      <label className="site-admin-field">
        Hub site association
        <Select
          aria-label="Hub site association"
          value={site.hubId || "none"}
          disabled
        >
          <option value={site.hubId || "none"}>{site.hubName || "None"}</option>
        </Select>
      </label>
      <p className="site-admin-secondary">
        Hub association is managed separately.
      </p>
      <label className="site-admin-field">
        Privacy settings
        <Select
          aria-label="Privacy settings"
          value={value.privacy}
          onChange={(event) =>
            setValue({ ...value, privacy: event.target.value })
          }
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
        </Select>
      </label>
      <p className="site-admin-secondary">
        Privacy preview only. Access is not changed.
      </p>
      <button
        className="site-admin-text-link"
        onClick={() => onSurface("advanced")}
      >
        View all site settings
      </button>
      <p className="site-admin-secondary">
        Changes are saved in this browser session.
      </p>
      <PreviewActions
        onClose={onClose}
        onSave={() => {
          if (!value.name.trim()) return;
          savePreview(storageKey, value);
          onMessage("Site information saved for this preview.");
          onClose();
        }}
      />
    </>
  );
}

export function SitePermissions({ site, onClose, onMessage }: SitePanelProps) {
  const [advanced, setAdvanced] = useState(false);
  const [selected, setSelected] = useState("");
  const [adding, setAdding] = useState(false);
  const [candidate, setCandidate] = useState("");
  const [additions, setAdditions] = useState<string[]>([]);
  const participants = previewRoles.map((person) => ({
    person,
    access: getSiteAdminModel(person, site.href, ""),
  }));
  const owners = participants
    .filter(({ access }) => access?.canManage)
    .map(({ person }) => person);
  const members = previewRoles.filter(
    (person) =>
      participants.find((item) => item.person.id === person.id)?.access
        ?.canAccess && !owners.some((owner) => owner.id === person.id),
  );
  const groups = [
    { name: "Owners", level: "Full Control", people: owners },
    { name: "Members", level: "Edit", people: members },
    { name: "Visitors", level: "Read", people: [] },
  ];
  return (
    <>
      <p className="site-admin-secondary">
        Manage access through site groups. Restricted areas keep their separate
        access requirements.
      </p>
      {!advanced && (
        <Button appearance="primary" onClick={() => setAdding(!adding)}>
          Add members
        </Button>
      )}
      {adding && (
        <div className="site-admin-inset">
          <label className="site-admin-field">
            Add members to group
            <Select
              aria-label="Preview colleague"
              value={candidate}
              onChange={(event) => setCandidate(event.target.value)}
            >
              <option value="">Select a colleague</option>
              {previewRoles
                .filter(
                  (person) =>
                    !participants.find((item) => item.person.id === person.id)
                      ?.access?.canAccess,
                )
                .map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
            </Select>
          </label>
          <p className="site-admin-secondary">
            Preview only. This does not grant access or send an invitation.
          </p>
          <Button
            disabled={!candidate}
            onClick={() => {
              setAdditions([...additions, candidate]);
              setAdding(false);
              onMessage(
                "Group membership preview updated. No access was granted.",
              );
            }}
          >
            Save preview
          </Button>
        </div>
      )}
      {advanced ? (
        <>
          <h3>Permissions</h3>
          <p>
            These groups apply to the site and to content that inherits from it.
          </p>
          <table className="site-admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Permission levels</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.name}>
                  <td>
                    {site.title} {group.name}
                  </td>
                  <td>Site group</td>
                  <td>{group.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button onClick={() => setAdvanced(false)}>
            Return to site permissions
          </Button>
        </>
      ) : (
        groups.map((group) => (
          <section className="site-admin-permission-group" key={group.name}>
            <button
              aria-expanded={selected === group.name}
              onClick={() =>
                setSelected(selected === group.name ? "" : group.name)
              }
            >
              <span>
                <strong>
                  {site.title} {group.name}
                </strong>
                <small>{group.level}</small>
              </span>
              <ChevronRight20Regular />
            </button>
            {selected === group.name && (
              <ul>
                {group.people.map((person) => (
                  <li key={person.id}>
                    {person.name}
                    <small>{person.role}</small>
                  </li>
                ))}
                {group.name === "Members" &&
                  additions.map((id, index) => (
                    <li key={`${id}-${index}`}>
                      {previewRoles.find((person) => person.id === id)?.name}
                      <small>Preview only</small>
                    </li>
                  ))}
                {!group.people.length && <li>No members in this group</li>}
              </ul>
            )}
          </section>
        ))
      )}
      {!advanced && (
        <button
          className="site-admin-text-link"
          onClick={() => setAdvanced(true)}
        >
          Advanced permissions settings
        </button>
      )}
      <div className="site-admin-actions">
        <Button onClick={onClose}>Close</Button>
      </div>
    </>
  );
}

export function SiteAppearance({
  site,
  onSurface,
  onClose,
  onMessage,
}: SitePanelProps) {
  const [section, setSection] = useState("");
  const [saved] = useState(() =>
    savedValue(`site-appearance-preview:${site.id}`, {
      theme: "Blue",
      header: "Compact",
      showTitle: true,
      logo: "",
    }),
  );
  const [theme, setTheme] = useState(saved.theme);
  const [header, setHeader] = useState(saved.header);
  const [navigation, setNavigation] = useState(() =>
    savedValue(`site-navigation-orientation:${site.id}`, "Vertical"),
  );
  const [showTitle, setShowTitle] = useState(saved.showTitle);
  const [logo, setLogo] = useState(saved.logo);
  if (section === "Navigation")
    return (
      <>
        <label className="site-admin-field">
          Navigation orientation
          <Select
            aria-label="Navigation orientation"
            value={navigation}
            onChange={(event) => setNavigation(event.target.value)}
          >
            <option value="Vertical">Vertical</option>
            <option value="Horizontal">Horizontal</option>
          </Select>
        </label>
        <button
          className="site-admin-text-link"
          onClick={() => onSurface("navigation")}
        >
          Edit navigation links
        </button>
        <p className="site-admin-secondary">
          Preview the arrangement before saving.
        </p>
        <div
          className={`site-admin-site-preview nav-${navigation.toLowerCase()}`}
        >
          <strong>{site.title}</strong>
          <span>Home</span>
          <span>
            {site.contents.find((content) => content.kind !== "page")?.name}
          </span>
        </div>
        <PreviewActions
          onClose={onClose}
          onSave={() => {
            savePreview(`site-navigation-orientation:${site.id}`, navigation);
            onMessage("Navigation saved for this preview.");
            onClose();
          }}
        />
      </>
    );
  return (
    <>
      {!section ? (
        ["Theme", "Header", "Navigation"].map((name) => (
          <button
            className="site-admin-menu-row"
            key={name}
            onClick={() => setSection(name)}
          >
            {name}
            <ChevronRight20Regular />
          </button>
        ))
      ) : (
        <>
          <button
            className="site-admin-text-link"
            onClick={() => setSection("")}
          >
            Back to appearance options
          </button>
          {section === "Theme" ? (
            <label className="site-admin-field">
              Theme
              <Select
                aria-label="Theme"
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
              >
                <option value="Blue">Blue</option>
                <option value="Teal">Teal</option>
                <option value="Purple">Purple</option>
                <option value="Red">Red</option>
              </Select>
            </label>
          ) : (
            <>
              <label className="site-admin-field">
                Layout
                <Select
                  aria-label="Header layout"
                  value={header}
                  onChange={(event) => setHeader(event.target.value)}
                >
                  {["Minimal", "Compact", "Standard", "Extended"].map(
                    (name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ),
                  )}
                </Select>
              </label>
              <Checkbox
                label="Show site title"
                checked={showTitle}
                onChange={(_, data) => setShowTitle(!!data.checked)}
              />
              <label className="site-admin-field">
                Site logo
                <input
                  type="file"
                  aria-label="Site logo"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setLogo(String(reader.result));
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </>
          )}
          <div
            className={`site-admin-site-preview theme-${theme.toLowerCase()} header-${header.toLowerCase()}`}
          >
            {logo ? (
              <img src={logo} alt="Site logo preview" width="28" height="28" />
            ) : (
              <WorkspaceIcon size={28} />
            )}
            {showTitle && <strong>{site.title}</strong>}
            <small>{header}</small>
          </div>
          <PreviewActions
            onClose={onClose}
            onSave={() => {
              savePreview(`site-appearance-preview:${site.id}`, {
                theme,
                header,
                showTitle,
                logo,
              });
              onMessage("Appearance saved for this preview.");
              onClose();
            }}
          />
        </>
      )}
    </>
  );
}

const templates = [
  {
    name: "Standard team",
    detail:
      "A shared starting point for team communication and working documents.",
  },
  {
    name: "Project management",
    detail: "Coordinate project status, tasks and key resources.",
  },
  {
    name: "Training course",
    detail: "Bring course information, learning resources and events together.",
  },
];
export function SiteTemplates({ site, onClose, onMessage }: SitePanelProps) {
  const [template, setTemplate] = useState<
    (typeof templates)[number] | undefined
  >();
  return (
    <>
      {template ? (
        <>
          <button
            className="site-admin-text-link"
            onClick={() => setTemplate(undefined)}
          >
            Back to templates
          </button>
          <h3>{template.name}</h3>
          <p>{template.detail}</p>
          <div className="site-admin-site-preview">
            <strong>{site.title}</strong>
            <span>{template.name}</span>
            <span>Home · Documents</span>
          </div>
          <p className="site-admin-secondary">
            Preview only. Existing pages, libraries and files are kept.
          </p>
          <div className="site-admin-actions">
            <Button
              appearance="primary"
              onClick={() => {
                savePreview(`site-template-preview:${site.id}`, template.name);
                onMessage(
                  "Template application simulated. Site content was not changed.",
                );
                onClose();
              }}
            >
              Use template (simulated)
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </div>
        </>
      ) : (
        <>
          <p>Choose a team site template to preview.</p>
          <div className="site-admin-template-gallery">
            {templates.map((item) => (
              <button
                className="site-admin-template"
                key={item.name}
                onClick={() => setTemplate(item)}
              >
                <span
                  className="site-admin-template-thumbnail"
                  aria-hidden="true"
                >
                  <i />
                  <i />
                  <i />
                </span>
                <strong>{item.name}</strong>
                <small>{item.detail}</small>
                <span>Preview</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export function SiteContents({ site }: { site: SiteAdminModel }) {
  return (
    <>
      <p className="site-admin-secondary">
        Libraries, lists and pages available in this site.
      </p>
      <table className="site-admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Items</th>
            <th>Modified</th>
          </tr>
        </thead>
        <tbody>
          {site.contents.map((content) => (
            <tr key={content.id}>
              <td>
                <StaffLink href={withExplicitStaff(content.href)}>
                  {content.name}
                </StaffLink>
              </td>
              <td>
                {content.kind === "library"
                  ? "Document library"
                  : content.kind === "list"
                    ? "List"
                    : "Page"}
              </td>
              <td>{content.kind === "page" ? "" : content.items}</td>
              <td>{content.modified || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function SiteAdvanced({ onSurface }: SitePanelProps) {
  return (
    <>
      {[
        ["Users and permissions", [["Site permissions", "permissions"]]],
        [
          "Web Designer Galleries",
          [
            ["Site columns", "site-columns"],
            ["Site content types", "site-types"],
          ],
        ],
        ["Look and Feel", [["Navigation", "navigation"]]],
        [
          "Site Administration",
          [
            ["Regional settings", "regional"],
            ["Site libraries and lists", "contents"],
          ],
        ],
      ].map(([title, entries]) => (
        <section className="site-admin-settings-section" key={title as string}>
          <h3>{title as string}</h3>
          {(entries as string[][]).map(([name, surface]) => (
            <button
              key={name}
              className="site-admin-text-link"
              onClick={() => onSurface(surface as SiteSurface)}
            >
              {name}
            </button>
          ))}
        </section>
      ))}
    </>
  );
}

export function SiteColumns({ site }: { site: SiteAdminModel }) {
  return (
    <>
      <p className="site-admin-secondary">
        Shared metadata used by the current site's libraries and lists.
      </p>
      <p className="site-admin-secondary">
        Sensitivity is a built-in label property and is read only here.
      </p>
      <table className="site-admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
          </tr>
        </thead>
        <tbody>
          {site.columns.map((column) => (
            <tr key={column.key}>
              <td>{column.label}</td>
              <td>
                {column.key === "sensitivity"
                  ? "Sensitivity label"
                  : column.type === "choice" || column.choices
                    ? "Choice"
                    : column.type === "date"
                      ? "Date and time"
                      : "Single line of text"}
              </td>
              <td>{column.required ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function SiteContentTypes({ site }: { site: SiteAdminModel }) {
  const [selected, setSelected] = useState("");
  return (
    <>
      {site.contentTypes.length ? (
        site.contentTypes.map((type) => (
          <section className="site-admin-settings-section" key={type.id}>
            <button
              className="site-admin-text-link"
              aria-expanded={selected === type.id}
              onClick={() => setSelected(selected === type.id ? "" : type.id)}
            >
              {type.name}
            </button>
            {selected === type.id && (
              <>
                <p>Used by the site’s configured document libraries.</p>
                {type.template && <p>Document template: {type.template}</p>}
                <h4>Columns</h4>
                <ul>
                  {(type.fields || []).map((key) => (
                    <li key={key}>
                      {site.columns.find((column) => column.key === key)
                        ?.label || key}
                    </li>
                  ))}
                </ul>
                {!type.fields?.length && <p>Standard document columns</p>}
              </>
            )}
          </section>
        ))
      ) : (
        <p>This site uses the standard Document content type.</p>
      )}
    </>
  );
}

export function SiteNavigation({ site, onClose, onMessage }: SitePanelProps) {
  const { t } = useTranslation();
  const storageKey = `site-navigation-preview:${site.id}`;
  const [links, setLinks] = useState(() =>
    savedValue(
      storageKey,
      site.contents.map((content) => ({
        id: content.id,
        name: t(content.name),
        href: content.href,
        shown: true,
      })),
    ),
  );
  return (
    <>
      <p className="site-admin-secondary">
        Preview the labels and order of links to existing site content.
      </p>
      {links.map((link, index) => (
        <div className="site-admin-navigation-row" key={link.id}>
          <Checkbox
            aria-label={`Show ${link.name} in navigation`}
            checked={link.shown}
            onChange={(_, data) =>
              setLinks(
                links.map((item, i) =>
                  i === index ? { ...item, shown: !!data.checked } : item,
                ),
              )
            }
          />
          <Input
            aria-label={`Navigation label ${index + 1}`}
            value={link.name}
            onChange={(_, data) =>
              setLinks(
                links.map((item, i) =>
                  i === index ? { ...item, name: data.value } : item,
                ),
              )
            }
          />
          <Button
            aria-label={`Move navigation link ${index + 1} up`}
            disabled={index === 0}
            onClick={() => {
              const updated = [...links];
              [updated[index - 1], updated[index]] = [
                updated[index],
                updated[index - 1],
              ];
              setLinks(updated);
            }}
          >
            ↑
          </Button>
        </div>
      ))}
      <PreviewActions
        onClose={onClose}
        onSave={() => {
          savePreview(storageKey, links);
          onMessage("Navigation saved for this preview.");
          onClose();
        }}
      />
    </>
  );
}

export function SiteRegional({ site, onClose, onMessage }: SitePanelProps) {
  const storageKey = `site-regional-preview:${site.id}`;
  const [locale, setLocale] = useState(() =>
    savedValue(storageKey, "English (United Kingdom)"),
  );
  return (
    <>
      <label className="site-admin-field">
        Locale
        <Select
          aria-label="Locale"
          value={locale}
          onChange={(event) => setLocale(event.target.value)}
        >
          <option value="English (United Kingdom)">
            English (United Kingdom)
          </option>
          <option value="German (Germany)">German (Germany)</option>
        </Select>
      </label>
      <label className="site-admin-field">
        Time zone
        <Select aria-label="Time zone" defaultValue="central">
          <option value="central">
            Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna
          </option>
        </Select>
      </label>
      <p className="site-admin-secondary">
        Regional formatting preview. The language toggle controls the demo’s
        interface language.
      </p>
      <PreviewActions
        onClose={onClose}
        onSave={() => {
          savePreview(storageKey, locale);
          onMessage("Regional settings saved for this preview.");
          onClose();
        }}
      />
    </>
  );
}
