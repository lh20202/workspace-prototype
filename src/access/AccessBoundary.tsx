import { useState } from "react";
import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
} from "@fluentui/react-components";
import { Dismiss20Regular, LockClosed24Regular } from "@fluentui/react-icons";
import { selectedStaffId } from "../intranet/catalog";
import { useTranslation } from "../i18n/Language";
import {
  accessFocalPoint,
  accessWorkspace,
  urgentAccessHref,
  type AccessContext,
} from "./model";
import "./styles.css";

export interface AccessBoundaryProps extends AccessContext {
  headingLevel?: 1 | 2;
  strict?: boolean;
  compact?: boolean;
  returnLabel?: string;
}
export default function AccessBoundary({
  headingLevel = 1,
  strict = false,
  compact = false,
  returnLabel = "Return to workspace",
  ...requestedContext
}: AccessBoundaryProps) {
  const { t, language } = useTranslation();
  const context = {
    ...requestedContext,
    personId:
      requestedContext.personId ||
      (typeof sessionStorage === "undefined" ? "maya" : selectedStaffId()),
  };
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const workspace = accessWorkspace(context);
  const focal = accessFocalPoint(context);
  const [contactOpen, setContactOpen] = useState(false);
  const [message, setMessage] = useState(`I need access to ${context.area}. `);
  const [messageEdited, setMessageEdited] = useState(false);
  const [prepared, setPrepared] = useState(false);
  return (
    <>
      <section
        className={`access-boundary${strict ? " access-boundary-strict" : ""}${compact ? " access-boundary-compact" : ""}`}
      >
        <LockClosed24Regular className="access-boundary-lock" />
        {strict && (
          <span className="access-boundary-sensitivity">
            Strictly confidential
          </span>
        )}
        <Heading>Access required</Heading>
        <p className="access-boundary-area">{context.area}</p>
        <p>This area is limited to authorised participants.</p>
        {language === "de" ? (
          <p>
            Sie benötigen Zugriff? Wenden Sie sich an{" "}
            <strong>{focal.name}</strong>, Ihre Ansprechperson für den
            Arbeitsbereich „{t(workspace.title)}“.
          </p>
        ) : (
          <p>
            Need access? Contact <strong>{focal.name}</strong>, the{" "}
            {workspace.title} focal point.
          </p>
        )}
        <Button
          appearance="primary"
          onClick={() => {
            setPrepared(false);
            setContactOpen(true);
          }}
        >
          Contact focal point
        </Button>
        <div className="access-boundary-urgent">
          <p>Urgent access needed and your focal point is unavailable?</p>
          <a href={urgentAccessHref(context)}>Raise urgent access request</a>
        </div>
        <a
          className="access-boundary-return"
          href={context.returnHref || workspace.href}
        >
          {returnLabel}
        </a>
      </section>
      <Drawer
        open={contactOpen}
        position="end"
        onOpenChange={(_, data) => setContactOpen(data.open)}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss20Regular />}
                aria-label="Close focal point contact"
                onClick={() => setContactOpen(false)}
              />
            }
          >
            Contact focal point
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody className="access-contact-panel">
          <h2>{focal.name}</h2>
          <p>{focal.role}</p>
          <p>Access focal point · {workspace.title}</p>
          <label>
            Message
            <textarea
              value={messageEdited ? message : t(message)}
              onChange={(event) => {
                setMessage(event.target.value);
                setMessageEdited(true);
                setPrepared(false);
              }}
              rows={5}
            />
          </label>
          <Button
            appearance="primary"
            disabled={!message.trim()}
            onClick={() => setPrepared(true)}
          >
            Prepare message
          </Button>
          {prepared && <p role="status">Message prepared for {focal.name}.</p>}
          <p className="muted">Preview only. No message is sent.</p>
        </DrawerBody>
      </Drawer>
    </>
  );
}
