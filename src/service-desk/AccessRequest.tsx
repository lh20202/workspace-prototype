import { workspaceRegistry } from "../workspaces/registry";
import { useState } from "react";
import { Button } from "@fluentui/react-components";
import {
  CheckmarkCircle24Regular,
  ArrowLeft20Regular,
  TicketDiagonal24Regular,
} from "@fluentui/react-icons";
import { currentUser } from "../data/workspace";
import { allProjects, projectTitle } from "../projects/data";
import { staff, selectedStaffId } from "../intranet/catalog";
export default function AccessRequest() {
  const params = new URLSearchParams(location.search);
  const project = allProjects.find((p) => p.code === params.get("project"));
  const projectRequest =
    params.get("workspace") === "Projects" ||
    params.get("workspace") === "projects";
  const requester =
    staff.find(
      (person) => person.id === (params.get("person") || params.get("staff")),
    ) ||
    staff.find((person) => person.id === selectedStaffId()) ||
    currentUser;
  const isSupport = location.pathname === "/service-desk/it-support";
  const workspace = isSupport
    ? "Digital & Technology"
    : params.get("workspace") || "Organisational Planning & Reporting";
  const area = isSupport
    ? "Service & Platform Operations"
    : params.get("area") || "Restricted Planning";
  const digital = workspace === "Digital & Technology";
  const services = workspace === "Organisation Services";
  const audience =
    workspace === "Audience Research & Marketing Insight" ||
    workspace === "Audience Insight & Innovation R&D";
  const content =
    workspace === "Content Creation & Delivery" || workspace === "Content Room";
  const registeredWorkspace = workspaceRegistry.find(
    (entry) => entry.title === workspace || entry.id === workspace,
  );
  const finance = workspace === "Income & Financial Operations";
  const executive = workspace === "CEO & Executive Committee";
  const freshservice = !projectRequest;
  const returnPath = projectRequest
    ? "/projects"
    : digital
      ? "/digital-tech/operations"
      : executive
        ? "/executive"
        : finance
          ? "/financial-operations"
          : content
            ? "/content-delivery"
            : audience
              ? "/audience-innovation/research"
              : services
                ? "/services"
                : registeredWorkspace?.href || "/planning/restricted";
  const requestType = isSupport ? "IT request" : "Access request";
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const requestedLocation = params.get("location") || `${workspace} / ${area}`;
  return (
    <div className="service-desk-app">
      <header className="service-desk-header">
        <div className="service-desk-brand">
          <span
            className={freshservice ? "freshservice-mark" : "jira-mark"}
            aria-hidden="true"
          >
            {freshservice ? (
              <TicketDiagonal24Regular />
            ) : (
              <>
                <i />
                <i />
                <i />
              </>
            )}
          </span>
          <div>
            <strong>Service Desk</strong>
            <span>
              {freshservice ? "Freshservice" : "Jira Service Management"}
            </span>
          </div>
        </div>
        <span className="service-desk-user">
          <img
            src="/maya-avatar.svg"
            alt={`Illustrated avatar of ${requester.name}`}
          />
          {requester.name}
        </span>
      </header>
      <main className="service-desk-main">
        <a className="service-desk-back" href={returnPath}>
          <ArrowLeft20Regular />
          Back to{" "}
          {projectRequest
            ? "Projects"
            : digital
              ? "Digital & Technology"
              : executive
                ? "CEO & Executive Committee"
                : finance
                  ? "Income & Financial Operations"
                  : content
                    ? "Content Room"
                    : audience
                      ? "Audience research"
                      : services
                        ? "Organisation Services"
                        : registeredWorkspace?.title || "Restricted Planning"}
        </a>
        <div className="service-desk-breadcrumb">
          Help centre <span>/</span>{" "}
          {isSupport ? "IT requests & incidents" : "Access & information"}
        </div>
        {submitted ? (
          <section className="request-confirmation" role="status">
            <CheckmarkCircle24Regular />
            <h1>{requestType} DEMO-1042 submitted.</h1>
            <p>Your request is ready for review.</p>
            <div>
              {project && (
                <>
                  <strong>Project</strong>
                  <span>{projectTitle(project)}</span>
                </>
              )}
              <strong>Requested location</strong>
              <span>{requestedLocation}</span>
              <strong>Requested by</strong>
              <span>{requester.name}</span>
              <strong>Reason</strong>
              <span className="submitted-reason">{reason}</span>
            </div>
            <p className="simulation-note">
              Demonstration only. No ticket was sent and no data left this
              browser.
            </p>
            <Button
              appearance="primary"
              onClick={() => window.location.assign(returnPath)}
            >
              Return to workspace
            </Button>
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
                    : "Request access"}
                </h1>
                <p>
                  {isSupport
                    ? "Describe the request or incident. First-level support will triage and hand over to a specialist where needed."
                    : "Tell us why you need access to this information."}
                </p>
              </div>
            </div>
            <form
              className="access-ticket-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (reason.trim()) setSubmitted(true);
              }}
            >
              {[
                [
                  "Request type",
                  projectRequest
                    ? "Project workspace access"
                    : isSupport
                      ? "IT request / incident"
                      : "Access to restricted information",
                ],
                ["Workspace", workspace],
                ...(project ? [["Project", projectTitle(project)]] : []),
                ["Area", area],
                ["Requested location", requestedLocation],
                ["Requested by", requester.name],
              ].map(([label, value]) => (
                <label key={label}>
                  {label}
                  <input readOnly value={value} />
                </label>
              ))}
              <label>
                {isSupport
                  ? "Request or incident description"
                  : "Reason for needing access"}{" "}
                <span className="required-marker">*</span>
                <textarea
                  required
                  rows={5}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    isSupport
                      ? "Describe the service request or technical issue."
                      : "Explain what you need to access and why."
                  }
                />
              </label>
              <p className="simulation-note">
                Demonstration only. Submission stays in this browser.
              </p>
              <Button
                type="submit"
                appearance="primary"
                disabled={!reason.trim()}
              >
                Submit request
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
