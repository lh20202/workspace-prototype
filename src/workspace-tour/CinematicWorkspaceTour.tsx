import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "../i18n/Language";

type TourStep = {
  id: string;
  focusLabel: string;
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

  const targetRect = target.getBoundingClientRect();
  const viewportTop = 0;
  const viewportBottom = view.innerHeight;
  // Leave the workspace at its natural scroll position whenever the target is
  // already visible. In particular, moving the whole page to centre a tall
  // navigation rail makes the tour appear to show an empty screen.
  if (targetRect.top >= viewportTop && targetRect.bottom <= viewportBottom) {
    return;
  }

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
      const ancestorRect = ancestor.getBoundingClientRect();
      const targetTop =
        ancestor.scrollTop +
        targetRect.top -
        ancestorRect.top -
        ancestor.clientTop;
      ancestor.scrollTo({
        top:
          targetRect.top < ancestorRect.top
            ? targetTop
            : targetTop - ancestor.clientHeight + targetRect.height,
        behavior,
      });
      return;
    }
    ancestor = ancestor.parentElement;
  }

  const targetTop = targetRect.top + view.scrollY;
  const top =
    targetRect.top < viewportTop
      ? targetTop
      : targetTop - view.innerHeight + targetRect.height;
  view.scrollTo({ top, behavior });
}

