import { useTranslation } from "../i18n/Language";
import { usePreviewRoleContext } from "./PreviewRoleContext";
import "./preview-role-prompt.css";

/** A demonstration control, separate from product membership and access. */
export default function PreviewRolePrompt({
  heading,
  description,
  actionLabel,
}: {
  heading?: string;
  description: string;
  actionLabel: string;
}) {
  const preview = usePreviewRoleContext();
  const { t } = useTranslation();
  if (!preview) return null;
  return (
    <div className="preview-role-prompt access-preview-role">
      {heading && <strong>{t(heading)}</strong>}
      {heading && <span>{t(description)}</span>}
      <button
        type="button"
        aria-controls="preview-role"
        onClick={preview.focusRoleSelector}
      >
        {t(actionLabel)}
      </button>
      {!heading && <span>{t(description)}</span>}
    </div>
  );
}
