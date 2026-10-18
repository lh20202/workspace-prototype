import ArchitectureContent from "./ArchitectureContent";
import "./architecture-page.css";
import PrototypeNavigator from "../components/PrototypeNavigator";
import StaffLink from "../components/StaffLink";
import { LanguageToggle } from "../i18n/Language";
import { GridDots24Regular } from "@fluentui/react-icons";
import "./styles.css";
import "./launcher.css";
import "../coordination/styles.css";
import "../executive/styles.css";
import "../workspaces/styles.css";
import "./architecture-hubs.css";

export default function Directory() {
  return (
    <div className="architecture-poc-page">
      <PrototypeNavigator />
      <StaffLink className="skip-link" href="#directory-main">
        Skip to workspaces
      </StaffLink>
      <div className="intranet-directory">
        <header className="directory-brand">
          <GridDots24Regular aria-hidden="true" />
          <strong>Site</strong>
          <span className="directory-brand-end">Company intranet</span>
          <LanguageToggle />
        </header>
        <nav
          className="directory-nav"
          aria-label="Intranet navigation"
          aria-description="Other intranet sections are shown only to establish context and are unavailable in this proof of concept."
        >
          <img
            className="directory-company-mark"
            src="/images/company-mark.png"
            alt=""
            width="40"
            height="32"
          />
          <strong>Sample Organisation</strong>
          {["Home", "News", "Our organisation", "Tools & support"].map((x) => (
            <button type="button" key={x} disabled>
              {x}
            </button>
          ))}
          <StaffLink href="/architecture" aria-current="page">
            Digital Workspaces
          </StaffLink>
        </nav>
        <main className="directory-main" id="directory-main">
          <div className="directory-heading">
            <div>
              <h1>Digital workspaces</h1>
              <p>Find the shared space for your work.</p>
            </div>
          </div>
          <ArchitectureContent />
        </main>
      </div>
    </div>
  );
}
