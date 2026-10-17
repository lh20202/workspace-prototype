import {
  ArrowRight24Regular,
  Organization24Regular,
} from "@fluentui/react-icons";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
} from "@fluentui/react-components";
import "./launcher.css";
import { LanguageToggle } from "../i18n/Language";
import { DemoInfo, proofOfConceptInfoText } from "../components/DemoInfo";
import { BetaBadge } from "../components/BetaBadge";
import { withExplicitStaff } from "../utils/staffNavigation";
import WorkspaceIcon from "../components/WorkspaceIcon";
import { markWelcomeEntry } from "../components/demoControls";
const choices = [
  {
    title: "Organisational Planning & Reporting",
    href: "/planning",
    action: "Explore workspace",
  },
  {
    title: "Acquisition & Activation Logistics",
    href: "/logistics",
    action: "Explore workspace",
  },
];
export default function Launcher() {
  return (
    <main className="prototype-launcher">
      <div className="launcher-language">
        <LanguageToggle />
      </div>
      <div className="launcher-content">
        <h1>Welcome to the Digital Workspace demo site!</h1>
        <img
          className="launcher-sharepoint-cue"
          src="/images/sharepoint-logo.svg"
          alt="SharePoint"
          width="24"
          height="24"
        />
        <p className="launcher-intro">
          Explore what your new workspaces could look and feel like. Switch
          roles to see how the experience changes.
        </p>
        <div className="launcher-explanation">
          <DemoInfo label="Proof of concept" buttonText="Proof of concept">
            {proofOfConceptInfoText}
          </DemoInfo>
        </div>
        <p className="launcher-data-note">
          No company data was used to create this demo site.
        </p>
        <Dialog>
          <DialogTrigger disableButtonEnhancement>
            <button className="launcher-created-link" type="button">
              How was this created?
            </button>
          </DialogTrigger>
          <DialogSurface className="launcher-created-dialog">
            <DialogBody>
              <DialogTitle>How was this created?</DialogTitle>
              <DialogContent>
                <p>
                  This demo was built with AI-assisted coding. The AI was given
                  generic descriptions of typical work and asked to create
                  fictional files, conversations and workflows that feel
                  realistic. No company data was used, and nothing is connected
                  to live Microsoft 365 or business systems.
                </p>
              </DialogContent>
              <DialogActions>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="primary">Close</Button>
                </DialogTrigger>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
        <div className="launcher-choices">
          {choices.map(({ title, href, action }) => (
            <a
              href={withExplicitStaff(href)}
              key={href}
              className="launcher-choice"
              onClick={markWelcomeEntry}
            >
              <WorkspaceIcon />
              <div>
                <div className="launcher-choice-title">
                  <h2>{title}</h2>
                </div>
                <span className="launcher-action">{action}</span>
              </div>
              <ArrowRight24Regular aria-hidden="true" />
            </a>
          ))}
          <article className="launcher-choice launcher-complete-choice">
            <Organization24Regular aria-hidden="true" />
            <div>
              <div className="launcher-choice-title">
                <h2>
                  <a
                    href={withExplicitStaff("/architecture")}
                    className="launcher-complete-link"
                    onClick={markWelcomeEntry}
                  >
                    Explore all workspaces &amp; wikis
                  </a>
                </h2>
                <BetaBadge />
              </div>
              <span className="launcher-action">
                Browse all company workspaces and wikis.
              </span>
            </div>
            <ArrowRight24Regular aria-hidden="true" />
          </article>
        </div>
      </div>
    </main>
  );
}
