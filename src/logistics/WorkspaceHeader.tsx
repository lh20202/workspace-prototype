import SensitivityBadge from "../sharepoint/SensitivityBadge";
import SiteSettingsButton from "../components/SiteSettingsButton";
import TeamsMark from "../components/TeamsMark";
import { useState } from "react";
import { Input } from "@fluentui/react-components";
import {
  GridDots24Regular,
  Search20Regular,
  Alert24Regular,
  QuestionCircle24Regular,
  People24Regular,
  Star20Filled,
} from "@fluentui/react-icons";
import DocumentIcon from "../components/DocumentIcon";
import CompanyMark from "../components/CompanyMark";
import HubNavigation from "../components/HubNavigation";
import { files, workspaceTitle, type OperationalFile } from "./data";
import "../sharepoint/fidelity.css";
import {
  workspaceSeed,
  workspaceAccessLevels,
} from "../workspaces/accessClassification";
import { matchesDisplayText } from "../i18n/search";
import { LanguageToggle } from "../i18n/Language";
export default function WorkspaceHeader({
  onSearchChange,
  onOpen,
  userName = "Maya Chen",
  userRole = "Workspace member and contributor",
  onTeams,
  onMessage,
  title = workspaceTitle,
  searchFiles = files,
  memberCount = 42,
  restricted,
  helpText = "Use campaign folders for operational files, the shared location list for permits, and channels for coordination.",
}: {
  onSearchChange?: (query: string) => void;
  onOpen: (f: OperationalFile) => void;
  onTeams?: () => void;
  onMessage: (m: string) => void;
  title?: string;
  userName?: string;
  userRole?: string;
  searchFiles?: (OperationalFile & {
    metadata?: Record<string, string>;
    contentType?: string;
    folderPath?: string;
  })[];
  memberCount?: number | null;
  restricted?: boolean;
  helpText?: string;
}) {
  const [query, setQuery] = useState("");
  const site = workspaceSeed.find(
    ([, , href]) =>
      typeof location !== "undefined" &&
      (location.pathname === href || location.pathname.startsWith(`${href}/`)),
  );
  const restrictedWorkspace =
    restricted ??
    (site ? workspaceAccessLevels[site[0]] === "strictly-confidential" : false);
  const [favorite, setFavorite] = useState(true);
  const results = searchFiles.filter((f) =>
    matchesDisplayText(
      [
        f.name,
        f.folderPath || f.folder,
        f.campaign,
        f.owner,
        f.status,
        f.contentType,
        ...Object.values(f.metadata || {}),
      ].join("\n"),
      query,
    ),
  );
  return (
    <>
      <header className="m365-header">
        <button
          className="global-icon"
          aria-label="Digital workplace apps"
          onClick={() =>
            onMessage(
              "The digital workplace app launcher is illustrative in this proof of concept.",
            )
          }
        >
          <GridDots24Regular />
        </button>
        <span className="product">Site</span>
        <div className="workspace-search">
          <Input
            contentBefore={<Search20Regular />}
            placeholder="Search this site"
            aria-label="Search this workspace"
            value={query}
            onChange={(_, d) => {
              setQuery(d.value);
              onSearchChange?.(d.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setQuery("");
                onSearchChange?.("");
              }
            }}
          />
          {query.trim() && !onSearchChange && (
            <div
              className="workspace-results"
              aria-label="Workspace search results"
            >
              <div className="search-results-heading">Documents</div>
              {results.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    onOpen(f);
                    setQuery("");
                  }}
                >
                  <DocumentIcon name={f.name} />
                  <span>
                    {f.name}
                    <SensitivityBadge value={f.sensitivity} />
                    <small>{f.campaign}</small>
                  </span>
                </button>
              ))}
              {!results.length && <p>No documents found.</p>}
            </div>
          )}
        </div>
        <div className="global-utilities">
          <button
            className="global-icon"
            aria-label="Notifications"
            onClick={() =>
              onMessage(
                "No new notifications. Check current operations for this week’s handover.",
              )
            }
          >
            <Alert24Regular />
          </button>
          <button
            className="global-icon"
            aria-label="Help"
            onClick={() => onMessage(helpText)}
          >
            <QuestionCircle24Regular />
          </button>
          <SiteSettingsButton onMessage={onMessage} />
          <LanguageToggle />
          <button
            className="profile-button"
            aria-label={`Signed in as ${userName}`}
            onClick={() => onMessage(`${userName} · ${userRole}`)}
          >
            {userName === "Maya Chen" ? (
              <img
                src="/maya-avatar.svg"
                alt="Illustrated avatar of Maya Chen"
              />
            ) : (
              <span className="executive-avatar">
                {userName
                  .split(" ")
                  .map((x) => x[0])
                  .join("")}
              </span>
            )}
          </button>
        </div>
      </header>
      <HubNavigation />
      <div className="site-header">
        <CompanyMark />
        <div className="site-title">
          <h1>{title}</h1>
          {onTeams && (
            <button
              className="teams-button"
              aria-label="Open channels"
              title="Channels"
              onClick={onTeams}
            >
              <TeamsMark />
            </button>
          )}
        </div>
        <div className="site-context">
          {restrictedWorkspace && <span>Private group</span>}
          <button
            aria-pressed={favorite}
            onClick={() => setFavorite(!favorite)}
          >
            <Star20Filled />
            {favorite ? "Added to favorites" : "Add to favorites"}
          </button>
          {memberCount !== null && (
            <button
              onClick={() =>
                onMessage(
                  `${memberCount} members coordinate shared workspace activity.`,
                )
              }
            >
              <People24Regular />
              {memberCount} members
            </button>
          )}
        </div>
      </div>
    </>
  );
}
