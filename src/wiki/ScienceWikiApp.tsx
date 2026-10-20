import { useMemo, useState } from "react";
import { Search20Regular } from "@fluentui/react-icons";
import { LanguageToggle, useTranslation } from "../i18n/Language";
import StaffLink from "../components/StaffLink";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "./science-wiki.css";

export const scienceWikiArticles = [
  {
    area: "Biology",
    title: "How cells organise life",
    summary:
      "A cell is the smallest unit that can carry out the processes associated with life. Its membrane separates the cell from its surroundings, while internal structures perform specialised roles.",
    detail:
      "Plant and animal cells are eukaryotic: their DNA is enclosed in a nucleus. Plant cells also have a cellulose cell wall and chloroplasts, which capture light energy for photosynthesis.",
    diagram: "cell",
  },
  {
    area: "Biology",
    title: "Photosynthesis in brief",
    summary:
      "Plants, algae and some bacteria use light energy to make sugars from carbon dioxide and water.",
    detail:
      "In plants, photosynthesis takes place in chloroplasts. Oxygen is released as a by-product. The simplified equation is carbon dioxide + water + light energy → glucose + oxygen.",
    diagram: "photosynthesis",
  },
  {
    area: "Chemistry",
    title: "Acids, bases and the pH scale",
    summary:
      "The pH scale describes how acidic or alkaline an aqueous solution is. Values below 7 are acidic, 7 is neutral at room temperature, and values above 7 are alkaline.",
    detail:
      "The scale is logarithmic: a change of one pH unit corresponds to a tenfold change in hydrogen-ion concentration. A measured pH depends on conditions such as temperature and concentration.",
    diagram: "ph",
  },
  {
    area: "Chemistry",
    title: "Atoms and elements",
    summary:
      "An atom has a nucleus containing protons and usually neutrons, surrounded by electrons. The number of protons defines the element.",
    detail:
      "Atoms can join through chemical bonds to form molecules. In ordinary chemical reactions, atoms are rearranged; the nuclei and element identities remain unchanged.",
    diagram: "atom",
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
];
const articles = scienceWikiArticles;
const areas = ["Biology", "Chemistry", "Physiology"];
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

function Diagram({ kind }: { kind: string }) {
  const diagram = {
    cell: {
      title: "Simplified animal cell",
      desc: "A nucleus sits within a cell surrounded by a membrane; mitochondria are shown in the cytoplasm.",
      nodes: ["Cell membrane", "Cytoplasm", "Nucleus", "Mitochondria"],
    },
    photosynthesis: {
      title: "Photosynthesis inputs and outputs",
      desc: "Light, carbon dioxide and water lead to glucose and oxygen in photosynthesis.",
      nodes: ["Light + CO₂ + water", "Chloroplast", "Glucose + oxygen"],
    },
    ph: {
      title: "A simplified pH scale",
      desc: "Acidic values are below seven, seven is neutral, and alkaline values are above seven.",
      nodes: ["Acidic · 0–6", "Neutral · 7", "Alkaline · 8–14"],
    },
    atom: {
      title: "Simplified atom",
      desc: "A central nucleus contains protons and neutrons, with electrons around it.",
      nodes: ["Electrons", "Protons + neutrons", "Nucleus"],
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
  }[kind as "cell"];
  return (
    <figure className="science-diagram">
      <svg
        viewBox="0 0 720 145"
        role="img"
        aria-label={diagram.title + ". " + diagram.desc}
      >
        <title>{diagram.title}</title>
        <desc>{diagram.desc}</desc>
        {diagram.nodes.map((node, i) => {
          const width = 150;
          const x = 20 + i * (680 / diagram.nodes.length);
          return (
            <g key={node}>
              <rect x={x} y="42" width={width} height="58" rx="8" />
              <text x={x + width / 2} y="76" textAnchor="middle">
                {node}
              </text>
              {i < diagram.nodes.length - 1 && (
                <path
                  d={`M ${x + width + 4} 71 h ${680 / diagram.nodes.length - width - 14}`}
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
  const [area, setArea] = useState(areas[0]);
  const [articleTitle, setArticleTitle] = useState(articles[0].title);
  const [query, setQuery] = useState("");
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
          <span className="science-wiki-mark" aria-hidden="true">
            ＋
          </span>
          <span>{t("Biology, Chemistry & Physiology Wiki")}</span>
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
            />
          </label>
          {query && (
            <nav
              className="wiki-search-results"
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
          <div className="wiki-rail-label">{t("Knowledge areas")}</div>
          <nav aria-label={t("Knowledge areas")}>
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
          <div className="wiki-rail-label">{t("Articles")}</div>
          <h2>{t(area)}</h2>
          <nav aria-label={t("Articles")}>
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
            <p className="science-wiki-kicker">{t(selected.area)}</p>
            <h1>{t(selected.title)}</h1>
            <p className="wiki-lede">{t(selected.summary)}</p>
            <Diagram kind={selected.diagram} />
            <section>
              <h2>{t("Key idea")}</h2>
              <p>{t(selected.detail)}</p>
            </section>
            <p className="science-wiki-note">
              {t("Learning reference · For general education")}
            </p>
          </article>
        </main>
      </div>
    </div>
  );
}
