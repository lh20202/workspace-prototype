/** Canonical file classifications. Access entitlement is modelled separately. */
export const sensitivityLabels = [
  "Public",
  "Internal",
  "Confidential",
  "Strictly confidential",
] as const;
export type SensitivityLabel = (typeof sensitivityLabels)[number];
export function isSensitivityLabel(value: unknown): value is SensitivityLabel {
  return sensitivityLabels.some((label) => label === value);
}
/** Context-specific seed classification; deliberately defaults ordinary work to Internal. */
export function workingFileSensitivity(
  workspace: string,
  area: string,
  name: string,
): SensitivityLabel {
  if (workspace === "welfare") return "Strictly confidential";
  if (
    /credential|secret|password|bank mandate|signator|privileged|safeguarding|individual (candidate|employee)|personnel record/i.test(
      name,
    )
  )
    return "Strictly confidential";
  if (
    workspace === "legal" &&
    /advice|matter|dispute|case/i.test(name) &&
    !/template|routing|coordination/i.test(name)
  )
    return "Confidential";
  if (
    workspace === "services" &&
    area === "purchasing" &&
    /comparison|shortlist|commercial|renewal review|evaluation|negotiation/i.test(
      name,
    )
  )
    return "Confidential";
  if (
    workspace === "customer" &&
    /relationship|account|partner|stakeholder/i.test(name) &&
    !/method|template|guide/i.test(name)
  )
    return "Confidential";
  if (
    workspace === "digital" &&
    /security|vulnerabil|incident assessment/i.test(name) &&
    !/guide|template/i.test(name)
  )
    return "Confidential";
  return "Internal";
}
