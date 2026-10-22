import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pause20Regular,
  Play20Regular,
  Replay20Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "../i18n/Language";
import { annotationConnectorPath } from "./annotationGeometry";

type Pointer = {
  left: number;
  top: number;
  visible: boolean;
  clicking: boolean;
};
type TourStep = {
  id: string;
  title: string;
  body: string;
  route: string;
  selector?: string;
  matchText?: string;
  camera: "wide" | "navigation" | "folder" | "metadata" | "channels";
  click?: boolean;
  duration: number;
};

function planningChannelUrl() {
  const staff = new URLSearchParams(location.search).get("staff") || "taylor";
  return `/teams?${new URLSearchParams({
    staff,
    workspace: "planning",
    context: "workspace:planning",
    channel: "Planning & Reporting",
    tab: "Posts",
    demo: "standalone",
  })}`;
}

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

export default function CinematicWorkspaceTour() {
  const { t } = useTranslation();
  const iframe = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const note = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(() =>
    typeof window === "undefined"
      ? true
      : !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [frameReady, setFrameReady] = useState(false);
  const [loadRevision, setLoadRevision] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [pointer, setPointer] = useState<Pointer>({
    left: -40,
    top: -40,
    visible: false,
    clicking: false,
  });
  const [arrow, setArrow] = useState({ width: 1, height: 1, path: "" });

  const steps = useMemo<TourStep[]>(
    () => [
      {
        id: "home",
        title: "A shared starting point",
        body: "Planning brings current priorities, useful links and recent files together in one familiar place.",
        route: "/planning?demo=standalone",
        selector: ".site-header",
        camera: "wide",
        duration: 5200,
      },
      {
        id: "navigation",
        title: "A clear way around",
        body: "The left-hand menu stays consistent as you move between the workspace home and its document libraries.",
        route: "/planning?demo=standalone",
        selector: ".sidebar nav",
        camera: "navigation",
        duration: 5600,
      },
      {
        id: "open-library",
        title: "Open the right library",
        body: "Planning Cycles keeps active planning files together. Watch the pointer open it from the menu.",
        route: "/planning?demo=standalone",
        selector: ".sidebar nav button",
        matchText: "Planning Cycles",
        camera: "wide",
        click: true,
        duration: 5600,
      },
      {
        id: "cycle-folder",
        title: "Work is grouped by cycle",
        body: "Folders bring each planning cycle and its working material into a clear, predictable structure.",
        route: "/planning/cycles?demo=standalone",
        selector: ".main-content button",
        matchText: "2027 Annual Planning",
        camera: "wide",
        click: true,
        duration: 5600,
      },
      {
        id: "guidance-folder",
        title: "Keep related files together",
        body: "Guidance and decisions sit together inside the cycle, close to the work they support.",
        route: "/planning/cycles?folder=2027+Annual+Planning&demo=standalone",
        selector: ".main-content button",
        matchText: "Guidance & decisions",
        camera: "wide",
        click: true,
        duration: 5600,
      },
      {
        id: "metadata",
        title: "Useful details at a glance",
        body: "Clear file names work alongside planning cycle, document type, status, owner and sensitivity, so people can scan what matters to this workflow.",
        route:
          "/planning/cycles?folder=2027+Annual+Planning%2FGuidance+%26+decisions&demo=standalone",
        selector: ".main-content table tbody tr:first-child",
        camera: "metadata",
        duration: 6800,
      },
      {
        id: "open-channels",
        title: "Move from files to discussion",
        body: "Planning conversations are one click away, connected to the workspace without interrupting the file structure.",
        route:
          "/planning/cycles?folder=2027+Annual+Planning%2FGuidance+%26+decisions&demo=standalone",
        selector: ".teams-button",
        camera: "wide",
        click: true,
        duration: 5600,
      },
      {
        id: "channels",
        title: "Conversations stay focused",
        body: "Planning & Reporting keeps updates and coordination centred on the planning work.",
        route: planningChannelUrl(),
        selector: ".m365-teams-channel-header",
        camera: "channels",
        duration: 6200,
      },
    ],
    [],
  );
  const step = steps[index];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
      if (event.matches) setPlaying(false);
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
    const doc = frame?.contentDocument;
    if (!frame || !doc) return;
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
      return;
    }

    doc
      .querySelectorAll(".cinematic-tour-focus")
      .forEach((element) => element.classList.remove("cinematic-tour-focus"));
    const target = findTarget(doc, step);
    if (!target) return;
    target.scrollIntoView({
      behavior: reducedMotion ? "instant" : "smooth",
      block: "center",
      inline: "nearest",
    });
    target.classList.add("cinematic-tour-focus");

    if (!step.click) return;

    const updatePointer = () => {
      const screenNode = screen.current;
      if (!screenNode) return;
      const targetRect = mapTargetToScreen(target, frame, screenNode);
      setPointer({
        left: targetRect.left + targetRect.width / 2,
        top: targetRect.top + targetRect.height / 2,
        visible: true,
        clicking: false,
      });
    };
    const pointerFrame = requestAnimationFrame(updatePointer);
    const clickTimer = window.setTimeout(
      () => {
        setPointer((currentPointer) => ({ ...currentPointer, clicking: true }));
        target.click();
        window.setTimeout(
          () =>
            setPointer((currentPointer) => ({
              ...currentPointer,
              clicking: false,
            })),
          360,
        );
      },
      reducedMotion ? 180 : 1500,
    );
    return () => {
      cancelAnimationFrame(pointerFrame);
      window.clearTimeout(clickTimer);
    };
  }, [frameReady, loadRevision, index, reducedMotion, step]);

  useEffect(() => {
    if (!frameReady || !playing) return;
    const timer = window.setTimeout(() => {
      if (index === steps.length - 1) setPlaying(false);
      else setIndex((current) => current + 1);
    }, step.duration);
    return () => window.clearTimeout(timer);
  }, [frameReady, playing, index, step.duration, steps.length]);

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
      const frame = iframe.current;
      if (frame) frame.src = "/planning?demo=standalone";
      setFrameReady(false);
      setIndex(0);
      setPlaying(true);
      return;
    }
    setIndex((current) => Math.min(steps.length - 1, current + 1));
  };
  const goBack = () => {
    setPlaying(false);
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
                  tabIndex={-1}
                  aria-label={t("Live preview of the Planning workspace")}
                />
              </div>
              <div
                className={`cinematic-pointer${pointer.visible && step.click ? " is-visible" : ""}${pointer.clicking ? " is-clicking" : ""}`}
                style={{ left: pointer.left, top: pointer.top }}
                aria-hidden="true"
              >
                <svg viewBox="0 0 28 36">
                  <path d="M3 2 24 21l-9 1 5 10-5 2-5-11-6 7Z" />
                </svg>
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
              ? t("Follow the Planning workspace")
              : t("Opening the Planning workspace…")}
          </span>
          <div className="cinematic-tour-buttons">
            <button type="button" onClick={goBack} disabled={index === 0}>
              {t("Back")}
            </button>
            {index === steps.length - 1 ? (
              <button
                type="button"
                className="cinematic-primary-control"
                onClick={advance}
              >
                <Replay20Regular aria-hidden="true" /> {t("Replay tour")}
              </button>
            ) : (
              <button
                type="button"
                className="cinematic-primary-control"
                onClick={() => setPlaying(!playing)}
                aria-pressed={playing}
              >
                {playing ? (
                  <Pause20Regular aria-hidden="true" />
                ) : (
                  <Play20Regular aria-hidden="true" />
                )}
                {playing ? t("Pause") : t("Continue")}
              </button>
            )}
            <button
              type="button"
              onClick={advance}
              disabled={index === steps.length - 1}
            >
              {t("Next")}
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
              onClick={() => {
                setPlaying(false);
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
