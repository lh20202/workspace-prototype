/** A neutral conversation mark for channel destinations. */
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
      src="/images/channels-mark.svg"
      alt={labelled ? "Channels" : ""}
      width={size}
      height={size}
      style={{ flexShrink: 0, verticalAlign: "middle" }}
    />
  );
}
