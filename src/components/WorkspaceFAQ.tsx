import { useId } from "react";
import {
  Button,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
} from "@fluentui/react-components";
import { QuestionCircle16Regular } from "@fluentui/react-icons";
import { useTranslation } from "../i18n/Language";
import {
  workspaceFAQQuestions,
  workspaceFAQSubmittedQuestion,
  workspaceFAQForm,
} from "./workspaceFAQContent";
import "./workspace-faq.css";

export function WorkspaceFAQContent() {
  const { t } = useTranslation();
  const formId = useId();
  return (
    <>
      <Accordion
        collapsible
        multiple
        defaultOpenItems={[]}
        className="workspace-faq-accordion"
      >
        {[...workspaceFAQQuestions, workspaceFAQSubmittedQuestion].map(
          ({ id, question, answer }) => (
            <AccordionItem
              value={id}
              key={id}
              className="workspace-faq-question"
              data-faq-id={id}
            >
              <AccordionHeader as="h3" size="small" expandIconPosition="end">
                <span data-no-translate>{t(question)}</span>
              </AccordionHeader>
              <AccordionPanel className="workspace-faq-answer">
                <p data-no-translate>{t(answer)}</p>
              </AccordionPanel>
            </AccordionItem>
          ),
        )}
      </Accordion>
      <form
        className="workspace-faq-form"
        aria-labelledby={`${formId}-heading`}
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="workspace-faq-form-heading">
          <h3 id={`${formId}-heading`} data-no-translate>
            {t(workspaceFAQForm.heading)}
          </h3>
          <span className="workspace-faq-coming-soon">COMING SOON</span>
        </div>
        <p id={`${formId}-help`} data-no-translate>
          {t(workspaceFAQForm.support)}
        </p>
        <label
          className="workspace-faq-label"
          htmlFor={`${formId}-question`}
          data-no-translate
        >
          {t(workspaceFAQForm.label)}
        </label>
        <div className="workspace-faq-coming-soon-field">
          <textarea
            id={`${formId}-question`}
            className="workspace-faq-coming-soon-input"
            value=""
            readOnly
            aria-disabled="true"
            aria-describedby={`${formId}-help ${formId}-tooltip`}
            placeholder={t(workspaceFAQForm.placeholder)}
            title={t("This feature will be available soon!").toUpperCase()}
            rows={3}
            data-no-translate
          />
          <span id={`${formId}-tooltip`} role="tooltip" data-no-translate>
            {t("This feature will be available soon!").toUpperCase()}
          </span>
        </div>
        <Button type="submit" appearance="primary" disabled>
          <span data-no-translate>{t(workspaceFAQForm.submit)}</span>
        </Button>
        <p
          className="workspace-faq-success"
          role="status"
          aria-live="polite"
          data-no-translate
        >
          {""}
        </p>
      </form>
    </>
  );
}

/** One accessible on-demand FAQ, shared by Welcome and the outer demo controls. */
export default function WorkspaceFAQ() {
  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>
        <button
          type="button"
          className="workspace-faq-link"
          aria-haspopup="dialog"
        >
          <QuestionCircle16Regular aria-hidden="true" />
          Workspace FAQ
        </button>
      </DialogTrigger>
      <DialogSurface className="workspace-faq-dialog">
        <DialogBody className="workspace-faq-dialog-body">
          <DialogTitle className="workspace-faq-title">
            Workspace FAQ
          </DialogTitle>
          <DialogContent className="workspace-faq-scroll">
            <WorkspaceFAQContent />
          </DialogContent>
          <DialogActions className="workspace-faq-footer">
            <DialogTrigger disableButtonEnhancement>
              <Button>Close</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
