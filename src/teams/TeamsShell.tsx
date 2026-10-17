import TeamsMark from "../components/TeamsMark";
import TeamIdentity, { type TeamKind } from "./TeamIdentity";
import AccessLock from "../components/AccessLock";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import {
  Alert24Regular,
  Chat24Regular,
  Calendar24Regular,
  Call24Regular,
  Apps24Regular,
  Search20Regular,
  MoreHorizontal20Regular,
  ArrowLeft20Regular,
  ArrowRight20Regular,
  ChevronDown16Regular,
  ChevronRight16Regular,
  NumberSymbol20Regular,
  Info20Regular,
  ArrowUpRight20Regular,
  TextEditStyle20Regular,
  Send20Regular,
  People20Regular,
  Dismiss20Regular,
} from "@fluentui/react-icons";
import "./styles.css";

export interface TeamsGroup {
  id: string;
  label: string;
  kind?: TeamKind;
  channels: {
    id: string;
    label: string;
    unread?: boolean;
    private?: boolean;
    cue?: "Temporary" | "Archived";
    onSelect: () => void;
  }[];
}
export interface TeamsShellProps {
  userName: string;
  teamName: string;
  channelName: string;
  groups: TeamsGroup[];
  selectedChannelId: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs?: string[];
  privateChannel?: boolean;
  onOpenSharePoint?: () => void;
  onChannelInfo?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchResults?: ReactNode;
  headerActions?: ReactNode;
  navigationFooter?: ReactNode;
  children: ReactNode;
}
export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("");
}
export default function TeamsShell(props: TeamsShellProps) {
  // A role change starts with fresh local navigation, search and utility panels.
  return <TeamsShellSession key={props.userName} {...props} />;
}

