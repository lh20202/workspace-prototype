import { useMemo, useState } from "react";
import { Search20Regular } from "@fluentui/react-icons";
import { LanguageToggle, useTranslation } from "../i18n/Language";
import StaffLink from "../components/StaffLink";
import EnvironmentIcon from "../components/EnvironmentIcon";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "./styles.css";
import "./science-wiki.css";

export const scienceWikiArticles = [
  {
    area: "Biochemistry",
    title: "Proteins and enzymes",
    summary:
      "Proteins are built from amino acids and fold into shapes that help them do particular jobs. Some proteins act as enzymes, speeding up chemical reactions in cells.",
    detail:
      "A reactant an enzyme acts on is called a substrate. It binds at the enzyme's active site, is converted into product, and then leaves. The enzyme can take part in another reaction; it is not used up by the process.",
    diagram: "enzyme",
  },
  {
    area: "Biochemistry",
    title: "How cells use ATP",
    summary:
      "Cells use adenosine triphosphate (ATP) to transfer energy to many of the reactions and processes that need it.",
    detail:
      "When ATP is converted to ADP and phosphate, the change can be coupled to an energy-requiring reaction. Cells continually rebuild ATP using energy captured from nutrients or, in photosynthetic organisms, light.",
    diagram: "atp",
  },
  {
    area: "Biochemistry",
    title: "pH in living systems",
    summary:
      "Cells rely on carefully regulated pH. Enzymes and other proteins work best within particular conditions, so even small changes can affect cell processes.",
    detail:
      "The pH scale is logarithmic: a change of one unit corresponds to a tenfold change in hydrogen-ion concentration. Cells use buffers and other controls to keep conditions within a useful range.",
    diagram: "ph",
  },
  {
    area: "Biochemistry",
    title: "Biomolecules and chemical bonds",
    summary:
      "Proteins, carbohydrates, lipids and nucleic acids are biomolecules built from atoms joined by chemical bonds.",
    detail:
      "The shape and properties of a biomolecule depend on its atoms and bonds. Cells assemble, break down and modify these molecules as part of everyday processes.",
    diagram: "biomolecule",
  },
  {
    area: "Physiology",
    title: "How blood circulates through the heart",
    summary:
      "The right side of the heart sends blood to the lungs. The left side sends oxygenated blood to the body.",
    detail:
      "Valves help keep blood moving in one direction. This overview describes normal anatomy for learning and is not clinical guidance.",
    diagram: "circulation",
  },
  {
    area: "Physiology",
    title: "The respiratory system and gas exchange",
    summary:
      "Air reaches tiny lung structures called alveoli, where oxygen and carbon dioxide diffuse between air and blood across thin surfaces.",
    detail:
      "Diffusion moves particles down their concentration gradients. Circulation carries oxygen from the lungs to tissues and returns carbon dioxide to the lungs.",
    diagram: "lungs",
  },
] as const;
const articles = scienceWikiArticles;
const areas = ["Biochemistry", "Physiology"];
export function searchScienceWiki(query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  return normalized
    ? articles.filter((item) =>
        `${item.title} ${item.summary} ${item.area} ${item.detail}`
          .toLocaleLowerCase()
          .includes(normalized),
      )
    : [];
}

const diagrams = {
  enzyme: {
    title: "How an enzyme catalyses a reaction",
    desc: "A substrate binds to an enzyme, is converted into product, and leaves the enzyme available for another reaction.",
    nodes: ["Enzyme + substrate", "Bound at active site", "Product + enzyme"],
  },
  atp: {
    title: "ATP transfers energy in cells",
    desc: "ATP transfers energy to cell processes as it becomes ADP and phosphate; energy from nutrients or light helps rebuild ATP.",
    nodes: ["Energy source", "ADP + phosphate → ATP", "Cell process → ADP"],
  },
  ph: {
    title: "A simplified pH scale",
    desc: "Acidic values are below seven, seven is neutral, and alkaline values are above seven.",
    nodes: ["Acidic · 0–6", "Neutral · 7", "Alkaline · 8–14"],
  },
  biomolecule: {
    title: "Building a biomolecule",
    desc: "Cells join smaller building blocks through chemical bonds to make larger biomolecules.",
    nodes: ["Building blocks", "Chemical bonds", "Biomolecule"],
  },
  circulation: {
    title: "Pulmonary and systemic circulation",
    desc: "Blood travels from the right heart to the lungs, returns to the left heart, then travels to the body.",
    nodes: ["Right heart", "Lungs", "Left heart", "Body"],
  },
  lungs: {
    title: "Gas exchange at the lungs",
    desc: "Oxygen diffuses from alveolar air into blood, while carbon dioxide diffuses from blood into the alveolus.",
    nodes: ["Alveolar air", "Thin exchange surface", "Blood"],
  },
};

function Diagram({ kind }: { kind: keyof typeof diagrams }) {
  const diagram = diagrams[kind];
  return (
    <figure className="wiki-figure science-diagram">
      <svg
        viewBox="0 0 720 145"
        role="img"
        aria-label={diagram.title + ". " + diagram.desc}
      >
        <title>{diagram.title}</title>
        <desc>{diagram.desc}</desc>
        {diagram.nodes.map((node, i) => {
          const count = diagram.nodes.length;
          const width = count > 3 ? 150 : 190;
          const gap = (680 - width * count) / (count - 1);
          const x = 20 + i * (width + gap);
          return (
            <g key={node}>
              <rect x={x} y="42" width={width} height="58" rx="8" />
              <text x={x + width / 2} y="76" textAnchor="middle">
                {node}
              </text>
              {i < diagram.nodes.length - 1 && (
                <path
                  d={`M ${x + width + 4} 71 h ${gap - 14}`}
                  markerEnd="url(#science-arrow)"
                />
              )}
            </g>
          );
        })}
        <defs>
          <marker
            id="science-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0 0 L6 3 L0 6" />
          </marker>
        </defs>
      </svg>
      <figcaption>{diagram.desc}</figcaption>
    </figure>
  );
}

