import type { ReactNode } from "react";
import { Info16Regular } from "@fluentui/react-icons";
import "./poc-annotations.css";

export interface PocAnnotationProps {
  title: string;
  children?: ReactNode;
  variant?: "sticker" | "tag" | "inline";
  className?: string;
  label?: string;
}

/** Commentary on the proof of concept, never a business/security warning. */
export default function PocAnnotation({
  title,
  children,
  variant = "inline",
  className = "",
  label,
}: PocAnnotationProps) {
  return (
    <span
      className={`poc-annotation poc-annotation-${variant} ${className}`.trim()}
      data-poc-annotation={variant}
      role="note"
      aria-label={label}
    >
      <Info16Regular aria-hidden="true" />
      <span className="poc-annotation-content">
        <strong className="poc-annotation-title">{title}</strong>
        {children && <span className="poc-annotation-copy">{children}</span>}
      </span>
    </span>
  );
}

/** Test-harness controls sit outside the simulated Microsoft 365 interface. */
export function PocPreviewControls({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`poc-preview-controls ${className}`.trim()}
      role="group"
      aria-label={title}
    >
      <span className="preview-controls-label">{title}</span>
      {children}
    </div>
  );
}
