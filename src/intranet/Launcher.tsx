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
import WorkspaceFAQ from "../components/WorkspaceFAQ";
import {
  creationExplanation,
  workspaceDemoIntro,
  workspaceDemoStage,
} from "../components/workspaceFAQContent";
const choices = [
  {
    title: "Planning",
    href: "/planning",
    action: "Explore workspace",
  },
  {
    title: "Acquisitions",
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
        <h1>Welcome to the Digital Workspace demo!</h1>
        <img
          className="launcher-sharepoint-cue"
          src="/images/sharepoint-logo.svg"
          alt="Workspace"
          width="24"
          height="24"
        />
        <p className="launcher-intro">{workspaceDemoIntro}</p>
        <p className="launcher-stage-note">{workspaceDemoStage}</p>
        <div className="launcher-explanation">
          <DemoInfo label="Proof of concept" buttonText="Proof of concept">
            {proofOfConceptInfoText}
          </DemoInfo>
        </div>
        <p className="launcher-data-note">{proofOfConceptInfoText}</p>
        <div className="launcher-secondary-links">
          <Dialog>
            <DialogTrigger disableButtonEnhancement>
              <button className="launcher-created-link" type="button">
                What am I looking at?
              </button>
            </DialogTrigger>
            <DialogSurface className="launcher-created-dialog">
              <DialogBody>
                <DialogTitle>What am I looking at?</DialogTitle>
                <DialogContent>
                  <p>{creationExplanation}</p>
                </DialogContent>
                <DialogActions>
                  <DialogTrigger disableButtonEnhancement>
                    <Button appearance="primary">Close</Button>
                  </DialogTrigger>
                </DialogActions>
              </DialogBody>
            </DialogSurface>
          </Dialog>
          <WorkspaceFAQ />
        </div>
        <h2 className="launcher-demos-heading">
          Explore these workspace demos
        </h2>
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
                  <h3>{title}</h3>
                </div>
                <span className="launcher-action">{action}</span>
              </div>
              <ArrowRight24Regular aria-hidden="true" />
            </a>
          ))}
        </div>
        <h2 className="launcher-development-heading">In development</h2>
        <article className="launcher-choice launcher-complete-choice">
          <Organization24Regular aria-hidden="true" />
          <div>
            <div className="launcher-choice-title">
              <h3>
                <a
                  href={withExplicitStaff("/architecture")}
                  className="launcher-complete-link"
                  onClick={markWelcomeEntry}
                >
                  Explore all workspaces &amp; wikis
                </a>
              </h3>
              <BetaBadge />
            </div>
            <span className="launcher-action">
              Browse all company workspaces and wikis.
            </span>
          </div>
          <ArrowRight24Regular aria-hidden="true" />
        </article>
      </div>
    </main>
  );
}
