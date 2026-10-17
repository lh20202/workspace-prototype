import {
  lazy,
  Suspense,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
} from "@fluentui/react-components";
import {
  ArrowLeft20Regular,
  Dismiss20Regular,
  Settings24Regular,
  ChevronRight20Regular,
} from "@fluentui/react-icons";
import { resolveStaffPerson } from "../intranet/catalog";
import {
  getSiteAdminModel,
  type SiteAdminModel,
} from "../administration/model";
import {
  SiteInformation,
  SitePermissions,
  SiteAppearance,
  SiteTemplates,
  SiteNavigation,
  siteSurfaceTitles,
  type SiteSurface,
} from "../administration/SitePanels";
import { previewRoleChangingEvent } from "./demoControls";
import { siteAdministrationHref } from "../administration/routes";
import "../administration/site-administration.css";

const LibraryAdministration = lazy(
  () => import("../administration/LibraryAdministration"),
);

// Relevant subset in the order shown by the current official modern Settings screenshot.
export const siteAdministrationOptions = [
  {
    id: "contents",
    name: "Site contents",
    detail: "Inspect the site's current libraries, lists and pages.",
  },
  {
    id: "information",
    name: "Site information",
    detail: "Review this workspace’s name, description and site information.",
  },
  {
    id: "permissions",
    name: "Site permissions",
    detail:
      "Manage site membership within delegated responsibilities. Protected business areas require separate authorisation.",
  },
  {
    id: "templates",
    name: "Apply a site template",
    detail: "Preview a team site template without replacing existing content.",
  },
  {
    id: "usage",
    name: "Site usage",
    detail: "Review the availability of site usage information.",
  },
  {
    id: "appearance",
    name: "Change the look",
    detail: "Preview the site's theme, header and navigation.",
  },
] as const;
export type SettingsSurface = SiteSurface | "library" | "list";
export interface SiteSettingsOption {
  id: SettingsSurface;
  name: string;
  detail: string;
}
export function siteSettingsOptions(
  site: SiteAdminModel,
): SiteSettingsOption[] {
  if (!site.canAccess) return [];
  return siteAdministrationOptions.flatMap<SiteSettingsOption>((option) => {
    if (!site.canManage && !["contents", "usage"].includes(option.id))
      return [];
    if (
      option.id === "contents" &&
      site.canManage &&
      site.current &&
      site.current.kind !== "page"
    )
      return [
        option,
        {
          id: site.current.kind,
          name:
            site.current.kind === "library"
              ? "Library settings"
              : "List settings",
          detail: site.current.name,
        },
      ];
    return [option];
  });
}
function subscribeLocation(listener: () => void) {
  window.addEventListener("popstate", listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener("storage", listener);
  };
}
const locationSnapshot = () => `${location.pathname}${location.search}`;

