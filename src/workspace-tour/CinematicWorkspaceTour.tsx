import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "../i18n/Language";

type TourStep = {
  id: string;
  title: string;
  body: string;
  route: string;
  selector?: string;
  matchText?: string;
  camera: "wide" | "navigation" | "folder" | "metadata" | "channels";
};

function scrollTargetInsideFrame(
  target: HTMLElement,
  frame: HTMLIFrameElement,
  behavior: ScrollBehavior,
) {
  const view = frame.contentWindow;
  if (!view) return;

  // Scrolling an element with scrollIntoView() can also scroll the host page
  // around the iframe. Keep chapter changes inside the workspace preview so
  // the tour controls stay in the same place on short laptop screens.
  let ancestor = target.parentElement;
  while (ancestor && ancestor !== target.ownerDocument.body) {
    const style = view.getComputedStyle(ancestor);
    if (
      /(auto|scroll|overlay)/.test(style.overflowY) &&
      ancestor.scrollHeight > ancestor.clientHeight
    ) {
      const targetRect = target.getBoundingClientRect();
      const ancestorRect = ancestor.getBoundingClientRect();
      const targetTop =
        ancestor.scrollTop + targetRect.top - ancestorRect.top - ancestor.clientTop;
      ancestor.scrollTo({
        top: targetTop - (ancestor.clientHeight - targetRect.height) / 2,
        behavior,
      });
      return;
    }
    ancestor = ancestor.parentElement;
  }

  const targetRect = target.getBoundingClientRect();
  const targetTop = targetRect.top + view.scrollY;
  view.scrollTo({
    top: targetTop - (view.innerHeight - targetRect.height) / 2,
    behavior,
  });
}