export default function ScienceWikiApp() {
  const { t } = useTranslation();
  const [area, setArea] = useState<string>(areas[0]);
  const [articleTitle, setArticleTitle] = useState<string>(articles[0].title);
  const [query, setQuery] = useState("");
  const [areasOpen, setAreasOpen] = useState(false);
  const [articlesOpen, setArticlesOpen] = useState(false);
  const selected =
    articles.find((article) => article.title === articleTitle) || articles[0];
  const matches = useMemo(() => searchScienceWiki(query), [query]);
  const choose = (title: string) => {
    const next = articles.find((item) => item.title === title);
    if (!next) return;
    setArticleTitle(title);
    setArea(next.area);
    setQuery("");
  };
  return (
    <div className="sales-wiki science-wiki">
      <a className="skip-link" href="#science-main">
        Skip to article
      </a>
      <header className="wiki-header">
        <StaffLink className="wiki-identity" href="/architecture">
          <EnvironmentIcon type="wiki" size={34} />
          <span>{t("Biochemistry & Physiology Wiki")}</span>
        </StaffLink>
        <div className="wiki-search">
          <label>
            <Search20Regular aria-hidden="true" />
            <input
              type="search"
              aria-label={t("Search this Wiki")}
              placeholder={t("Search this Wiki")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
              }}
              aria-controls={
                query.trim() ? "science-search-results" : undefined
              }
              aria-expanded={!!query.trim()}
            />
          </label>
          {query.trim() && (
            <nav
              className="wiki-search-results"
              id="science-search-results"
              aria-label={t("Search results")}
            >
              {matches.length ? (
                matches.map((item) => (
                  <button key={item.title} onClick={() => choose(item.title)}>
                    <strong>{t(item.title)}</strong>
                    <small>{t(item.area)}</small>
                  </button>
                ))
              ) : (
                <p>{t("No matching articles.")}</p>
              )}
            </nav>
          )}
        </div>
        <div className="product-language-toggle wiki-language-toggle">
          <LanguageToggle />
        </div>
      </header>
      <div className="wiki-layout science-wiki-layout">
        <aside className="wiki-primary-rail">
          <button
            className="wiki-mobile-nav"
            aria-expanded={areasOpen}
            aria-controls="science-area-nav"
            onClick={() => setAreasOpen(!areasOpen)}
          >
            {t("Browse knowledge areas")}
          </button>
          <div className="wiki-rail-label">{t("Knowledge areas")}</div>
          <nav
            id="science-area-nav"
            className={areasOpen ? "is-open" : ""}
            aria-label={t("Knowledge areas")}
          >
            {areas.map((item) => (
              <button
                key={item}
                aria-current={area === item ? "page" : undefined}
                onClick={() => {
                  setArea(item);
                  const first = articles.find((a) => a.area === item);
                  if (first) setArticleTitle(first.title);
                }}
              >
                {t(item)}
              </button>
            ))}
          </nav>
        </aside>
        <aside className="wiki-chapter-rail">
          <button
            className="wiki-mobile-nav"
            aria-expanded={articlesOpen}
            aria-controls="science-article-nav"
            onClick={() => setArticlesOpen(!articlesOpen)}
          >
            {t("Browse articles")}
          </button>
          <div className="wiki-rail-label">{t("Articles")}</div>
          <h2>{t(area)}</h2>
          <nav
            id="science-article-nav"
            className={articlesOpen ? "is-open" : ""}
            aria-label={t("Articles")}
          >
            {articles
              .filter((item) => item.area === area)
              .map((item) => (
                <button
                  key={item.title}
                  aria-current={
                    selected.title === item.title ? "page" : undefined
                  }
                  onClick={() => choose(item.title)}
                >
                  {t(item.title)}
                </button>
              ))}
          </nav>
        </aside>
        <main className="wiki-main" id="science-main" tabIndex={-1}>
          <p className="wiki-breadcrumb">
            {t("Knowledge areas")} <span aria-hidden="true">›</span>{" "}
            {t(selected.area)}
          </p>
          <article className="wiki-article">
            <header>
              <h1>{t(selected.title)}</h1>
              <p className="wiki-lede">{t(selected.summary)}</p>
              <dl className="wiki-metadata">
                <div>
                  <dt>{t("Last reviewed")}</dt>
                  <dd>
                    <time dateTime="2026-10-12">12 October 2026</time>
                  </dd>
                </div>
                <div>
                  <dt>{t("Article owner")}</dt>
                  <dd>{t("Frontline science team")}</dd>
                </div>
              </dl>
            </header>
            <nav
              className="wiki-on-this-page"
              aria-label={t("Article sections")}
            >
              <strong>{t("On this page")}</strong>
              <a href="#science-key-idea">{t("Key idea")}</a>
              <a href="#science-related-reading">{t("Related reading")}</a>
            </nav>
            <Diagram kind={selected.diagram} />
            <section id="science-key-idea">
              <h2>{t("Key idea")}</h2>
              <p>{t(selected.detail)}</p>
            </section>
            <section className="wiki-related" id="science-related-reading">
              <h2>{t("Related reading")}</h2>
              <div>
                {articles
                  .filter(
                    (item) =>
                      item.area === selected.area &&
                      item.title !== selected.title,
                  )
                  .map((item) => (
                    <button key={item.title} onClick={() => choose(item.title)}>
                      {t(item.title)}
                    </button>
                  ))}
              </div>
            </section>
          </article>
        </main>
      </div>
    </div>
  );
}
