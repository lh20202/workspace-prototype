import { useRef, useState } from "react";
import {
  ArrowRight20Regular,
  CheckmarkCircle20Regular,
  Clock20Regular,
  Person20Regular,
} from "@fluentui/react-icons";
import HubNavigation from "../components/HubNavigation";
import { resolveStaffPerson } from "../intranet/catalog";
import "./styles.css";

/** Immediate shift activity stays separate from working files and reference knowledge. */
export default function FrontlineApp() {
  const person = resolveStaffPerson(
    new URLSearchParams(location.search).get("staff"),
  );
  const [briefingConfirmed, setBriefingConfirmed] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [handoverDraft, setHandoverDraft] = useState("");
  const [savedHandover, setSavedHandover] = useState("");
  const handoverButton = useRef<HTMLButtonElement>(null);
  const href = (destination: string) => {
    const target = new URL(destination, location.href);
    target.searchParams.set("staff", person.id);
    return `${target.pathname}${target.search}${target.hash}`;
  };
  return (
    <div className="frontline-portal">
      <a className="skip-link" href="#frontline-main">
        Skip to today's work
      </a>
      <HubNavigation workspaceId="frontline-sales" />
      <header className="frontline-header">
        <div className="frontline-header-inner">
          <div className="frontline-identity">
            <img src="/images/company-mark.png" alt="" width="36" height="36" />
            <div>
              <span>Frontline Sales Portal</span>
              <h1>Ready for today</h1>
            </div>
          </div>
          <div className="frontline-person">
            <Person20Regular aria-hidden="true" />
            <span>{person.name}</span>
          </div>
        </div>
      </header>
      <main id="frontline-main" className="frontline-main">
        <div className="frontline-today-grid">
          <section
            className="frontline-briefing"
            aria-labelledby="today-briefing"
          >
            <div className="frontline-section-label">Today</div>
            <h2 id="today-briefing">Today's briefing</h2>
            <p className="frontline-lead">
              A clear start to every conversation.
            </p>
            <p>
              Introduce the current welcome offer, check what the customer needs
              and agree one clear next step. Confirm contact preferences before
              arranging a follow-up.
            </p>
            <button
              className="frontline-primary"
              disabled={briefingConfirmed}
              onClick={() => setBriefingConfirmed(true)}
            >
              {briefingConfirmed ? (
                <CheckmarkCircle20Regular aria-hidden="true" />
              ) : null}
              {briefingConfirmed ? "Briefing confirmed" : "Confirm briefing"}
            </button>
            {briefingConfirmed && (
              <p className="frontline-feedback" role="status">
                Briefing confirmed for this session.
              </p>
            )}
          </section>
          <section className="frontline-shift" aria-labelledby="today-shift">
            <div className="frontline-section-label">My shift / cover</div>
            <h2 id="today-shift">Central team</h2>
            <p className="frontline-shift-time">
              <Clock20Regular aria-hidden="true" />
              09:00–17:00
            </p>
            <dl>
              <div>
                <dt>Team lead</dt>
                <dd>Maya Chen</dd>
              </div>
              <div>
                <dt>Cover contact</dt>
                <dd>Jordan Lee</dd>
              </div>
            </dl>
            <button
              className="frontline-secondary"
              disabled={checkedIn}
              onClick={() => setCheckedIn(true)}
            >
              {checkedIn ? "Checked in" : "Check in for this shift"}
            </button>
            {checkedIn && (
              <p className="frontline-feedback" role="status">
                Check-in recorded for this session.
              </p>
            )}
          </section>
        </div>
        <div className="frontline-work-grid">
          <section
            className="frontline-conversation"
            aria-labelledby="conversation-focus"
          >
            <div className="frontline-section-label">Customer conversation</div>
            <h2 id="conversation-focus">Current welcome offer</h2>
            <p>
              Explain the standard welcome option clearly. Check eligibility and
              the customer's preferred next step before making a commitment.
            </p>
            <button
              className="frontline-text-action"
              aria-expanded={guideOpen}
              aria-controls="frontline-conversation-guide"
              onClick={() => setGuideOpen(!guideOpen)}
            >
              {guideOpen
                ? "Close conversation checklist"
                : "Open conversation checklist"}
              <ArrowRight20Regular aria-hidden="true" />
            </button>
            {guideOpen && (
              <ol
                id="frontline-conversation-guide"
                className="frontline-checklist"
              >
                <li>Ask what matters to the customer today.</li>
                <li>Explain the offer and confirm understanding.</li>
                <li>Agree the next step and confirm contact preferences.</li>
              </ol>
            )}
          </section>
          <section
            className="frontline-handover"
            aria-labelledby="handover-title"
          >
            <div className="frontline-section-label">Quick action</div>
            <h2 id="handover-title">Keep cover up to date</h2>
            <p>Leave a short availability or cover note for this shift.</p>
            <button
              className="frontline-secondary"
              ref={handoverButton}
              aria-expanded={handoverOpen}
              aria-controls="frontline-handover-form"
              onClick={() => setHandoverOpen(!handoverOpen)}
            >
              {handoverOpen ? "Close handover note" : "Add a handover note"}
            </button>
            {handoverOpen && (
              <form
                id="frontline-handover-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!handoverDraft.trim()) return;
                  setSavedHandover(handoverDraft.trim());
                  setHandoverDraft("");
                  setHandoverOpen(false);
                  handoverButton.current?.focus();
                }}
              >
                <label htmlFor="frontline-cover-note">Coverage note</label>
                <textarea
                  id="frontline-cover-note"
                  value={handoverDraft}
                  onChange={(event) => setHandoverDraft(event.target.value)}
                  placeholder="Availability or cover only; no customer details."
                  rows={3}
                />
                <button
                  className="frontline-primary"
                  disabled={!handoverDraft.trim()}
                >
                  Save for this session
                </button>
              </form>
            )}
            {savedHandover && (
              <div className="frontline-saved-note">
                <p data-no-translate>{savedHandover}</p>
                <p className="frontline-feedback" role="status">
                  Saved for this session. No update is sent.
                </p>
              </div>
            )}
          </section>
        </div>
        <footer className="frontline-help">
          <h2>Need help with today's work?</h2>
          <div>
            <a href={href("/logistics")}>
              Shift &amp; operations
              <ArrowRight20Regular aria-hidden="true" />
            </a>
            <a href={href("/customer-relations")}>
              Customer care
              <ArrowRight20Regular aria-hidden="true" />
            </a>
            <a href={href("/sales-marketing/wiki")}>
              Sales &amp; Marketing Wiki
              <ArrowRight20Regular aria-hidden="true" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
