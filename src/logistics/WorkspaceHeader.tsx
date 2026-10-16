import { useState } from "react";
import { Input } from "@fluentui/react-components";
import {
  GridDots24Regular,
  Search20Regular,
  Alert24Regular,
  QuestionCircle24Regular,
  Settings24Regular,
  People24Regular,
  Star20Filled,
  PeopleTeam24Regular,
} from "@fluentui/react-icons";
import DocumentIcon from "../components/DocumentIcon";
import { files, workspaceTitle, type OperationalFile } from "./data";
export default function WorkspaceHeader({
  onOpen,
  userName = "Maya Chen",
  userRole = "Workspace member and contributor",
  onTeams,
  onMessage,
  title = workspaceTitle,
  searchFiles = files,
  memberCount = 42,
  helpText = "Use campaign folders for operational files, the shared location list for permits, and Teams channels for coordination.",
}: {
  onOpen: (f: OperationalFile) => void;
  onTeams: () => void;
  onMessage: (m: string) => void;
  title?: string;
  userName?: string;
  userRole?: string;
  searchFiles?: OperationalFile[];
  memberCount?: number;
  helpText?: string;
}) {
  const [query, setQuery] = useState("");
  const [favorite, setFavorite] = useState(true);
  const results = searchFiles.filter((f) =>
    f.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <header className="m365-header">
        <button
          className="global-icon"
          aria-label="Microsoft 365 apps"
          onClick={() =>
            onMessage(
              "Microsoft 365 app launcher is illustrative in this prototype.",
            )
          }
        >
          <GridDots24Regular />
        </button>
        <span className="product">SharePoint</span>
        <div className="workspace-search">
          <Input
            contentBefore={<Search20Regular />}
            placeholder="Search this workspace"
            aria-label="Search this workspace"
            value={query}
            onChange={(_, d) => setQuery(d.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
          />
          {query.trim() && (
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
          <button
            className="global-icon"
            aria-label="Settings"
            onClick={() =>
              onMessage(
                "Workspace preferences use the default document and reading views.",
              )
            }
          >
            <Settings24Regular />
          </button>
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
      <div className="site-header">
        <div className="site-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="site-title">
          <h1>{title}</h1>
          <button
            className="teams-button"
            aria-label="Open Microsoft Teams channels"
            title="Microsoft Teams"
            onClick={onTeams}
          >
            <PeopleTeam24Regular />
            <b>T</b>
          </button>
        </div>
        <div className="site-context">
          <span>Private group</span>
          <button
            aria-pressed={favorite}
            onClick={() => setFavorite(!favorite)}
          >
            <Star20Filled />
            {favorite ? "Added to favorites" : "Add to favorites"}
          </button>
          <button
            onClick={() =>
              onMessage(
                `${memberCount} fictional members coordinate shared workspace activity.`,
              )
            }
          >
            <People24Regular />
            {memberCount} members
          </button>
        </div>
      </div>
    </>
  );
}
