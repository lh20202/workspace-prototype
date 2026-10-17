import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from "@fluentui/react-components";
import { Settings24Regular } from "@fluentui/react-icons";
import { getHubNavigationModel } from "./hubNavigationModel";
import { canAccessWorkspace, canAdministerSites } from "../access/policy";
import { resolveStaffPerson } from "../intranet/catalog";

export const siteAdministrationOptions = [
  {
    name: "Site information",
    detail: "Review this workspace’s name, description and site information.",
  },
  {
    name: "Site permissions",
    detail:
      "Manage site membership within delegated responsibilities. Protected business areas require separate authorisation.",
  },
  {
    name: "Site contents",
    detail: "Maintain this workspace’s libraries, lists and content types.",
  },
  {
    name: "Navigation",
    detail: "Maintain the workspace’s navigation links and structure.",
  },
  {
    name: "Library settings",
    detail: "Maintain library columns, metadata, views and content types.",
  },
] as const;

/** A delegated site-maintenance menu, using the existing SharePoint gear. */
export default function SiteSettingsButton({
  onMessage,
  ordinaryMessage = "Workspace preferences use the default document and reading views.",
}: {
  onMessage: (message: string) => void;
  ordinaryMessage?: string;
}) {
  const person = resolveStaffPerson(
    new URLSearchParams(location.search).get("staff"),
  );
  const workspace = getHubNavigationModel({
    pathname: location.pathname,
  })?.current;
  if (
    !canAdministerSites(person) ||
    (workspace && !canAccessWorkspace(person, workspace.id))
  )
    return (
      <button
        className="global-icon"
        aria-label="Settings"
        onClick={() => onMessage(ordinaryMessage)}
      >
        <Settings24Regular />
      </button>
    );
  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <button className="global-icon" aria-label="Site settings">
          <Settings24Regular />
        </button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {siteAdministrationOptions.map((option) => (
            <MenuItem
              key={option.name}
              onClick={() =>
                onMessage(
                  `${option.name}: ${option.detail} This is a simulated setting; no live changes are made.`,
                )
              }
            >
              {option.name}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
