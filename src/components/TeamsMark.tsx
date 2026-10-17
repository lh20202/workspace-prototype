/** The same local Microsoft Teams mark wherever the destination is Teams. */
export default function TeamsMark({
  size = 20,
  labelled = false,
}: {
  size?: number;
  labelled?: boolean;
}) {
  return (
    <img
      className="teams-mark"
      src="/images/teams-logo.svg"
      alt={labelled ? "Microsoft Teams" : ""}
      width={size}
      height={size}
      style={{ flexShrink: 0, verticalAlign: "middle" }}
    />
  );
}
