import { useEffect, lazy, Suspense } from "react";
const App = lazy(() => import("./App"));
import PrototypeNavigator from "./components/PrototypeNavigator";
const LogisticsApp = lazy(() => import("./logistics/LogisticsApp"));
const AudienceApp = lazy(() => import("./audience/AudienceApp"));
const ServicesApp = lazy(() => import("./services/ServicesApp"));
const AccessRequest = lazy(() => import("./service-desk/AccessRequest"));
import { pageTitle, prototypeForPath } from "./utils/routes";
import { ArrowRight24Regular } from "@fluentui/react-icons";
export default function AppRouter() {
  const prototype = prototypeForPath(location.pathname);
  useEffect(() => {
    document.title = pageTitle(location.pathname);
  }, [prototype]);
  if (prototype === "launcher")
    return (
      <main className="prototype-launcher">
        <div>
          <span className="launcher-eyebrow">INTERACTIVE WORKSPACES</span>
          <h1>Workspace prototypes</h1>
          <p>interactive workspace examples</p>
          <div className="launcher-options">
            <a href="/planning">
              <span className="launcher-icon">
                <img
                  src="/images/sharepoint-logo.svg"
                  alt="SharePoint"
                  width="34"
                  height="34"
                />
              </span>
              <span>
                <small>PLANNING & REPORTING</small>View Organisational Planning
                & Reporting workspace
              </span>
              <ArrowRight24Regular />
            </a>
            <a href="/logistics">
              <span className="launcher-icon">
                <img
                  src="/images/sharepoint-logo.svg"
                  alt="SharePoint"
                  width="34"
                  height="34"
                />
              </span>
              <span>
                <small>CAMPAIGN OPERATIONS</small>View Acquisition & Activation
                Logistics workspace
              </span>
              <ArrowRight24Regular />
            </a>
            <a href="/services">
              <span className="launcher-icon">
                <img
                  src="/images/sharepoint-logo.svg"
                  alt="SharePoint"
                  width="34"
                  height="34"
                />
              </span>
              <span>
                <small>INFRASTRUCTURE &amp; SERVICES · INTERACTIVE DEMO</small>
                View Organisation Services workspace
              </span>
              <ArrowRight24Regular />
            </a>
            <a href="/audience-innovation">
              <span className="launcher-icon">
                <img
                  src="/images/sharepoint-logo.svg"
                  alt="SharePoint"
                  width="34"
                  height="34"
                />
              </span>
              <span>
                <small>OUTREACH · INTERACTIVE DEMO</small>View Audience Insight
                &amp; Innovation R&amp;D workspace
              </span>
              <ArrowRight24Regular />
            </a>
            <a href="/logistics/teams?channel=general&tab=Posts">
              <span className="launcher-icon launcher-teams-icon">
                <img
                  src="/images/teams-logo.svg"
                  alt="Microsoft Teams"
                  width="34"
                  height="34"
                />
              </span>
              <span>
                <small>ACQUISITION &amp; ACTIVATION LOGISTICS</small>
                Improved Teams experience
              </span>
              <ArrowRight24Regular />
            </a>
          </div>
        </div>
      </main>
    );
  return (
    <>
      <PrototypeNavigator
        active={prototype}
        teams={location.pathname.startsWith("/logistics/teams")}
      />
      <Suspense
        fallback={
          <div className="workspace-loading" role="status">
            Opening workspace…
          </div>
        }
      >
        {prototype === "audience" ? (
          <AudienceApp />
        ) : prototype === "services" ? (
          <ServicesApp />
        ) : prototype === "service-desk" ? (
          <AccessRequest />
        ) : prototype === "planning" ? (
          <App />
        ) : (
          <LogisticsApp />
        )}
      </Suspense>
    </>
  );
}