export default function CinematicWorkspaceTour() {
  const { t } = useTranslation();
  const iframe = useRef<HTMLIFrameElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [noteVisible, setNoteVisible] = useState(true);
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
        focusLabel: "Current planning cycle",
        title: "See the current cycle at a glance",
        body: "The current cycle, key links and recent files are together on the workspace home.",
        route: "/planning?demo=standalone",
        selector: ".current-cycle",
        camera: "wide",
      },
      {
        id: "navigation",
        focusLabel: "Workspace navigation",
        title: "Move around without losing your place",
        body: "Home and document libraries stay in the left menu as you move through the workspace.",
        route: "/planning?demo=standalone",
        selector: ".sidebar nav",
        camera: "navigation",
      },
      {
        id: "folders",
        focusLabel: "Planning Cycles library",
        title: "Group work by planning cycle",
        body: "Each cycle keeps its guidance, decisions and working files together.",
        route: "/planning/cycles?demo=standalone",
        selector: ".sidebar nav button",
        matchText: "Planning Cycles",
        camera: "folder",
      },
      {
        id: "cycle-folder",
        focusLabel: "Guidance & decisions folder",
        title: "Keep related files together",
        body: "Clear folders make guidance, working files and completed material easy to find.",
        route: "/planning/cycles?folder=2027+Annual+Planning&demo=standalone",
        selector: ".main-content button",
        matchText: "Guidance & decisions",
        camera: "folder",
      },
      {
        id: "metadata",
        focusLabel: "Library details",
        title: "Find files by useful details",
        body: "Owner, status, document type and sensitivity help people scan and filter the library.",
        route:
          "/planning/cycles?folder=2027+Annual+Planning%2FGuidance+%26+decisions&demo=standalone",
        selector:
          '.main-content .sp-library-table thead [data-tour-target="library-metadata"]',
        camera: "metadata",
      },
      {
        id: "restricted",
        focusLabel: "Restricted access page",
        title: "Access follows each person’s role",
        body: "A restricted landing page explains why an area is unavailable and what to do next.",
        route: "/planning/restricted?demo=standalone",
        selector: ".access-boundary",
        camera: "wide",
      },
      {
        id: "support",
        focusLabel: "Access contact",
        title: "Know who can help",
        body: "The page names a contact for questions about access.",
        route: "/planning/restricted?demo=standalone",
        selector: ".access-boundary-main .access-boundary > button",
        camera: "wide",
      },
      {
        id: "urgent",
        focusLabel: "Urgent escalation",
        title: "Escalate urgent requests",
        body: "If access cannot wait, the page explains how to raise an urgent request.",
        route: "/planning/restricted?demo=standalone",
        selector: ".access-boundary-urgent",
        camera: "wide",
      },
      {
        id: "reveal",
        focusLabel: "Reveal restricted content",
        title: "Preview restricted content",
        body: "The demo can reveal an example here. It does not change anyone’s access.",
        route: "/planning/restricted?demo=standalone",
        selector: ".access-boundary-reveal",
        camera: "wide",
      },
      {
        id: "links",
        focusLabel: "Tools and conversations",
        title: "Keep useful links close by",
        body: "Open related tools and Planning & Reporting from the workspace home.",
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
      screenNode.style.setProperty(
        "--tour-fit",
        String(Math.min(screenNode.clientWidth / 1440, 1)),
      );
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
    if (!routeMatches) return;
    camera.style.transformOrigin = "top left";
    let revealTimer: number | undefined;
    let targetObserver: MutationObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let cancelled = false;

    const focusTarget = (target: HTMLElement) => {
      doc
        .querySelectorAll(".cinematic-tour-focus")
        .forEach((element) => element.classList.remove("cinematic-tour-focus"));
      // Keep the workspace itself still when the target is already in view,
      // then move the camera smoothly onto the feature being described.
      scrollTargetInsideFrame(target, frame, "instant");
      target.classList.add("cinematic-tour-focus");
      const updateCamera = () => {
        if (cancelled) return;
        const bounds = target.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        const zoom = {
          wide: 1.12,
          navigation: 1.45,
          folder: 1.35,
          metadata: 1.4,
          channels: 1.3,
        }[step.camera];
        const fit = Math.max(Math.min(screenNode.clientWidth / 1440, 1), 0.1);
        // The iframe is already scaled to fit the stage. Compensate for that
        // scale so the requested zoom stays consistent at every viewport size.
        const cameraScale = zoom / fit;
        const translateX = screenNode.clientWidth / 2 - centerX * zoom;
        const translateY = screenNode.clientHeight / 2 - centerY * zoom;
        camera.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${cameraScale})`;
      };
      updateCamera();
      resizeObserver = new ResizeObserver(() =>
        requestAnimationFrame(updateCamera),
      );
      resizeObserver.observe(screenNode);
      revealTimer = window.setTimeout(
        () => setNoteVisible(true),
        reducedMotion ? 0 : 760,
      );
    };

    const target = findTarget(doc, step);
    if (target) {
      focusTarget(target);
    } else if (step.selector && doc.documentElement) {
      // The iframe load event can fire before the workspace finishes rendering.
      // Wait briefly for the target, instead of showing a new label over a blank
      // or unfocused frame.
      targetObserver = new MutationObserver(() => {
        const loadedTarget = findTarget(doc, step);
        if (!loadedTarget) return;
        targetObserver?.disconnect();
        window.clearTimeout(revealTimer);
        focusTarget(loadedTarget);
      });
      targetObserver.observe(doc.documentElement, {
        childList: true,
        subtree: true,
      });
      revealTimer = window.setTimeout(
        () => {
          targetObserver?.disconnect();
          if (!cancelled) setNoteVisible(true);
        },
        reducedMotion ? 0 : 2400,
      );
    } else {
      camera.style.transform = "translate3d(0, 0, 0) scale(1)";
      revealTimer = window.setTimeout(
        () => setNoteVisible(true),
        reducedMotion ? 0 : 760,
      );
    }
    return () => {
      cancelled = true;
      targetObserver?.disconnect();
      resizeObserver?.disconnect();
      if (revealTimer !== undefined) window.clearTimeout(revealTimer);
    };
  }, [frameReady, loadRevision, index, reducedMotion, step]);

  const goToStep = (nextIndex: number) => {
    if (nextIndex === index) return;
    setNoteVisible(false);
    setIndex(nextIndex);
  };
  const advance = () => {
    if (index === steps.length - 1) {
      location.assign("/");
      return;
    }
    goToStep(Math.min(steps.length - 1, index + 1));
  };
  const goBack = () => {
    goToStep(Math.max(0, index - 1));
  };

  return (
    <section
      className={`cinematic-tour${noteVisible ? "" : " is-transitioning"}`}
      aria-label={t("Planning workspace tour")}
      data-camera={step.camera}
      data-step={step.id}
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      <div className="cinematic-tour-stage">
        <div
          className="cinematic-laptop"
          aria-label={t("Planning workspace preview")}
        >
          <div className="cinematic-laptop-screen">
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
        </div>
        <aside
          className={`cinematic-tour-note${noteVisible ? " is-visible" : ""}`}
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="cinematic-note-kicker">{t("Looking at")}</span>
          <span className="cinematic-note-target">{t(step.focusLabel)}</span>
          <h2>{t(step.title)}</h2>
          <p>{t(step.body)}</p>
        </aside>
      </div>
      <div className="cinematic-tour-controls">
        <div className="cinematic-tour-progress" aria-hidden="true">
          <span style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="cinematic-tour-control-row">
          <span className="cinematic-tour-caption" aria-live="polite">
            {t("Step")} {String(index + 1).padStart(2, "0")} {t("of")}{" "}
            {String(steps.length).padStart(2, "0")}
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
      </div>
    </section>
  );
}
