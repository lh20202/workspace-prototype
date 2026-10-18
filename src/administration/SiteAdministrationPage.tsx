import { useState } from "react";
import { Button } from "@fluentui/react-components";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import PrototypeNavigator from "../components/PrototypeNavigator";
import StaffLink from "../components/StaffLink";
import { withExplicitStaff } from "../utils/staffNavigation";
import { resolveStaffPerson } from "../intranet/catalog";
import { getSiteAdminModel } from "./model";
import { siteAdministrationHref, siteAdministrationPage } from "./routes";
import {
  SiteAdvanced,
  SiteColumns,
  SiteContents,
  SiteContentTypes,
  SiteNavigation,
  SiteRegional,
  SitePermissions,
  siteSurfaceTitles,
  type SiteSurface,
} from "./SitePanels";

export default function SiteAdministrationPage() {
  const person = resolveStaffPerson(
    new URLSearchParams(location.search).get("staff"),
  );
  const site = getSiteAdminModel(person, location.pathname, location.search);
  const surface = siteAdministrationPage(location.search) || "contents";
  const [message, setMessage] = useState("");
  const permitted =
    site?.canAccess &&
    (site.canManage || ["contents", "usage"].includes(surface));
  const onClose = () => {
    if (site)
      location.assign(
        withExplicitStaff(
          site.href + `?staff=${encodeURIComponent(person.id)}`,
        ),
      );
  };
  const onSurface = (next: SiteSurface) => {
    if (site) location.assign(siteAdministrationHref(site, next));
  };
  const props = site
    ? { site, onClose, onSurface, onMessage: setMessage }
    : undefined;
  return (
    <div className="prototype-frame site-administration-shell">
      <PrototypeNavigator allowWelcomeInvitation={false} />
      {site && (
        <WorkspaceHeader
          title={site.title}
          userName={person.name}
          userRole={person.role}
          searchFiles={[]}
          memberCount={null}
          onOpen={() => {}}
          onMessage={setMessage}
        />
      )}
      <main className="site-administration-page">
        <nav aria-label="Settings breadcrumb">
          <StaffLink href={site?.href || "/architecture"}>Workspace</StaffLink>
          <span>/</span>
          <span>{siteSurfaceTitles[surface]}</span>
        </nav>
        <h1>{siteSurfaceTitles[surface]}</h1>
        {!permitted ? (
          <>
            <p>This setting is not available with your current access.</p>
            <StaffLink href={site?.href || "/architecture"}>
              Return to workspace
            </StaffLink>
          </>
        ) : (
          <>
            {surface === "contents" && <SiteContents site={site} />}
            {surface === "usage" && (
              <>
                <p>No usage data is collected in this demo.</p>
                <p className="site-admin-secondary">
                  Visitor counts, visits and viewing time are unavailable.
                </p>
              </>
            )}
            {site.canManage && surface === "advanced" && (
              <SiteAdvanced {...props!} />
            )}
            {site.canManage && surface === "site-columns" && (
              <SiteColumns site={site} />
            )}
            {site.canManage && surface === "site-types" && (
              <SiteContentTypes site={site} />
            )}
            {site.canManage && surface === "navigation" && (
              <SiteNavigation {...props!} />
            )}
            {site.canManage && surface === "regional" && (
              <SiteRegional {...props!} />
            )}
            {site.canManage && surface === "permissions" && (
              <SitePermissions {...props!} />
            )}
          </>
        )}
        {message && (
          <div className="simulation-message" role="status">
            <p>{message}</p>
            <Button onClick={() => setMessage("")}>Dismiss</Button>
          </div>
        )}
      </main>
    </div>
  );
}
