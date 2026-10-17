import { useId } from "react";
import { useTranslation } from "../i18n/Language";
import { germanWikiFigureLabels } from "../i18n/de-wiki-refinement";

export const wikiFigures = {
  "working-with-creative-studio": {
    type: "flow",
    title: "From topic input to release",
    description:
      "Topic input informs the brief. The creative or channel desk produces the work, followed by review and release.",
    stages: [
      "Topic input",
      "Brief",
      "Creative / channel desk",
      "Review",
      "Release",
    ],
    caption:
      "A shared route through production. Agree ownership and review needs before work starts.",
  },
  "know-customers": {
    type: "journey",
    title: "The continuing customer relationship",
    description:
      "First contact leads to a welcome, continuing service and renewal. Feedback from service informs the next contact.",
    stages: ["First contact", "Welcome", "Continuing service", "Renewal"],
    caption:
      "Read the whole relationship together; feedback from service should improve the next contact.",
  },
  "channel-landscape": {
    type: "selection",
    title: "Choose the channel for the task",
    description:
      "Use a conversation when someone needs dialogue. Use a clear self-service journey when someone needs to complete a defined task.",
    stages: ["Needs dialogue", "Conversation", "Defined task", "Self-service"],
    caption:
      "Start with the person's task, then choose a channel that can support it.",
  },
  "conversion-metrics": {
    type: "funnel",
    title: "Keep the stages of conversion distinct",
    description:
      "An eligible audience produces qualifying actions, then validated outcomes. State the stage and denominator when reporting a rate.",
    stages: ["Eligible audience", "Qualifying actions", "Validated outcomes"],
    caption:
      "Name the event, denominator and time period. A later stage is a different measure, not a new name for the same result.",
  },
} as const;

export const wikiFigureCopy = Object.values(wikiFigures).flatMap((figure) => [
  figure.title,
  figure.description,
  figure.caption,
  ...figure.stages,
]);

function StageLabel({ x, y, label }: { x: number; y: number; label: string }) {
  const { language } = useTranslation();
  const translated =
    language === "de" ? germanWikiFigureLabels[label] || label : label;
  const words = translated.split(" ");
  const middle = Math.ceil(words.length / 2);
  const lines =
    translated.length > 17 && words.length > 1
      ? [words.slice(0, middle).join(" "), words.slice(middle).join(" ")]
      : [translated];
  return (
    <text
      data-no-translate
      x={x}
      y={y - (lines.length > 1 ? 9 : 0)}
      textAnchor="middle"
    >
      {lines.map((line, index) => (
        <tspan key={line} x={x} dy={index ? 20 : 0}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export default function WikiFigure({ articleId }: { articleId: string }) {
  const id = useId();
  const figure = wikiFigures[articleId as keyof typeof wikiFigures];
  if (!figure) return null;
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const markerId = `${id}-arrow`;
  return (
    <figure className={`wiki-figure wiki-figure-${figure.type}`}>
      <svg
        viewBox={`0 0 660 ${figure.type === "funnel" ? 240 : figure.type === "selection" ? 186 : 160}`}
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
      >
        <title id={titleId}>{figure.title}</title>
        <desc id={descriptionId}>{figure.description}</desc>
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M1 1 7 4 1 7" fill="none" stroke="currentColor" />
          </marker>
        </defs>
        {figure.type === "flow" &&
          figure.stages.map((stage, index) => {
            const widths = [116, 90, 122, 90, 136];
            const width = widths[index];
            const x =
              9 +
              widths
                .slice(0, index)
                .reduce((sum, value) => sum + value + 20, 0);
            return (
              <g key={stage}>
                <rect x={x} y="43" width={width} height="66" rx="5" />
                <StageLabel x={x + width / 2} y={81} label={stage} />
                {index < 4 && (
                  <path
                    d={`M ${x + width + 3} 76 h 13`}
                    markerEnd={`url(#${markerId})`}
                  />
                )}
              </g>
            );
          })}
        {figure.type === "journey" && (
          <>
            <path d="M 65 47 H 594" markerEnd={`url(#${markerId})`} />
            {figure.stages.map((stage, index) => (
              <g key={stage}>
                <circle cx={75 + index * 170} cy="47" r="9" />
                <StageLabel x={75 + index * 170} y={91} label={stage} />
              </g>
            ))}
            <path
              className="wiki-figure-feedback"
              d="M 585 118 v 20 H 75 v -18"
              markerEnd={`url(#${markerId})`}
            />
          </>
        )}
        {figure.type === "selection" &&
          [0, 1].map((row) => (
            <g key={row}>
              <rect x="38" y={20 + row * 86} width="220" height="58" rx="5" />
              <StageLabel
                x={148}
                y={55 + row * 86}
                label={figure.stages[row * 2]}
              />
              <path
                d={`M 276 ${49 + row * 86} H 367`}
                markerEnd={`url(#${markerId})`}
              />
              <rect x="385" y={20 + row * 86} width="237" height="58" rx="5" />
              <StageLabel
                x={503}
                y={55 + row * 86}
                label={figure.stages[row * 2 + 1]}
              />
            </g>
          ))}
        {figure.type === "funnel" &&
          figure.stages.map((stage, index) => {
            const inset = 70 + index * 64;
            const y = 12 + index * 74;
            return (
              <g key={stage}>
                <polygon
                  points={`${inset},${y} ${660 - inset},${y} ${624 - inset},${y + 60} ${inset + 36},${y + 60}`}
                />
                <StageLabel x={330} y={y + 36} label={stage} />
              </g>
            );
          })}
      </svg>
      <figcaption>{figure.caption}</figcaption>
    </figure>
  );
}
