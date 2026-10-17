import { adminPlatformById } from "../environments/catalog";

/** Local vendor identity. Adjacent link text supplies the accessible name by default. */
export default function ExternalBrandMark({
  id,
  size = 36,
  labelled = false,
}: {
  id: string;
  size?: number;
  labelled?: boolean;
}) {
  const platform = adminPlatformById.get(id);
  if (!platform) return null;
  return (
    <img
      className="external-brand-mark"
      src={platform.logo}
      alt={labelled ? platform.name : ""}
      width={size}
      height={size}
      style={{ flexShrink: 0, verticalAlign: "middle" }}
    />
  );
}
