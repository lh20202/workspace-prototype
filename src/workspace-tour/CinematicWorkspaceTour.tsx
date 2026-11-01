import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "../i18n/Language";
import { annotationConnectorPath } from "./annotationGeometry";

type TourStep = {
  id: string;
  title: string;
  body: string;
  route: string;
  selector?: string;
  matchText?: string;
  camera: "wide" | "navigation" | "folder" | "metadata" | "channels";
};

function mapTargetToScreen(
  target: HTMLElement,
  frame: HTMLIFrameElement,
  screen: HTMLElement,
) {
  const targetRect = target.getBoundingClientRect();
  const fit =
    Number.parseFloat(
      getComputedStyle(screen).getPropertyValue("--tour-fit"),
    ) || 0.7;
  const camera = frame.parentElement;
  const cameraStyle = camera ? getComputedStyle(camera) : null;
  const zoom = cameraStyle ? new DOMMatrixReadOnly(cameraStyle.transform).a : 1;
  const [originX = "50%", originY = "50%"] =
    cameraStyle?.transformOrigin.split(" ") ?? [];
  const origin = (value: string, size: number) =>
    value.endsWith("%")
      ? (Number.parseFloat(value) / 100) * size
      : Number.parseFloat(value);
  const originLeft = origin(originX, screen.clientWidth);
  const originTop = origin(originY, screen.clientHeight);
  const left = originLeft + (targetRect.left * fit - originLeft) * zoom;
  const top = originTop + (targetRect.top * fit - originTop) * zoom;
  return {
    left,
    top,
    width: targetRect.width * fit * zoom,
    height: targetRect.height * fit * zoom,
  };
}

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
  const stage = useRef<HTMLElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const note = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [frameReady, setFrameReady] = useState(false);
  const [loadRevision, setLoadRevision] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [arrow, setArrow] = useState({ width: 1, height: 1, path: "" });

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
        selector: ".main-content table tbody tr:first-child",
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
    if (!frame || !doc) return;
    doc
      .querySelectorAll(".cinematic-tour-focus")
      .forEach((element) => element.classList.remove("cinematic-tour-focus"));
    const target = findTarget(doc, step);
    if (!target) return;
    scrollTargetInsideFrame(
      target,
      frame,
      reducedMotion ? "instant" : "smooth",
    );
    target.classList.add("cinematic-tour-focus");
  }, [frameReady, loadRevision, index, reducedMotion, step]);

  useEffect(() => {
    const updateArrow = () => {
      const frame = iframe.current;
      const doc = frame?.contentDocument;
      const stageNode = stage.current;
      const screenNode = screen.current;
      const noteNode = note.current;
      if (!frame || !doc || !stageNode || !screenNode || !noteNode) return;
      const stageRect = stageNode.getBoundingClientRect();
      const screenRect = screenNode.getBoundingClientRect();
      const noteRect = noteNode.getBoundingClientRect();
      const target = findTarget(doc, step);
      if (!target || !stageRect.width || !stageRect.height) {
        setArrow({
          width: stageRect.width || 1,
          height: stageRect.height || 1,
          path: "",
        });
        return;
      }
      const targetRect = mapTargetToScreen(target, frame, screenNode);
      const targetInStage = {
        left: screenRect.left + targetRect.left - stageRect.left,
        top: screenRect.top + targetRect.top - stageRect.top,
        width: targetRect.width,
        height: targetRect.height,
      };
      const noteInStage = {
        left: noteRect.left - stageRect.left,
        top: noteRect.top - stageRect.top,
        width: noteRect.width,
        height: noteRect.height,
      };
      setArrow({
        width: stageRect.width,
        height: stageRect.height,
        path: annotationConnectorPath(noteInStage, targetInStage),
      });
    };
    updateArrow();
    const observer = new ResizeObserver(updateArrow);
    if (stage.current) observer.observe(stage.current);
    if (screen.current) observer.observe(screen.current);
    if (note.current) observer.observe(note.current);
    let animationFrame = 0;
    const startedAt = performance.now();
    const followCamera = (now: number) => {
      updateArrow();
      if (now - startedAt < 1500)
        animationFrame = requestAnimationFrame(followCamera);
    };
    animationFrame = requestAnimationFrame(followCamera);
    window.addEventListener("resize", updateArrow);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", updateArrow);
    };
  }, [index, frameReady, loadRevision, step]);

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
      ref={stage}
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
          ref={note}
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
        <svg
          className="cinematic-tour-arrow"
          viewBox={`0 0 ${arrow.width} ${arrow.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ opacity: arrow.path ? 1 : 0 }}
        >
          <defs>
            <marker
              id="cinematic-arrowhead"
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="6"
              orient="auto"
            >
              <path d="M2 2 10 6 2 10" />
            </marker>
          </defs>
          <path d={arrow.path} markerEnd="url(#cinematic-arrowhead)" />
        </svg>
      </div>
      <div className="cinematic-tour-controls">
        <div className="cinematic-tour-progress" aria-hidden="true">
          <span style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="cinematic-tour-control-row">
          <span className="cinematic-tour-caption">
            {frameReady
              ? t(
                  "Use Next at your pace. You can also click highlighted areas.",
                )
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
