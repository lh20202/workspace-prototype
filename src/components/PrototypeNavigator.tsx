import { useEffect, useState } from "react";
import { Warning16Regular } from "@fluentui/react-icons";
export default function PrototypeNavigator({
  active,
  teams = false,
}: {
  active:
    | "launcher"
    | "planning"
    | "logistics"
    | "service-desk"
    | "services"
    | "audience"
    | "content"
    | "finance"
    | "teams"
    | "executive"
    | "governance"
    | "emergency";
  teams?: boolean;
}) {
  const [isTeams, setIsTeams] = useState(teams);
  useEffect(() => {
    const update = () =>
      setIsTeams(location.pathname.startsWith("/logistics/teams"));
    window.addEventListener("popstate", update);
    window.addEventListener("workspace:navigation", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("workspace:navigation", update);
    };
  }, []);
  return (
    <div className="demo-control-frame">
      <nav
        className="prototype-navigator demo-controls"
        aria-label="Demo controls"
      >
        <span>DEMO CONTROLS</span>
        <a href="/" aria-current={active === "launcher" ? "page" : undefined}>
          Workspace prototypes
        </a>
        <a
          href="/planning"
          aria-current={active === "planning" ? "page" : undefined}
        >
          Planning workspace
        </a>
        <a
          href="/logistics"
          aria-current={active === "logistics" ? "page" : undefined}
        >
          Acquisition & Activation Logistics
        </a>
        <a
          href="/services"
          aria-current={active === "services" ? "page" : undefined}
        >
          Organisation Services
        </a>
        <a
          href="/audience-innovation"
          aria-current={active === "audience" ? "page" : undefined}
        >
          Audience Research &amp; Marketing Insight
        </a>
        <a
          href="/content-delivery"
          aria-current={active === "content" ? "page" : undefined}
        >
          Content Creation &amp; Delivery
        </a>
        <a
          href="/financial-operations"
          aria-current={active === "finance" ? "page" : undefined}
        >
          Income &amp; Financial Operations
        </a>
        <a
          href="/executive"
          aria-current={
            active === "executive" ||
            active === "governance" ||
            active === "emergency"
              ? "page"
              : undefined
          }
        >
          CEO &amp; Executive Committee
        </a>
        {isTeams && <a href="/logistics">← Back to logistics workspace</a>}
        <aside className="demo-caveat" aria-label="Demonstration caveat">
          <Warning16Regular aria-hidden="true" />
          <div>
            <strong>Fictional workspace titles</strong>
            <small>Not real site names</small>
          </div>
        </aside>
      </nav>
    </div>
  );
}
