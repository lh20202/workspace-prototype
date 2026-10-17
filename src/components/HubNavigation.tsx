import {
  environmentsForHub,
  environmentById,
  environmentRegistry,
} from "../workspaces/registry";
import EnvironmentIcon from "./EnvironmentIcon";
import { useEffect, useRef } from "react";
import { withExplicitStaff } from "../utils/staffNavigation";
import "./HubNavigation.css";

export interface HubNavigationProps {
  workspaceId?: string;
  pathname?: string;
  search?: string;
}

/** Site-level navigation is shared by a hub, independently of local site navigation. */
export default function HubNavigation({
  workspaceId,
  pathname = typeof location === "undefined" ? "" : location.pathname,
  search = typeof location === "undefined" ? "" : location.search,
}: HubNavigationProps) {
  const sitesRef = useRef<HTMLDivElement>(null);
  // Teams keeps its own product navigation, including when opened through a site route.
  const isTeams = pathname.split("/").includes("teams");
  const current = workspaceId
    ? environmentById.get(workspaceId)
    : environmentRegistry
        .filter(
          (workspace) =>
            pathname === workspace.href ||
            pathname.startsWith(`${workspace.href}/`),
        )
        .sort((a, b) => b.href.length - a.href.length)[0];
  useEffect(() => {
    const sites = sitesRef.current;
    const active = sites?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!sites || !active) return;
    const alignCurrent = () => {
      const frame = sites.getBoundingClientRect();
      const item = active.getBoundingClientRect();
      if (item.width > frame.width) sites.scrollLeft += item.left - frame.left;
      else if (item.right > frame.right)
        sites.scrollLeft += item.right - frame.right;
      else if (item.left < frame.left)
        sites.scrollLeft -= frame.left - item.left;
    };
    alignCurrent();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(alignCurrent);
    observer.observe(sites);
    observer.observe(active);
    return () => observer.disconnect();
  }, [current?.id, isTeams]);
  if (isTeams || !current) return null;
  const siblings = current.hubId
    ? environmentsForHub(current.hubId)
    : [current];
  // Keep the explicitly chosen person, without carrying page-specific query state.
  const destination = (href: string) => withExplicitStaff(href, search);

  return (
    <nav
      className="hub-navigation"
      aria-label="Hub navigation"
      data-hub={current.hubId || "standalone"}
    >
      {siblings.length > 0 && (
        <div className="hub-navigation-sites" ref={sitesRef}>
          {siblings.map((environment) => (
            <a
              key={environment.id}
              href={destination(environment.href)}
              data-environment={environment.environmentType}
              aria-current={environment.id === current.id ? "page" : undefined}
            >
              {environment.environmentType !== "workspace" && (
                <EnvironmentIcon type={environment.environmentType} />
              )}
              <span className="hub-navigation-label">
                {environment.hubLabel}
              </span>
            </a>
          ))}
        </div>
      )}
      <a
        className="hub-navigation-intranet"
        href={destination("/architecture")}
      >
        Company intranet
      </a>
    </nav>
  );
}
