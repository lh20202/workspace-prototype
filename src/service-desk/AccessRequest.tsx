import { workspaceDisplayName } from "../workspaces/presentation";
import ExternalBrandMark from "../components/ExternalBrandMark";
import { adminPlatformById } from "../environments/catalog";
import { useState } from "react";
import { Button } from "@fluentui/react-components";
import {
  CheckmarkCircle24Regular,
  ArrowLeft20Regular,
  TicketDiagonal24Regular,
} from "@fluentui/react-icons";
import { allProjects, projectTitle } from "../projects/data";
import { resolveStaffPerson } from "../intranet/catalog";
import AccessBoundary from "../access/AccessBoundary";
import { LanguageToggle, useTranslation } from "../i18n/Language";
import {
  accessWorkspaceId,
  accessWorkspace,
  accessFocalPoint,
  safeAccessReturn,
} from "../access/model";

export default function AccessRequest() {
  const { t } = useTranslation();
  const params = new URLSearchParams(location.search);
  const isSupport = location.pathname === "/service-desk/it-support";
  const urgent = !isSupport && params.get("urgency") === "urgent";
  const project = allProjects.find(
    (item) => item.code === params.get("project"),
  );
  const requester = resolveStaffPerson(
    params.get("person") || params.get("staff"),
  );
  const workspaceId = isSupport
    ? "digital"
    : accessWorkspaceId(params.get("workspace"), params.get("workspaceId"));
  const area = isSupport
    ? "Service & Platform Operations"
    : params.get("area") || "Restricted Planning";
  const context = {
    workspaceId,
    area,
    department: params.get("department") || undefined,
    personId: requester.id,
    project: project?.code,
  };
  const workspace = accessWorkspace(context);
  const workspaceTitle = workspaceDisplayName(workspaceId, workspace.title);
  const focal = accessFocalPoint(context);
  const requestedLocation =
    params.get("location") || `${workspace.title} / ${area}`;
  const returnPath = safeAccessReturn(params.get("returnTo"), workspace.href);
  const [reason, setReason] = useState(
    urgent
      ? params.get("reason") ||
          `Access to ${area} is time-sensitive and the workspace focal point is unavailable.`
      : "",
  );
  const [submitted, setSubmitted] = useState(false);
  const [reasonEdited, setReasonEdited] = useState(false);
  const requestType = isSupport ? "IT request" : "Urgent access request";
  return (
    <div className="service-desk-app">
      <header className="service-desk-header">
        <div className="service-desk-brand">
          <ExternalBrandMark id="teralink" size={40} />
          <div>
            <strong>Service Desk</strong>
            <span data-no-translate>
              {adminPlatformById.get("teralink")!.name}
            </span>
          </div>
        </div>
        <span className="service-desk-user">{requester.name}</span>
        <LanguageToggle />
      </header>
      <main className="service-desk-main">
        <a className="service-desk-back" href={returnPath}>
          <ArrowLeft20Regular />
          {returnPath.split("?")[0] === "/architecture" ? (
            "Back to all workspaces"
          ) : (
            <>Back to {workspaceTitle}</>
          )}
        </a>
        <div className="service-desk-breadcrumb">
          Help centre <span>/</span>
          {isSupport ? "IT requests & incidents" : "Access & information"}
        </div>
        {!isSupport && !urgent ? (
          <AccessBoundary
            {...context}
            location={requestedLocation}
            returnHref={returnPath}
          />
        ) : submitted ? (
          <section className="request-confirmation" role="status">
            <CheckmarkCircle24Regular />
            <h1>{requestType} prepared</h1>
            <p>
              {isSupport
                ? "Your request is ready for technical triage."
                : "Service Desk will route the request for business authorisation and implement or escalate access where required."}
            </p>
            <div>
              <strong>Requested location</strong>
              <span>{requestedLocation}</span>
              <strong>Requested by</strong>
              <span>{requester.name}</span>
              {!isSupport && (
                <>
                  <strong>Focal point</strong>
                  <span>{focal.name}</span>
                </>
              )}
              <strong>Reason</strong>
              <span
                className="submitted-reason"
                data-no-translate={reasonEdited || undefined}
              >
                {reasonEdited ? reason : t(reason)}
              </span>
            </div>
            <p className="muted">
              Preview only. No ticket is sent. Nothing leaves this browser.
            </p>
            <p>
              <Button
                appearance="primary"
                onClick={() => location.assign(returnPath)}
              >
                Return to workspace
              </Button>
            </p>
          </section>
        ) : (
          <>
            <div className="request-heading">
              <span className="request-icon">
                <TicketDiagonal24Regular />
              </span>
              <div>
                <h1>
                  {isSupport
                    ? "IT requests & technical support"
                    : "Urgent access request"}
                </h1>
                <p>
                  {isSupport
                    ? "Describe the request or incident. First-level support will triage and hand over to a specialist where needed."
                    : "Use this when access is time-sensitive and the workspace focal point is unavailable."}
                </p>
              </div>
            </div>
            {!isSupport && (
              <p>
                Service Desk will route the request for business authorisation
                and implement or escalate access where required.
              </p>
            )}
            <form
              className="access-ticket-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (reason.trim()) setSubmitted(true);
              }}
            >
              {[
                [
                  "Request type",
                  isSupport
                    ? "IT request / incident"
                    : "Urgent access escalation",
                ],
                ["Workspace", workspaceTitle],
                ...(project ? [["Project", projectTitle(project)]] : []),
                ["Area", area],
                ["Requested location", requestedLocation],
                ["Requested by", requester.name],
                ...(!isSupport
                  ? [["Focal point", `${focal.name} · ${focal.role}`]]
                  : []),
              ].map(([label, value]) => (
                <label key={label}>
                  {label}
                  <input readOnly value={t(value)} />
                </label>
              ))}
              <label>
                {isSupport
                  ? "Request or incident description"
                  : "Reason for urgent access"}{" "}
                <span className="required-marker">*</span>
                <textarea
                  required
                  rows={5}
                  value={reasonEdited ? reason : t(reason)}
                  onChange={(event) => {
                    setReason(event.target.value);
                    setReasonEdited(true);
                  }}
                  placeholder={
                    isSupport
                      ? "Describe the service request or technical issue."
                      : "Describe the deadline and why the focal point cannot be reached."
                  }
                />
              </label>
              <p className="muted">
                Preview only. No ticket is sent. Submission stays in this
                browser.
              </p>
              <Button
                type="submit"
                appearance="primary"
                disabled={!reason.trim()}
              >
                {isSupport
                  ? "Prepare request"
                  : "Prepare urgent access request"}
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
