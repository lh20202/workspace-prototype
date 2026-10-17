import { useId, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from "@fluentui/react-components";
import SensitivityBadge from "../sharepoint/SensitivityBadge";
import { useTranslation } from "../i18n/Language";
import { logframeDocument } from "./teams";
import "./planning-teams.css";

/** Illustrative contents of the existing Logframe, not a second file or List. */
export const logframeOutcomes = [
  {
    outcome: "A more consistent customer experience",
    indicator: "Customer enquiries resolved within the agreed response time",
    baseline: "82%",
    target: "90%",
  },
  {
    outcome: "Clearer department plans and reporting",
    indicator: "Department submissions complete by the planning deadline",
    baseline: "5 of 6 departments",
    target: "6 of 6 departments",
  },
  {
    outcome: "More reliable operational handovers",
    indicator: "Scheduled handovers completed with an agreed owner",
    baseline: "88%",
    target: "",
  },
];

export function LogframeFields({
  outcome,
  onTargetChange,
}: {
  outcome: (typeof logframeOutcomes)[number];
  onTargetChange: (value: string) => void;
}) {
  const targetHintId = useId();
  const { t } = useTranslation();
  return (
    <div className="planning-view-fields">
      <label>
        Outcome
        <input value={t(outcome.outcome)} readOnly />
      </label>
      <label>
        Indicator
        <textarea value={t(outcome.indicator)} readOnly />
      </label>
      <label>
        Baseline
        <input value={t(outcome.baseline)} readOnly />
      </label>
      <label>
        Target
        <input
          value={t(outcome.target)}
          required
          aria-label="Target"
          aria-invalid={!outcome.target.trim()}
          aria-describedby={!outcome.target.trim() ? targetHintId : undefined}
          onChange={(event) => onTargetChange(event.target.value)}
        />
        {!outcome.target.trim() && (
          <span className="planning-field-hint" id={targetHintId}>
            Add a target before submitting this outcome.
          </span>
        )}
      </label>
    </div>
  );
}

export function PlanningLogframeView({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [outcomes, setOutcomes] = useState(logframeOutcomes);
  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => {
        if (!data.open) onClose();
      }}
    >
      <DialogSurface
        className="planning-working-view"
        data-document-id={logframeDocument.id}
      >
        <DialogBody>
          <DialogTitle>Logframe</DialogTitle>
          <DialogContent>
            <p className="planning-file-context">
              {logframeDocument.name}
              <SensitivityBadge value={logframeDocument.sensitivity} />
            </p>
            <div className="planning-view-step">
              <strong>
                Outcome {index + 1} / {outcomes.length}
              </strong>
              <nav aria-label="Logframe outcomes">
                <Button
                  disabled={index === 0}
                  onClick={() => setIndex(index - 1)}
                >
                  Previous
                </Button>
                <Button
                  disabled={index === outcomes.length - 1}
                  onClick={() => setIndex(index + 1)}
                >
                  Next
                </Button>
              </nav>
            </div>
            <LogframeFields
              outcome={outcomes[index]}
              onTargetChange={(target) =>
                setOutcomes(
                  outcomes.map((outcome, position) =>
                    position === index ? { ...outcome, target } : outcome,
                  ),
                )
              }
            />
            <p className="planning-view-note">
              Changes stay in this preview until you reload.
            </p>
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={onClose}>
              Done
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

export function PlanningRegistrationForm({ userName }: { userName: string }) {
  const [submitted, setSubmitted] = useState(false);
  if (submitted)
    return (
      <p role="status">
        Registration preview complete. No information has been sent or stored.
      </p>
    );
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <p>
        Please share any requirements with the event coordinator using this
        form.
      </p>
      <div className="planning-view-fields">
        <label>
          Name
          <input defaultValue={userName} autoComplete="off" required />
        </label>
        <label>
          Dietary requirements
          <textarea autoComplete="off" />
        </label>
        <label>
          Accessibility requirements
          <textarea autoComplete="off" />
        </label>
      </div>
      <p className="planning-view-note">
        Fictional registration · nothing is sent or stored.
      </p>
      <Button type="submit" appearance="primary">
        Complete registration preview
      </Button>
    </form>
  );
}

export function PlanningRegistration({
  open,
  onClose,
  userName,
}: {
  open: boolean;
  onClose: () => void;
  userName: string;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => {
        if (!data.open) onClose();
      }}
    >
      <DialogSurface className="planning-working-view">
        <DialogBody>
          <DialogTitle>Strategy away-day registration</DialogTitle>
          <DialogContent>
            {open && <PlanningRegistrationForm userName={userName} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Close</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