/** Native site settings extend the existing gear; all data access stays in the shared policy. */
export default function SiteSettingsButton({
  onMessage,
  ordinaryMessage = "Workspace preferences use the default document and reading views.",
}: {
  onMessage: (message: string) => void;
  ordinaryMessage?: string;
}) {
  useSyncExternalStore(subscribeLocation, locationSnapshot, locationSnapshot);
  const person = resolveStaffPerson(
    new URLSearchParams(location.search).get("staff"),
  );
  const site = getSiteAdminModel(person, location.pathname, location.search);
  if (site && !site.canAccess) return null;
  if (!site)
    return (
      <button
        className="global-icon site-settings-trigger"
        aria-label="Settings"
        onClick={() => onMessage(ordinaryMessage)}
      >
        <Settings24Regular />
      </button>
    );
  return (
    <SiteSettingsSession
      key={`${person.id}:${site.id}:${site.current?.id || "site"}:${site.canManage}`}
      site={site}
      onMessage={onMessage}
      ordinaryMessage={ordinaryMessage}
    />
  );
}
function SiteSettingsSession({
  site,
  onMessage,
  ordinaryMessage,
}: {
  site: SiteAdminModel;
  onMessage: (message: string) => void;
  ordinaryMessage: string;
}) {
  const [surface, setSurface] = useState<SettingsSurface | null>(null);
  useEffect(() => {
    const close = () => setSurface(null);
    window.addEventListener(previewRoleChangingEvent, close);
    return () => window.removeEventListener(previewRoleChangingEvent, close);
  }, []);
  const close = () => setSurface(null);
  const open = (next: SettingsSurface) => {
    if (
      [
        "contents",
        "usage",
        "advanced",
        "site-columns",
        "site-types",
        "regional",
      ].includes(next)
    ) {
      close();
      location.assign(siteAdministrationHref(site, next as SiteSurface));
    } else setSurface(next);
  };
  const props = { site, onSurface: open, onClose: close, onMessage };
  const library =
    (surface === "library" || surface === "list") &&
    site.canManage &&
    site.current;
  return (
    <>
      <button
        className="global-icon site-settings-trigger"
        aria-label={site.canManage ? "Site settings" : "Settings"}
        onClick={() => setSurface("settings")}
      >
        <Settings24Regular />
      </button>
      <Drawer
        className="site-settings-drawer"
        position="end"
        size="small"
        modalType="non-modal"
        open={surface !== null && surface !== "templates"}
        onOpenChange={(_, data) => {
          if (!data.open) close();
        }}
      >
        {library ? (
          <Suspense fallback={<p role="status">Opening settings…</p>}>
            <LibraryAdministration
              site={site}
              content={site.current!}
              onBack={() => setSurface("settings")}
              onClose={close}
              onMessage={onMessage}
            />
          </Suspense>
        ) : (
          <>
            <DrawerHeader>
              <DrawerHeaderTitle
                action={
                  <Button
                    appearance="subtle"
                    icon={<Dismiss20Regular />}
                    aria-label="Close settings"
                    onClick={close}
                  />
                }
              >
                {surface && surface !== "settings" && (
                  <Button
                    className="site-admin-back"
                    appearance="subtle"
                    icon={<ArrowLeft20Regular />}
                    aria-label="Back to settings"
                    onClick={() => setSurface("settings")}
                  />
                )}
                {siteSurfaceTitles[(surface || "settings") as SiteSurface]}
              </DrawerHeaderTitle>
            </DrawerHeader>
            <DrawerBody className="site-admin-body">
              {surface === "settings" && (
                <>
                  {siteSettingsOptions(site).map((option) => (
                    <button
                      className="site-admin-menu-row"
                      key={option.id}
                      onClick={() => open(option.id as SettingsSurface)}
                    >
                      {option.name}
                      <ChevronRight20Regular />
                    </button>
                  ))}
                  {!site.canManage && (
                    <button
                      className="site-admin-menu-row"
                      onClick={() => onMessage(ordinaryMessage)}
                    >
                      Reading preferences
                      <ChevronRight20Regular />
                    </button>
                  )}
                </>
              )}
              {site.canManage && surface === "information" && (
                <SiteInformation {...props} />
              )}
              {site.canManage && surface === "permissions" && (
                <SitePermissions {...props} />
              )}
              {site.canManage && surface === "appearance" && (
                <SiteAppearance {...props} />
              )}
              {site.canManage && surface === "navigation" && (
                <SiteNavigation {...props} />
              )}
            </DrawerBody>
          </>
        )}
      </Drawer>
      <Dialog
        open={surface === "templates" && site.canManage}
        onOpenChange={(_, data) => {
          if (!data.open) close();
        }}
      >
        <DialogSurface className="site-template-dialog">
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  icon={<Dismiss20Regular />}
                  aria-label="Close templates"
                  onClick={close}
                />
              }
            >
              Apply a site template
            </DialogTitle>
            <DialogContent>
              <SiteTemplates {...props} />
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
