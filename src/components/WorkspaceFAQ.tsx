import { useId, useReducer } from "react";
import {
  Button,
  Field,
  Textarea,
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
import {
  emptyFAQQuestion,
  faqQuestionSubmission,
} from "./faqQuestionSubmission";
import "./workspace-faq.css";

export function WorkspaceFAQContent() {
  const { t } = useTranslation();
  const [draft, dispatch] = useReducer(faqQuestionSubmission, emptyFAQQuestion);
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
                <span data-no-translate>
                  {id === workspaceFAQSubmittedQuestion.id && (
                    <span className="workspace-faq-submitted">
                      {t("Submitted question")}
                    </span>
                  )}
                  {t(question)}
                </span>
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
          dispatch({ type: "submit" });
        }}
      >
        <h3 id={`${formId}-heading`} data-no-translate>
          {t(workspaceFAQForm.heading)}
        </h3>
        <p id={`${formId}-help`} data-no-translate>
          {t(workspaceFAQForm.support)}
        </p>
        <Field label={t(workspaceFAQForm.label)}>
          <Textarea
            value={draft.question}
            onChange={(_, data) =>
              dispatch({ type: "edit", question: data.value })
            }
            placeholder={t(workspaceFAQForm.placeholder)}
            aria-describedby={`${formId}-help`}
            rows={3}
            resize="vertical"
            required
            data-no-translate
          />
        </Field>
        <Button
          type="submit"
          appearance="primary"
          disabled={!draft.question.trim()}
        >
          <span data-no-translate>{t(workspaceFAQForm.submit)}</span>
        </Button>
        <p
          className="workspace-faq-success"
          role="status"
          aria-live="polite"
          data-no-translate
        >
          {draft.submitted ? t(workspaceFAQForm.success) : ""}
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
