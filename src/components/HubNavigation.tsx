import {
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItemLink,
  MenuGroup,
  MenuGroupHeader,
  MenuDivider,
} from "@fluentui/react-components";
import {
  Folder20Regular,
  ChevronDown16Regular,
  Checkmark16Regular,
} from "@fluentui/react-icons";
import EnvironmentIcon from "./EnvironmentIcon";
import {
  getHubNavigationModel,
  type HubNavigationDestination,
} from "./hubNavigationModel";
import "./HubNavigation.css";

export interface HubNavigationProps {
  workspaceId?: string;
  pathname?: string;
  search?: string;
}

function Destination({
  environment,
}: {
  environment: HubNavigationDestination;
}) {
  return (
    <MenuItemLink
      className="hub-workspace-menu-item"
      href={environment.destinationHref}
      data-environment={environment.environmentType}
      aria-current={environment.isCurrent ? "page" : undefined}
      icon={
        environment.environmentType === "workspace" ? (
          <Folder20Regular />
        ) : (
          <EnvironmentIcon type={environment.environmentType} />
        )
      }
      secondaryContent={
        environment.isCurrent ? (
          <Checkmark16Regular aria-hidden="true" />
        ) : undefined
      }
    >
      <span className="hub-navigation-label">{environment.title}</span>
    </MenuItemLink>
  );
}

/** One compact environment switcher; local functional navigation remains below it. */
export default function HubNavigation({
  workspaceId,
  pathname = typeof location === "undefined" ? "" : location.pathname,
  search = typeof location === "undefined" ? "" : location.search,
}: HubNavigationProps) {
  const model = getHubNavigationModel({ workspaceId, pathname, search });
  if (!model) return null;
  return (
    <nav
      className="hub-navigation"
      aria-label="Hub navigation"
      data-hub={model.current.hubId || "standalone"}
    >
      <Menu
        positioning={{ position: "below", align: "start", autoSize: "height" }}
      >
        <MenuTrigger disableButtonEnhancement>
          <Button
            appearance="transparent"
            className="hub-workspaces-trigger"
            icon={<Folder20Regular />}
          >
            Workspaces <ChevronDown16Regular aria-hidden="true" />
          </Button>
        </MenuTrigger>
        <MenuPopover className="hub-workspaces-popover">
          <MenuList aria-label="Workspace navigation">
            <MenuGroup>
              <MenuGroupHeader>Workspaces</MenuGroupHeader>
              {model.workspaces.map((environment) => (
                <Destination key={environment.id} environment={environment} />
              ))}
            </MenuGroup>
            {model.related.length > 0 && (
              <>
                <MenuDivider />
                <MenuGroup>
                  <MenuGroupHeader>Knowledge & frontline</MenuGroupHeader>
                  {model.related.map((environment) => (
                    <Destination
                      key={environment.id}
                      environment={environment}
                    />
                  ))}
                </MenuGroup>
              </>
            )}
          </MenuList>
        </MenuPopover>
      </Menu>
      <a className="hub-navigation-intranet" href={model.intranetHref}>
        Company intranet
      </a>
    </nav>
  );
}
