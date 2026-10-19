import type { AccessResource } from "./policy";

function revealKey(resource: AccessResource | undefined, personId: string) {
  if (!resource || typeof window === "undefined") return "";
  const canonicalResource =
    resource.kind === "unit"
      ? { ...resource, unitOnly: resource.unitOnly ?? true }
      : resource;
  const scope = `${personId}::${JSON.stringify(canonicalResource)}`;
  let hash = 2166136261;
  for (let index = 0; index < scope.length; index += 1) {
    hash ^= scope.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `workspace-demo-reveal-${(hash >>> 0).toString(36)}`;
}

export function isDemoContentRevealed(
  resource: AccessResource,
  person: string | { id: string },
) {
  const key = revealKey(
    resource,
    typeof person === "string" ? person : person.id,
  );
  if (!key || typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

/** Records a reveal only for this browser session, person and exact resource. */
export function revealDemoContent(
  resource: AccessResource | undefined,
  personId: string,
) {
  const key = revealKey(resource, personId);
  if (!key || typeof window === "undefined") return false;
  try {
    window.sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return false;
  }
}

/** Page-local demo reveal state; it never changes a person's access policy. */
export function useDemoContentReveal(
  resource: AccessResource | undefined,
  personId: string,
) {
  const key = revealKey(resource, personId);
  const revealed = !!key && isDemoContentRevealed(resource!, personId);
  const reveal = () => {
    if (!key || revealed || !revealDemoContent(resource, personId)) return;
    window.location.reload();
  };
  return { revealed, reveal };
}
