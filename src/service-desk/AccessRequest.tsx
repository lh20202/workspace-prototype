import { useState } from "react";
import { Button } from "@fluentui/react-components";
import {
  CheckmarkCircle24Regular,
  ArrowLeft20Regular,
  TicketDiagonal24Regular,
} from "@fluentui/react-icons";
import { currentUser } from "../data/workspace";
export default function AccessRequest() {
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const requestedLocation =
    new URLSearchParams(location.search).get("location") ||
    "Organisational Planning & Reporting / Restricted Planning";
  return (
    <div className="service-desk-app">
      <header className="service-desk-header">
        <div className="service-desk-brand">
          <span className="jira-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <div>
            <strong>Service Desk</strong>
            <span>Jira Service Management</span>
          </div>
        </div>
        <span className="service-desk-user">
          <img src="/maya-avatar.svg" alt="Maya Chen" />
          Maya Chen
        </span>
      </header>
      <main className="service-desk-main">
        <a className="service-desk-back" href="/planning/restricted">
          <ArrowLeft20Regular />
          Back to Restricted Planning
        </a>
        <div className="service-desk-breadcrumb">
          Help centre <span>/</span> Access & information
        </div>
        {submitted ? (
          <section className="request-confirmation" role="status">
            <CheckmarkCircle24Regular />
            <h1>Access request DEMO-1042 submitted.</h1>
            <p>Your request is ready for the access review.</p>
            <div>
              <strong>Requested location</strong>
              <span>{requestedLocation}</span>
              <strong>Requested by</strong>
              <span>{currentUser.name}</span>
              <strong>Reason</strong>
              <span className="submitted-reason">{reason}</span>
            </div>
            <p className="simulation-note">
              Demonstration only. No ticket was sent and no data left this
              browser.
            </p>
            <Button
              appearance="primary"
              onClick={() => window.location.assign("/planning/restricted")}
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
                <h1>Request access</h1>
                <p>Tell us why you need access to this information.</p>
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
                ["Request type", "Access to restricted information"],
                ["Workspace", "Organisational Planning & Reporting"],
                ["Area", "Restricted Planning"],
                ["Requested location", requestedLocation],
                ["Requested by", currentUser.name],
              ].map(([label, value]) => (
                <label key={label}>
                  {label}
                  <input readOnly value={value} />
                </label>
              ))}
              <label>
                Reason for needing access{" "}
                <span className="required-marker">*</span>
                <textarea
                  required
                  rows={5}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain what you need to access and why."
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
