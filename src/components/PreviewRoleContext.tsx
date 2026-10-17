import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import type { AccessResource } from "../access/policy";

const dismissedKey = "workspace-preview-role-helper-dismissed";
type DeniedPreviewArea = { owner: string; resource: AccessResource };
type PreviewRoleContextValue = {
  deniedArea: DeniedPreviewArea | null;
  helperDismissed: boolean;
  dismissHelper: () => void;
  registerDeniedArea: (owner: string, resource: AccessResource) => () => void;
};
const PreviewRoleContext = createContext<PreviewRoleContextValue | null>(null);

function storedDismissal() {
  try {
    return sessionStorage.getItem(dismissedKey) === "true";
  } catch {
    return false;
  }
}

/** External demonstration context. Product access remains in the access policy. */
export function PreviewRoleProvider({ children }: { children: ReactNode }) {
  const [deniedArea, setDeniedArea] = useState<DeniedPreviewArea | null>(null);
  const [helperDismissed, setHelperDismissed] = useState(storedDismissal);
  const registerDeniedArea = useCallback(
    (owner: string, resource: AccessResource) => {
      setDeniedArea({ owner, resource });
      return () => {
        setDeniedArea((active) => (active?.owner === owner ? null : active));
      };
    },
    [],
  );
  const dismissHelper = useCallback(() => {
    setHelperDismissed(true);
    try {
      sessionStorage.setItem(dismissedKey, "true");
    } catch {
      // The cue still dismisses for this page when browser storage is disabled.
    }
  }, []);
  return (
    <PreviewRoleContext.Provider
      value={{
        deniedArea,
        helperDismissed,
        dismissHelper,
        registerDeniedArea,
      }}
    >
      {children}
    </PreviewRoleContext.Provider>
  );
}

export function usePreviewRoleContext() {
  return useContext(PreviewRoleContext);
}

/** Only exact, policy-backed denied destinations opt into the external cue. */
export function useDeniedPreviewResource(resource?: AccessResource) {
  const owner = useId();
  const register = usePreviewRoleContext()?.registerDeniedArea;
  const serialized = resource ? JSON.stringify(resource) : null;
  useEffect(() => {
    if (!register || !serialized) return;
    return register(owner, JSON.parse(serialized) as AccessResource);
  }, [register, owner, serialized]);
}