export default function CinematicWorkspaceTour() {
  const { t } = useTranslation();
  const iframe = useRef<HTMLIFrameElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [frameReady, setFrameReady] = useState(false);
  const [loadRevision, setLoadRevision] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const steps = useMemo<TourStep[]>(
    () => [
      {
        id: "home",
        title: "Start with the work that matters",
        body: "The Planning home brings the current cycle, useful links and recent work together. This walkthrough stays beside the workspace so the product view remains familiar.",
        route: "/planning?demo=standalone",
        selector: ".current-cycle",
        camera: "wide",
      },
      {
        id: "navigation",
        title: "A consistent way around",
        body: "The left-hand navigation stays in place as you move between the home page and document libraries. Try a link in the workspace, or continue with Next.",
        route: "/planning?demo=standalone",
        selector: ".sidebar nav",
        camera: "navigation",
      },
      {
        id: "folders",
        title: "Simple, predictable folders",
        body: "Planning Cycles groups work by cycle, with guidance and decisions close to the files they support. Open the highlighted library yourself, or continue to see an example.",
        route: "/planning/cycles?demo=standalone",
        selector: ".sidebar nav button",
        matchText: "Planning Cycles",
        camera: "folder",
      },
      {
        id: "cycle-folder",
        title: "Keep related files together",
        body: "A planning cycle opens into a small set of clear folders. The structure helps people find guidance, working files and completed material without learning a new system for every project.",
        route: "/planning/cycles?folder=2027+Annual+Planning&demo=standalone",
        selector: ".main-content button",
        matchText: "Guidance & decisions",
        camera: "folder",
      },
      {
        id: "metadata",
        title: "Useful details, already organised",
        body: "Files carry predefined details such as owner, status, document type and sensitivity. Classification labels make handling expectations clearer, while columns help people scan and filter the library.",
        route:
          "/planning/cycles?folder=2027+Annual+Planning%2FGuidance+%26+decisions&demo=standalone",
        selector:
          '.main-content .sp-library-table thead [data-tour-target="library-metadata"]',
        camera: "metadata",
      },
      {
        id: "restricted",
        title: "Access follows the person’s role",
        body: "Permissions are applied to the area, so people only see content available to their role. A restricted landing page explains the boundary and provides a clear next step.",
        route: "/planning/restricted?demo=standalone",
        selector: ".access-boundary",
        camera: "wide",
      },
      {
        id: "support",
        title: "Know who can help",
        body: "The restricted page names a focal point for access questions. Contacting them gives the person and context needed to resolve an access issue.",
        route: "/planning/restricted?demo=standalone",
        selector: ".access-boundary-main .access-boundary > button",
        camera: "wide",
      },
      {
        id: "urgent",
        title: "Escalate urgent access needs",
        body: "If the focal point is unavailable and access cannot wait, the restricted page provides a clear urgent escalation route.",
        route: "/planning/restricted?demo=standalone",
        selector: ".access-boundary-urgent",
        camera: "wide",
      },
      {
        id: "reveal",
        title: "See the demonstration content",
        body: "Reveal restricted content is a demo-only control on this page. It shows an illustrative example without changing a person’s permissions.",
        route: "/planning/restricted?demo=standalone",
        selector: ".access-boundary-reveal",
        camera: "wide",
      },
      {
        id: "links",
        title: "Open tools and conversations nearby",
        body: "Important tools and Planning & Reporting are linked from the workspace home. They open when you need them, while files stay organised in their libraries.",
        route: "/planning?demo=standalone",
        selector: ".home-aside",
        camera: "channels",
      },
    ],
    [],
  );
  const step = steps[index];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };
    preference.addEventListener("change", listener);
    return () => preference.removeEventListener("change", listener);
  }, []);

  const prepareFrame = () => {
    const doc = iframe.current?.contentDocument;
    if (!doc) return;
    let style = doc.getElementById(
      "cinematic-tour-frame-style",
    ) as HTMLStyleElement | null;
    if (!style) {
      style = doc.createElement("style");
      style.id = "cinematic-tour-frame-style";
      style.textContent = `
        .demo-control-frame, .prototype-navigator, .demo-fictional-label { display: none !important; }
        html, body, #root { min-width: 0 !important; }
        .prototype-frame { min-height: 100vh !important; overflow: auto !important; }
        .cinematic-tour-focus { position: relative !important; z-index: 1 !important; outline: 3px solid #bd3028 !important; outline-offset: 4px !important; box-shadow: 0 0 0 7px #bd302822 !important; border-radius: 3px; }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }
      `;
      doc.head.append(style);
    }
    setFrameReady(true);
    setLoadRevision((revision) => revision + 1);
  };

  useEffect(() => {
    const screenNode = screen.current;
    if (!screenNode) return;
    const updateFit = () => {
      const scale = Math.min(
        screenNode.clientWidth / 1440,
        screenNode.clientHeight / 900,
      );
      screenNode.style.setProperty("--tour-fit", String(scale));
    };
    updateFit();
    const observer = new ResizeObserver(updateFit);
    observer.observe(screenNode);
    return () => observer.disconnect();
  }, []);

  function findTarget(doc: Document, targetStep: TourStep) {
    if (!targetStep.selector) return null;
    const candidates = Array.from(
      doc.querySelectorAll<HTMLElement>(targetStep.selector),
    );
    if (!targetStep.matchText) return candidates[0] ?? null;
    return (
      candidates.find((element) =>
        (element.innerText || element.textContent || "")
          .replace(/\s+/g, " ")
          .trim()
          .includes(targetStep.matchText!),
      ) ?? null
    );
  }

  useEffect(() => {
    if (!frameReady) return;
    const frame = iframe.current;
    if (!frame) return;
    let expected: URL;
    let current: URL;
    try {
      expected = new URL(step.route, window.location.origin);
      current = new URL(frame.contentWindow!.location.href);
    } catch {
      return;
    }
    const routeMatches =
      current.pathname === expected.pathname &&
      Array.from(expected.searchParams.entries()).every(
        ([key, value]) => current.searchParams.get(key) === value,
      );
    if (!routeMatches) {
      frame.src = `${expected.pathname}${expected.search}`;
    }
  }, [frameReady, index, step.route]);

  useEffect(() => {
    if (!frameReady) return;
    const frame = iframe.current;
    const doc = frame?.contentDocument;
    const screenNode = screen.current;
    const camera = frame?.parentElement as HTMLElement | null;
    if (!frame || !doc || !screenNode || !camera) return;
    doc
      .querySelectorAll(".cinematic-tour-focus")
      .forEach((element) => element.classList.remove("cinematic-tour-focus"));
    const target = findTarget(doc, step);
    camera.style.transformOrigin = "top left";
    if (!target) {
      camera.style.transform = "translate3d(0, 0, 0) scale(1)";
      return;
    }
    // Keep the workspace itself still, then move the camera smoothly to the
    // chapter's subject. This is more reliable and readable than a connector
    // arrow, especially when the laptop preview is small.
    scrollTargetInsideFrame(target, frame, "instant");
    target.classList.add("cinematic-tour-focus");
    const updateCamera = () => {
      const fit =
        Number.parseFloat(
          getComputedStyle(screenNode).getPropertyValue("--tour-fit"),
        ) || 0.7;
      const bounds = target.getBoundingClientRect();
      const centerX = (bounds.left + bounds.width / 2) * fit;
      const centerY = (bounds.top + bounds.height / 2) * fit;
      const zoom = {
        wide: 1.25,
        navigation: 1.6,
        folder: 1.55,
        metadata: 1.65,
        channels: 1.45,
      }[step.camera];
      const translateX = screenNode.clientWidth / 2 - centerX * zoom;
      const translateY = screenNode.clientHeight / 2 - centerY * zoom;
      camera.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${zoom})`;
    };
    updateCamera();
    const observer = new ResizeObserver(() => requestAnimationFrame(updateCamera));
    observer.observe(screenNode);
    return () => observer.disconnect();
  }, [frameReady, loadRevision, index, reducedMotion, step]);

  const advance = () => {
    if (index === steps.length - 1) {
      location.assign("/");
      return;
    }
    setIndex((current) => Math.min(steps.length - 1, current + 1));
  };
  const goBack = () => {
    setIndex((current) => Math.max(0, current - 1));
  };

  return (
    <section
      className="cinematic-tour"
      aria-label={t("Planning workspace tour")}
      data-camera={step.camera}
      data-step={step.id}
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      <div className="cinematic-tour-stage">
        <div
          className="cinematic-laptop"
          aria-label={t("Planning workspace shown on a laptop")}
        >
          <div className="cinematic-laptop-screen">
            <div className="cinematic-webcam" aria-hidden="true" />
            <div className="cinematic-screen" ref={screen}>
              <div
                className={`cinematic-camera cinematic-camera-${step.camera}`}
              >
                <iframe
                  ref={iframe}
                  title={t("Planning workspace tour preview")}
                  src="/planning?demo=standalone"
                  onLoad={prepareFrame}
                  tabIndex={0}
                  aria-label={t("Live preview of the Planning workspace")}
                />
              </div>
            </div>
          </div>
          <div className="cinematic-laptop-base" aria-hidden="true">
            <span />
          </div>
        </div>
        <aside
          className="cinematic-tour-note demo-paper-surface"
          key={step.id}
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="cinematic-note-kicker">{t("A guided look")}</span>
          <h2>{t(step.title)}</h2>
          <p>{t(step.body)}</p>
          <span className="cinematic-note-index">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(steps.length).padStart(2, "0")}
          </span>
        </aside>
      </div>
      <div className="cinematic-tour-controls">
        <div className="cinematic-tour-progress" aria-hidden="true">
          <span style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="cinematic-tour-control-row">
          <span className="cinematic-tour-caption">
            {frameReady
              ? t("The laptop view zooms in on each feature as you move through the tour.")
              : t("Opening the Planning workspace…")}
          </span>
          <div className="cinematic-tour-buttons">
            <button type="button" onClick={goBack} disabled={index === 0}>
              {t("Back")}
            </button>
            <button
              type="button"
              onClick={advance}
              className="cinematic-primary-control"
            >
              {index === steps.length - 1 ? t("Finish") : t("Next")}
            </button>
            <button type="button" onClick={() => location.assign("/")}>
              {t("Exit tour")}
            </button>
          </div>
        </div>
        <div
          className="cinematic-step-list"
          role="group"
          aria-label={t("Tour chapters")}
        >
          {steps.map((item, itemIndex) => (
            <button
              type="button"
              key={item.id}
              aria-current={itemIndex === index ? "step" : undefined}
              aria-label={`${itemIndex + 1}. ${t(item.title)}`}
              onClick={() => {
                setIndex(itemIndex);
              }}
            >
              {String(itemIndex + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
