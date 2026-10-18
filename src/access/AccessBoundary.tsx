import { useState } from "react";
import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
} from "@fluentui/react-components";
import { Dismiss20Regular } from "@fluentui/react-icons";
import { selectedStaffId } from "../intranet/catalog";
import { useTranslation } from "../i18n/Language";
import { withExplicitStaff } from "../utils/staffNavigation";
import { usePreviewRoleContext } from "../components/PreviewRoleContext";
import PreviewRolePrompt from "../components/PreviewRolePrompt";
import { workspaceDisplayName } from "../workspaces/presentation";
import AccessLock from "../components/AccessLock";
import EnvironmentIcon from "../components/EnvironmentIcon";
import { hasAlternativePreviewAccess, type AccessResource } from "./policy";
import {
  accessFocalPoint,
  accessWorkspace,
  frontlineSalesFocalPoint,
  isSalesAccessContext,
  urgentAccessHref,
  type AccessContext,
  type AccessFocalPoint,
} from "./model";
import "./styles.css";

export interface AccessBoundaryProps extends AccessContext {
  headingLevel?: 1 | 2;
  strict?: boolean;
  sensitivity?: "Confidential" | "Strictly confidential";
  compact?: boolean;
  returnLabel?: string;
  /** Exact business destination or Teams participation boundary for the role cue. */
  resource?: AccessResource;
}
export default function AccessBoundary({
  headingLevel = 1,
  strict = false,
  sensitivity,
  compact = false,
  returnLabel = "Return to workspace",
  resource,
  ...requestedContext
}: AccessBoundaryProps) {
  const { t, language } = useTranslation();
  const context = {
    ...requestedContext,
    personId:
      requestedContext.personId ||
      (typeof sessionStorage === "undefined" ? "taylor" : selectedStaffId()),
  };
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const classification = strict ? "Strictly confidential" : sensitivity;
  const workspace = accessWorkspace(context);
  const workspaceTitle = workspaceDisplayName(
    context.workspaceId,
    workspace.title,
    resource?.kind === "area" ? resource.areaId : undefined,
  );
  const focal = accessFocalPoint(context);
  const sales = isSalesAccessContext(context);
  const wiki = context.workspaceId === "sales-wiki";
  const preview = usePreviewRoleContext();
  const showRoleHelper = !!(
    preview &&
    resource &&
    hasAlternativePreviewAccess(resource, context.personId)
  );
  const [contactOpen, setContactOpen] = useState(false);
  const [contact, setContact] = useState<AccessFocalPoint>(focal);
  const [message, setMessage] = useState(`I need access to ${context.area}. `);
  const [messageEdited, setMessageEdited] = useState(false);
  const [prepared, setPrepared] = useState(false);
  const openContact = (person: AccessFocalPoint) => {
    setContact(person);
    setPrepared(false);
    setMessageEdited(false);
    setMessage(
      person.id === frontlineSalesFocalPoint.id
        ? "I have a question about the Local Crew Portal. "
        : `I need access to ${context.area}. `,
    );
    setContactOpen(true);
  };
  const urgent = (
    <div className="access-boundary-urgent">
      <p>Urgent access needed and your focal point is unavailable?</p>
      <a href={withExplicitStaff(urgentAccessHref(context))}>
        Raise urgent access request
      </a>
    </div>
  );
  const workspaceContact = (
    <>
      {wiki ? (
        <p>
          <strong>{focal.name}</strong> is the focal point for this Wiki.
        </p>
      ) : language === "de" ? (
        <p>
          Sie benötigen Zugriff? Wenden Sie sich an{" "}
          <strong>{focal.name}</strong>, Ihre Ansprechperson für den
          Arbeitsbereich „{t(workspaceTitle)}“.
        </p>
      ) : (
        <p>
          Need access? Contact <strong>{focal.name}</strong>, the{" "}
          {workspaceTitle} focal point.
        </p>
      )}
      <Button appearance="primary" onClick={() => openContact(focal)}>
        {wiki
          ? "Contact Wiki focal point"
          : sales
            ? "Contact workspace focal point"
            : "Contact focal point"}
      </Button>
    </>
  );
  return (
    <>
      <div
        className={
          sales
            ? "access-boundary-layout access-boundary-sales"
            : "access-boundary-layout"
        }
      >
        <div className="access-boundary-main">
          <section
            className={`access-boundary${strict ? " access-boundary-strict" : ""}${compact ? " access-boundary-compact" : ""}`}
          >
            <AccessLock
              size={28}
              className="access-boundary-lock"
              labelled={false}
            />
            {classification && (
              <span className="access-boundary-sensitivity">
                {classification}
              </span>
            )}
            <Heading>Access required</Heading>
            <p className="access-boundary-area">{context.area}</p>
            <p>
              {wiki
                ? "This knowledge area is outside the frontline view."
                : "This area is limited to authorised participants."}
            </p>
            {!sales && (
              <>
                {workspaceContact}
                {urgent}
              </>
            )}
            <a
              className="access-boundary-return"
              href={withExplicitStaff(context.returnHref || workspace.href)}
            >
              {returnLabel}
            </a>
          </section>
          {showRoleHelper && (
            <PreviewRolePrompt
              actionLabel="Try another preview role"
              description="Some preview roles can access this area."
            />
          )}
        </div>
        {sales && (
          <aside
            className="access-sales-alternative"
            aria-label="Frontline sales alternative and access contacts"
          >
            <h2>Are you frontline sales staff?</h2>
            <p>
              Go to the Local Crew Portal for the information and tools used in
              day-to-day frontline work.
            </p>
            <a
              className="access-sales-portal-link"
              href={withExplicitStaff("/frontline-sales")}
            >
              <EnvironmentIcon type="portal" size={18} />
              Open Local Crew Portal <span aria-hidden="true">→</span>
            </a>
            <div className="access-sales-contact">
              <h3>Frontline sales focal point</h3>
              <p>
                <strong>{frontlineSalesFocalPoint.name}</strong>
                <br />
                {frontlineSalesFocalPoint.role}
              </p>
              <Button
                appearance="secondary"
                onClick={() => openContact(frontlineSalesFocalPoint)}
              >
                Contact focal point
              </Button>
            </div>
            <div className="access-sales-contact">
              <h3>
                {wiki
                  ? "Need access to this Wiki area instead?"
                  : "Need access to this workspace instead?"}
              </h3>
              {workspaceContact}
              {urgent}
            </div>
          </aside>
        )}
      </div>
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
          <h2>{contact.name}</h2>
          <p>{contact.role}</p>
          <p>
            {contact.id === frontlineSalesFocalPoint.id
              ? "Frontline sales focal point"
              : `Access focal point · ${workspaceTitle}`}
          </p>
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
          {prepared && (
            <p role="status">Message prepared for {contact.name}.</p>
          )}
          <p className="muted">Preview only. No message is sent.</p>
        </DrawerBody>
      </Drawer>
    </>
  );
}
