import {
  ArrowRight24Regular,
  Folder24Regular,
  PeopleTeam24Regular,
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
const choices = [
  {
    title: "Organisational Planning & Reporting",
    href: "/planning",
    action: "Explore this workspace",
    Icon: Folder24Regular,
  },
  {
    title: "Acquisition & Activation Logistics",
    href: "/logistics",
    action: "Explore this workspace",
    Icon: PeopleTeam24Regular,
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
        <p className="launcher-intro">
          Explore what your new Digital Workspaces could look and feel like. Try
          the examples below, switch roles and see how access changes.
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
                  This demo was built with AI-assisted coding and standard web
                  technology. The AI was given generic descriptions of how an
                  organisation might work and used fictional names, files,
                  conversations and workflows to make the examples feel
                  realistic. No company data was used.
                </p>
                <p>
                  The Microsoft-style screens are simulations — they aren&apos;t
                  connected to live SharePoint, Teams or business systems.
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
          {choices.map(({ title, href, action, Icon }) => (
            <a
              href={withExplicitStaff(href)}
              key={href}
              className="launcher-choice"
            >
              <Icon aria-hidden="true" />
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
                  >
                    Explore all workspaces &amp; wikis
                  </a>
                </h2>
                <BetaBadge />
              </div>
              <span className="launcher-action">
                Browse the complete demo, including workspaces, Wikis, portals
                and role-based access.
              </span>
            </div>
            <ArrowRight24Regular aria-hidden="true" />
          </article>
        </div>
      </div>
    </main>
  );
}
