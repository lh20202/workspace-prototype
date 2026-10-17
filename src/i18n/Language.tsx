import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { translateText, type Language } from "./translate";
import { displayText } from "./displayText";
import "./language.css";

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
}>({ language: "en", setLanguage: () => {} });
const storageKey = "workspace-language-session";
export function useTranslation() {
  const { language } = useContext(LanguageContext);
  return {
    language,
    t: (source: string) => displayText(source, language),
  };
}
function storedLanguage(): Language {
  try {
    return sessionStorage.getItem(storageKey) === "de" ? "de" : "en";
  } catch {
    return "en";
  }
}
type Original = { source: string; rendered: string };
const attributes = [
  "aria-label",
  "aria-description",
  "placeholder",
  "title",
  "alt",
  "label",
] as const;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(storedLanguage);
  const [textSources] = useState(() => new WeakMap<Text, Original>());
  const [attributeSources] = useState(
    () => new WeakMap<Element, Map<string, Original>>(),
  );
  useLayoutEffect(() => {
    document.documentElement.lang = language;
    try {
      sessionStorage.setItem(storageKey, language);
    } catch {
      /* Storage can be disabled. */
    }
    const ignored = (element: Element | null) =>
      !!element?.closest("script, style, code, pre, [data-no-translate]");
    const localizeText = (node: Text) => {
      if (
        ignored(node.parentElement) ||
        node.parentElement?.closest("textarea")
      )
        return;
      const current = node.data;
      let original = textSources.get(node);
      if (!original || current !== original.rendered)
        original = { source: current, rendered: current };
      const rendered = displayText(original.source, language);
      original.rendered = rendered;
      textSources.set(node, original);
      if (current !== rendered) node.data = rendered;
    };
    const localizeElement = (element: Element) => {
      if (ignored(element)) return;
      if (
        element instanceof HTMLOptionElement &&
        !element.hasAttribute("value")
      ) {
        // Native option values must remain canonical when their visible labels change.
        element.setAttribute("value", element.value);
      }
      let originals = attributeSources.get(element);
      if (!originals) {
        originals = new Map();
        attributeSources.set(element, originals);
      }
      for (const attribute of attributes) {
        const current = element.getAttribute(attribute);
        if (current == null) continue;
        let original = originals.get(attribute);
        if (!original || current !== original.rendered)
          original = { source: current, rendered: current };
        const rendered = displayText(original.source, language);
        original.rendered = rendered;
        originals.set(attribute, original);
        if (current !== rendered) element.setAttribute(attribute, rendered);
      }
    };
    const localize = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        localizeText(node as Text);
        return;
      }
      if (node instanceof Element) {
        localizeElement(node);
        if (ignored(node)) return;
      }
      const walker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      );
      while (walker.nextNode()) {
        if (walker.currentNode instanceof Element)
          localizeElement(walker.currentNode);
        else localizeText(walker.currentNode as Text);
      }
    };
    // Covers lazy routes, Fluent portals, opened menus, filtered tables and live replies.
    const observer = new MutationObserver((mutations) => {
      observer.disconnect();
      for (const mutation of mutations) {
        if (mutation.type === "childList")
          mutation.addedNodes.forEach(localize);
        else if (mutation.type === "characterData")
          localizeText(mutation.target as Text);
        else if (mutation.target instanceof Element)
          localizeElement(mutation.target);
      }
      observe();
    });
    const observe = () =>
      observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [...attributes],
      });
    localize(document.documentElement);
    observe();
    return () => observer.disconnect();
  }, [language, textSources, attributeSources]);
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function LanguageToggle() {
  const { language, setLanguage } = useContext(LanguageContext);
  return (
    <div
      className="language-toggle"
      role="group"
      aria-label={translateText("Language", language)}
      data-no-translate
    >
      <button
        type="button"
        lang="en"
        aria-label="English"
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
      >
        ENG
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        lang="de"
        aria-label="Deutsch"
        aria-pressed={language === "de"}
        onClick={() => setLanguage("de")}
      >
        DE
      </button>
    </div>
  );
}
