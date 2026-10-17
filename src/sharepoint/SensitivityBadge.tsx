import type { SensitivityLabel } from "./sensitivity";
import "./sensitivity.css";
/** A file property, separate from status and access restrictions. */
export default function SensitivityBadge({
  value,
}: {
  value: SensitivityLabel;
}) {
  return (
    <span
      className={`sensitivity-label sensitivity-${value.toLowerCase().replaceAll(" ", "-")}`}
      aria-label={`Sensitivity: ${value}`}
    >
      {value}
    </span>
  );
}