function TeamsShellSession({
  userName,
  teamName,
  channelName,
  groups,
  selectedChannelId,
  activeTab,
  onTabChange,
  tabs = ["Posts", "Shared"],
  privateChannel,
  onOpenSharePoint,
  onChannelInfo,
  searchValue,
  onSearchChange,
  searchResults,
  headerActions,
  navigationFooter,
  children,
}: TeamsShellProps) {
  const visibleGroups = groups.filter((group) => group.channels.length > 0);
  const activeGroup = visibleGroups.find((group) =>
    group.channels.some((channel) => channel.id === selectedChannelId),
  );
  const [closed, setClosed] = useState<string[]>([]);
  const [filter, setFilter] = useState("Channels");
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [listOptions, setListOptions] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const selectedChannel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    selectedChannel.current?.scrollIntoView({ block: "center" });
  }, [selectedChannelId]);
  useEffect(() => {
    const postId = new URLSearchParams(location.search).get("post");
    if (!postId || activeTab !== "Posts") return;
    const post =
      document.getElementById(`post-${postId}`) ||
      document.getElementById(postId);
    if (!post || !post.matches("article")) return;
    post.scrollIntoView({ block: "center", behavior: "auto" });
    post.focus({ preventScroll: true });
  }, [selectedChannelId, activeTab]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavigationOpen(false);
        setListOptions(false);
        setPanel("");
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "e") {
        event.preventDefault();
        searchInput.current?.focus();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  const search = searchValue ?? query;
  const updateSearch = (value: string) => {
    setQuery(value);
    onSearchChange?.(value);
  };
  return (
    <FluentProvider
      className="m365-teams"
      theme={{
        ...webLightTheme,
        fontFamilyBase:
          '"Segoe UI", "Segoe UI Variable", system-ui, sans-serif',
        fontFamilyNumeric:
          '"Segoe UI", "Segoe UI Variable", system-ui, sans-serif',
      }}
    >
      <header className="m365-teams-topbar">
        <div className="m365-teams-history">
          <TeamsMark size={28} labelled />
          <button aria-label="Back" onClick={() => history.back()}>
            <ArrowLeft20Regular />
          </button>
          <button aria-label="Forward" onClick={() => history.forward()}>
            <ArrowRight20Regular />
          </button>
        </div>
        <div className="m365-teams-search">
          <Search20Regular aria-hidden="true" />
          <input
            ref={searchInput}
            aria-label="Search Teams"
            placeholder="Search (⌘ E)"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") updateSearch("");
            }}
          />
          {search && (
            <button
              aria-label="Clear Teams search"
              onClick={() => updateSearch("")}
            >
              <Dismiss20Regular />
            </button>
          )}
          {search.trim() && searchResults && (
            <div className="m365-teams-search-results">{searchResults}</div>
          )}
        </div>
        <div className="m365-teams-account">
          <button
            aria-label="Settings and more"
            aria-expanded={panel === "settings"}
            onClick={() => setPanel(panel === "settings" ? "" : "settings")}
          >
            <MoreHorizontal20Regular />
          </button>
          <button
            className="m365-teams-profile"
            aria-label={`Signed in as ${userName}`}
            aria-expanded={panel === "profile"}
            onClick={() => setPanel(panel === "profile" ? "" : "profile")}
          >
            {initials(userName)}
            <i />
          </button>
          {panel === "profile" && (
            <div className="m365-teams-account-menu">
              <strong>{userName}</strong>
              <span>
                <i /> Available
              </span>
              <button onClick={() => setPanel("")}>Close</button>
            </div>
          )}
          {panel === "settings" && (
            <div className="m365-teams-account-menu">
              <strong>Settings and more</strong>
              <span>Appearance · Light</span>
              <span>Notifications · On</span>
              <button onClick={() => setPanel("")}>Close</button>
            </div>
          )}
        </div>
      </header>
      <div className="m365-teams-layout">
        <nav className="m365-teams-rail" aria-label="Teams apps">
          {[
            ["Activity", Alert24Regular],
            ["Chat", Chat24Regular],
            ["Calendar", Calendar24Regular],
            ["Calls", Call24Regular],
            ["Apps", Apps24Regular],
          ].map(([name, Icon]) => {
            const Glyph = Icon as typeof Alert24Regular;
            return (
              <button
                key={String(name)}
                aria-current={name === "Chat" ? "page" : undefined}
                onClick={() => {
                  if (name === "Chat") setPanel("");
                  else setPanel(String(name));
                }}
              >
                <Glyph />
                <span>{String(name)}</span>
              </button>
            );
          })}
        </nav>
        <aside
          className={`m365-teams-navigation${navigationOpen ? " is-open" : ""}`}
          aria-label="Chat and channels"
        >
          <div className="m365-teams-nav-heading">
            <h2>Chat</h2>
            <button
              className="m365-teams-mobile-navigation"
              aria-label="Hide teams and channels"
              onClick={() => setNavigationOpen(false)}
            >
              <Dismiss20Regular />
            </button>
            <button
              aria-label="Chat list options"
              aria-expanded={listOptions}
              onClick={() => setListOptions(!listOptions)}
            >
              <MoreHorizontal20Regular />
            </button>
            {listOptions && (
              <div className="m365-teams-list-menu">
                <button
                  onClick={() => {
                    setFilter("Channels");
                    setListOptions(false);
                  }}
                >
                  Show all channels
                </button>
                <button
                  onClick={() => {
                    setClosed(visibleGroups.map((g) => g.id));
                    setListOptions(false);
                  }}
                >
                  Collapse teams
                </button>
                <button
                  onClick={() => {
                    setClosed(visibleGroups.map((g) => `open:${g.id}`));
                    setListOptions(false);
                  }}
                >
                  Expand teams
                </button>
              </div>
            )}
          </div>
          <div className="m365-teams-filters" aria-label="Chat list filters">
            {["Unread", "Channels"].map((name) => (
              <button
                key={name}
                aria-pressed={filter === name}
                onClick={() => setFilter(filter === name ? "Channels" : name)}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="m365-teams-nav-scroll">
            <div className="m365-teams-section-label">Teams and channels</div>
            {visibleGroups.map((group) => {
              const active = group.channels.some(
                (c) => c.id === selectedChannelId,
              );
              const channels = group.channels.filter(
                (c) =>
                  filter !== "Unread" || c.unread || c.id === selectedChannelId,
              );
              if (!channels.length) return null;
              const expanded =
                !closed.includes(group.id) &&
                (active || closed.includes(`open:${group.id}`));
              return (
                <div className="m365-teams-group" key={group.id}>
                  <button
                    className="m365-teams-team"
                    aria-expanded={expanded}
                    onClick={() =>
                      setClosed((items) =>
                        expanded
                          ? [
                              ...items.filter(
                                (id) => id !== `open:${group.id}`,
                              ),
                              group.id,
                            ]
                          : [
                              ...items.filter((id) => id !== group.id),
                              `open:${group.id}`,
                            ],
                      )
                    }
                  >
                    {expanded ? (
                      <ChevronDown16Regular />
                    ) : (
                      <ChevronRight16Regular />
                    )}
                    <TeamIdentity
                      kind={group.kind || "department"}
                      id={group.id}
                    />
                    <span>{group.label}</span>
                  </button>
                  {expanded &&
                    channels.map((channel) => (
                      <button
                        className={`m365-teams-channel${channel.unread ? " is-unread" : ""}`}
                        key={channel.id}
                        title={channel.label}
                        ref={
                          selectedChannelId === channel.id
                            ? selectedChannel
                            : undefined
                        }
                        aria-current={
                          selectedChannelId === channel.id ? "page" : undefined
                        }
                        onClick={() => {
                          setPanel("");
                          setNavigationOpen(false);
                          updateSearch("");
                          channel.onSelect();
                        }}
                      >
                        {channel.private ? (
                          <AccessLock labelled={false} />
                        ) : (
                          <NumberSymbol20Regular />
                        )}
                        <span>{channel.label}</span>
                        {channel.cue && (
                          <small className="m365-teams-channel-cue">
                            {channel.cue}
                          </small>
                        )}
                        {channel.unread && <i aria-label="Unread" />}
                      </button>
                    ))}
                </div>
              );
            })}
            {navigationFooter && (
              <div className="m365-teams-navigation-footer">
                {navigationFooter}
              </div>
            )}
          </div>
        </aside>
        <main className="m365-teams-main" id="teams-main">
          <header className="m365-teams-channel-header">
            <button
              className="m365-teams-mobile-navigation"
              aria-label="Show teams and channels"
              aria-expanded={navigationOpen}
              onClick={() => setNavigationOpen(!navigationOpen)}
            >
              <Chat24Regular />
            </button>
            <div className="m365-teams-channel-identity">
              <span className="m365-teams-channel-mark">
                {privateChannel ? (
                  <AccessLock labelled={false} />
                ) : (
                  <NumberSymbol20Regular />
                )}
              </span>
              <div>
                <span className="m365-teams-parent-label">
                  {activeGroup && (
                    <TeamIdentity
                      kind={activeGroup.kind || "department"}
                      id={activeGroup.id}
                      size={18}
                    />
                  )}
                  {teamName}
                </span>
                <h1>{channelName}</h1>
              </div>
            </div>
            <div className="m365-teams-channel-actions">
              {headerActions}
              {onOpenSharePoint && (
                <button
                  onClick={onOpenSharePoint}
                  title="Open in SharePoint"
                  aria-label="Open in SharePoint"
                >
                  <img src="/images/sharepoint-logo.svg" alt="" />
                  <span>Open in SharePoint</span>
                  <ArrowUpRight20Regular />
                </button>
              )}
              <button
                aria-label="Channel information"
                onClick={() => {
                  onChannelInfo?.();
                  if (!onChannelInfo)
                    setPanel(panel === "channel" ? "" : "channel");
                }}
              >
                <Info20Regular />
              </button>
            </div>
          </header>
          <div
            className="m365-teams-tabs"
            role="tablist"
            aria-label="Channel tabs"
          >
            {tabs.map((name) => (
              <button
                key={name}
                id={`teams-tab-${name.replaceAll(" ", "-")}`}
                role="tab"
                aria-selected={activeTab === name}
                aria-controls="teams-channel-panel"
                onClick={() => {
                  updateSearch("");
                  onTabChange(name);
                }}
                onKeyDown={(event) => {
                  const offset =
                    event.key === "ArrowRight"
                      ? 1
                      : event.key === "ArrowLeft"
                        ? -1
                        : 0;
                  const index =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? tabs.length - 1
                        : (tabs.indexOf(name) + offset + tabs.length) %
                          tabs.length;
                  if (offset || event.key === "Home" || event.key === "End") {
                    event.preventDefault();
                    updateSearch("");
                    onTabChange(tabs[index]);
                    document
                      .getElementById(
                        `teams-tab-${tabs[index].replaceAll(" ", "-")}`,
                      )
                      ?.focus();
                  }
                }}
              >
                {name}
              </button>
            ))}
          </div>
          <div
            className="m365-teams-canvas"
            id="teams-channel-panel"
            role="tabpanel"
            aria-labelledby={`teams-tab-${activeTab.replaceAll(" ", "-")}`}
          >
            {panel && !["profile", "settings"].includes(panel) && (
              <section
                className="m365-teams-utility-panel"
                role="region"
                aria-label={panel === "channel" ? "Channel information" : panel}
              >
                <button aria-label="Close panel" onClick={() => setPanel("")}>
                  <Dismiss20Regular />
                </button>
                <h2>{panel === "channel" ? channelName : panel}</h2>
                {panel === "channel" ? (
                  <>
                    <p>{teamName}</p>
                    <p>
                      <People20Regular />{" "}
                      {privateChannel
                        ? "Private channel · Members only"
                        : "Team channel"}
                    </p>
                  </>
                ) : (
                  <p>
                    {panel === "Activity"
                      ? "You’re all caught up. Channel updates appear in your chats and channels."
                      : `Your ${panel.toLowerCase()} are available in the full Teams application.`}
                  </p>
                )}
              </section>
            )}
            {children}
          </div>
        </main>
      </div>
    </FluentProvider>
  );
}
export function TeamsComposer({
  value,
  onChange,
  onSend,
  placeholder = "Start a post",
  disabled,
  compact,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <form
      className={`m365-teams-composer${compact ? " is-reply" : ""}${expanded ? " is-expanded" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim() && !disabled) onSend();
      }}
    >
      <textarea
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={expanded ? 4 : 1}
      />
      <div>
        <button
          type="button"
          disabled={disabled}
          aria-label={expanded ? "Collapse compose box" : "Expand compose box"}
          aria-pressed={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <TextEditStyle20Regular />
        </button>
        <button
          type="submit"
          aria-label={compact ? "Send reply" : "Send post"}
          disabled={disabled || !value.trim()}
        >
          <Send20Regular />
        </button>
      </div>
    </form>
  );
}
