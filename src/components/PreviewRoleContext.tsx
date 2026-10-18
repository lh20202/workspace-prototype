import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import { revealDemoControlsEvent } from "./demoControls";
import { isStandaloneDemo } from "../utils/demoMode";

type PreviewRoleContextValue = {
  roleSelectorRef: RefObject<HTMLSelectElement | null>;
  roleSelectorHighlighted: boolean;
  focusRoleSelector: () => void;
};
const PreviewRoleContext = createContext<PreviewRoleContextValue | null>(null);

/** External demonstration context. Product access remains in the access policy. */
export function PreviewRoleProvider({ children }: { children: ReactNode }) {
  const roleSelectorRef = useRef<HTMLSelectElement>(null);
  const highlightTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [roleSelectorHighlighted, setRoleSelectorHighlighted] = useState(false);
  const focusRoleSelector = useCallback(() => {
    const selector = roleSelectorRef.current;
    if (!selector) return;
    if (typeof window !== "undefined")
      flushSync(() => window.dispatchEvent(new Event(revealDemoControlsEvent)));
    selector.focus({ preventScroll: true });
    selector.scrollIntoView({ block: "center", behavior: "auto" });
    setRoleSelectorHighlighted(true);
    if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    highlightTimeout.current = setTimeout(() => {
      setRoleSelectorHighlighted(false);
      highlightTimeout.current = null;
    }, 2500);
  }, []);
  useEffect(
    () => () => {
      if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    },
    [],
  );
  return (
    <PreviewRoleContext.Provider
      value={
        isStandaloneDemo()
          ? null
          : {
              roleSelectorRef,
              roleSelectorHighlighted,
              focusRoleSelector,
            }
      }
    >
      {children}
    </PreviewRoleContext.Provider>
  );
}

export function usePreviewRoleContext() {
  return useContext(PreviewRoleContext);
}
