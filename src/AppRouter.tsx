import { useEffect, lazy, Suspense } from "react";
const App = lazy(() => import("./App"));
import PrototypeNavigator from "./components/PrototypeNavigator";
const LogisticsApp = lazy(() => import("./logistics/LogisticsApp"));
const AccessRequest = lazy(() => import("./service-desk/AccessRequest"));
import { pageTitle, prototypeForPath } from "./utils/routes";
import {
  ArrowRight24Regular,
  Folder24Regular,
  PeopleTeam24Regular,
} from "@fluentui/react-icons";
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
                <Folder24Regular />
              </span>
              <span>
                <small>PLANNING & REPORTING</small>View Organisational Planning
                & Reporting
              </span>
              <ArrowRight24Regular />
            </a>
            <a href="/logistics">
              <span className="launcher-icon">
                <PeopleTeam24Regular />
              </span>
              <span>
                <small>CAMPAIGN OPERATIONS</small>View Acquisition & Activation
                Logistics
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
        {prototype === "service-desk" ? (
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
