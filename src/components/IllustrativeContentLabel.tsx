import { useTranslation } from "../i18n/Language";

export default function IllustrativeContentLabel() {
  const { t } = useTranslation();
  return (
    <div className="demo-paper-surface demo-fictional-label" role="note">
      {t("Illustrative, fictional content. No company data used")}
    </div>
  );
}
