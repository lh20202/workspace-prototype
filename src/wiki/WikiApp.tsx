import { canAccessWikiArea } from "../access/policy";
import { resolveStaffPerson } from "../intranet/catalog";
import AccessBoundary from "../access/AccessBoundary";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  ArrowLeft20Regular,
  ArrowRight20Regular,
  Search20Regular,
} from "@fluentui/react-icons";
import HubNavigation from "../components/HubNavigation";
import StaffLink from "../components/StaffLink";
import { withExplicitStaff } from "../utils/staffNavigation";
import EnvironmentIcon from "../components/EnvironmentIcon";
import NavigationIcon from "../components/NavigationIcon";
import DocumentLibrary from "../sharepoint/DocumentLibrary";
import WikiFigure from "./WikiFigure";
import { matchesDisplayText } from "../i18n/search";
import {
  resolveWikiPath,
  wikiAreas,
  wikiAreaHref,
  wikiArticles,
  wikiArticleHref,
  wikiBase,
  wikiFiles,
  wikiFolders,
  wikiLibrary,
  wikiLibraryTitle,
  wikiSourceHref,
} from "./content";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "./styles.css";

function sectionId(index: number) {
  return `wiki-section-${index + 1}`;
}

export default function WikiApp() {
  const [url, setUrl] = useState(() => location.pathname + location.search);
  const [query, setQuery] = useState("");
  const [areasOpen, setAreasOpen] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const main = useRef<HTMLElement>(null);
  const path = url.split("?")[0];
  const { area, article, valid } = resolveWikiPath(path);
  const person = resolveStaffPerson(
    new URLSearchParams(url.split("?")[1]).get("staff"),
  );
  const allowedArticles = wikiArticles.filter((item) =>
    canAccessWikiArea(person, item.areaId),
  );
  const requestedSource = new URLSearchParams(url.split("?")[1]).get("file");
  const sourceArticle = wikiArticles.find(
    (item) => item.sourceId === requestedSource,
  );
  const deniedArea =
    area && !canAccessWikiArea(person, area.id)
      ? area
      : sourceArticle && !canAccessWikiArea(person, sourceArticle.areaId)
        ? wikiAreas.find((item) => item.id === sourceArticle.areaId)
        : undefined;
  const allowedFiles = wikiFiles.filter((file) =>
    allowedArticles.some((item) => item.sourceId === file.id),
  );
  const allowedFolders = wikiFolders.filter((folder) =>
    allowedFiles.some(
      (file) => file.folder === folder || file.folder.startsWith(folder + "/"),
    ),
  );
  const chapters = allowedArticles.filter((item) => item.areaId === area?.id);
  const index = article ? chapters.indexOf(article) : -1;
  const previous = chapters[index - 1];
  const next = chapters[index + 1];
  const searchResults = query.trim()
    ? allowedArticles
        .filter((item) =>
          matchesDisplayText(
            [
              item.title,
              item.introduction,
              ...item.sections.map((section) => section.heading),
            ].join("\n"),
            query,
          ),
        )
        .slice(0, 8)
    : [];
  const directory = area?.id === "a-z";

  useEffect(() => {
    const restore = () => {
      setUrl(location.pathname + location.search);
      setQuery("");
      setAreasOpen(false);
      setChaptersOpen(false);
    };
    addEventListener("popstate", restore);
    return () => removeEventListener("popstate", restore);
  }, []);

  function navigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    href = withExplicitStaff(href);
    if (location.pathname + location.search !== href)
      history.pushState(null, "", href);
    setUrl(href);
    setQuery("");
    setAreasOpen(false);
    setChaptersOpen(false);
    main.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  const sourceFolder =
    new URLSearchParams(url.split("?")[1]).get("folder") || "";
  const folderHref = (folder = "") =>
    `${wikiBase}/a-z?${new URLSearchParams({ library: wikiLibraryTitle, ...(folder ? { folder } : {}) })}`;

  return (
    <div className="sales-wiki">
      <StaffLink href="#wiki-main" className="skip-link">
        Skip to Wiki article
      </StaffLink>
      <header className="wiki-header">
        <StaffLink
          href={wikiBase}
          className="wiki-identity"
          onClick={(event) => navigate(event, wikiBase)}
        >
          <EnvironmentIcon type="wiki" size={34} />
          <span>Sales & Marketing Wiki</span>
        </StaffLink>
        <div className="wiki-search">
          <label>
            <Search20Regular aria-hidden="true" />
            <input
              type="search"
              aria-label="Search this Wiki"
              placeholder="Search this Wiki"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setQuery("");
              }}
              aria-controls={query.trim() ? "wiki-search-results" : undefined}
              aria-expanded={!!query.trim()}
            />
          </label>
          {query.trim() && (
            <nav
              id="wiki-search-results"
              className="wiki-search-results"
              aria-label="Wiki search results"
            >
              {searchResults.length ? (
                searchResults.map((item) => (
                  <StaffLink
                    key={item.id}
                    href={wikiArticleHref(item)}
                    onClick={(event) => navigate(event, wikiArticleHref(item))}
                  >
                    <strong>{item.title}</strong>
                    <small>
                      {
                        wikiAreas.find(
                          (candidate) => candidate.id === item.areaId,
                        )?.title
                      }
                    </small>
                  </StaffLink>
                ))
              ) : (
                <p>No matching articles.</p>
              )}
            </nav>
          )}
        </div>
      </header>
      <HubNavigation workspaceId="sales-wiki" />
      <div className="wiki-layout">
        <aside className="wiki-primary-rail">
          <button
            className="wiki-mobile-nav"
            aria-expanded={areasOpen}
            aria-controls="wiki-area-nav"
            onClick={() => setAreasOpen(!areasOpen)}
          >
            Browse knowledge areas
          </button>
          <div className="wiki-rail-label">Knowledge areas</div>
          <nav
            id="wiki-area-nav"
            className={areasOpen ? "is-open" : ""}
            aria-label="Wiki area navigation"
          >
            {wikiAreas.map((item) => (
              <StaffLink
                key={item.id}
                href={wikiAreaHref(item.id)}
                aria-current={area?.id === item.id ? "page" : undefined}
                onClick={(event) => navigate(event, wikiAreaHref(item.id))}
              >
                {item.id === "a-z" && <NavigationIcon kind="library" />}
                {item.title}
              </StaffLink>
            ))}
          </nav>
        </aside>
        <aside className="wiki-chapter-rail">
          <button
            className="wiki-mobile-nav"
            aria-expanded={chaptersOpen}
            aria-controls="wiki-chapter-nav"
            onClick={() => setChaptersOpen(!chaptersOpen)}
          >
            Browse chapters
          </button>
          <div className="wiki-rail-label">
            {directory ? "Reference folders" : "Chapters"}
          </div>
          <h2>{area?.title || "Foundations"}</h2>
          <nav
            key={area?.id}
            id="wiki-chapter-nav"
            className={chaptersOpen ? "is-open" : ""}
            aria-label="Wiki chapter navigation"
          >
            {directory ? (
              <>
                <StaffLink
                  href={folderHref()}
                  aria-current={!sourceFolder ? "page" : undefined}
                  onClick={(event) => navigate(event, folderHref())}
                >
                  All references
                </StaffLink>
                {allowedFolders.map((folder) => (
                  <StaffLink
                    key={folder}
                    href={folderHref(folder)}
                    aria-current={sourceFolder === folder ? "page" : undefined}
                    onClick={(event) => navigate(event, folderHref(folder))}
                  >
                    <NavigationIcon kind="library" />
                    {folder}
                  </StaffLink>
                ))}
              </>
            ) : (
              chapters.map((item) => (
                <StaffLink
                  key={item.id}
                  href={wikiArticleHref(item)}
                  aria-current={article?.id === item.id ? "page" : undefined}
                  onClick={(event) => navigate(event, wikiArticleHref(item))}
                >
                  {item.title}
                </StaffLink>
              ))
            )}
          </nav>
        </aside>
        <main
          id="wiki-main"
          ref={main}
          tabIndex={-1}
          className={`wiki-main${directory ? " wiki-directory" : ""}`}
        >
          <div className="wiki-breadcrumb">
            <StaffLink
              href={wikiAreaHref(area?.id || "foundations")}
              onClick={(event) =>
                navigate(event, wikiAreaHref(area?.id || "foundations"))
              }
            >
              {area?.title || "Foundations"}
            </StaffLink>
            {article && (
              <>
                <span aria-hidden="true">/</span>
                <span>{article.title}</span>
              </>
            )}
          </div>
          {deniedArea ? (
            <AccessBoundary
              workspaceId="sales-wiki"
              area={deniedArea.title}
              personId={person.id}
              resource={{ kind: "wiki", areaId: deniedArea.id }}
              returnHref={wikiBase}
              returnLabel="Return to Wiki"
            />
          ) : !valid ? (
            <section>
              <h1>Article not found</h1>
              <p>Choose a knowledge area to continue.</p>
            </section>
          ) : directory ? (
            <section className="wiki-directory-surface">
              <h1>A–Z Directory</h1>
              <p>Browse the managed references behind these articles.</p>
              <DocumentLibrary
                key={url}
                title={wikiLibraryTitle}
                definition={wikiLibrary}
                files={allowedFiles}
                folders={allowedFolders}
                readOnly
                headingLevel={2}
              />
            </section>
          ) : (
            article && (
              <article
                key={article.id}
                className="wiki-article"
                aria-label="Wiki article"
              >
                <header>
                  <h1>{article.title}</h1>
                  <p className="wiki-lede">{article.introduction}</p>
                  <dl className="wiki-metadata">
                    <div>
                      <dt>Last reviewed</dt>
                      <dd>
                        <time dateTime={article.reviewed}>12 October 2026</time>
                      </dd>
                    </div>
                    <div>
                      <dt>Article owner</dt>
                      <dd>{article.owner}</dd>
                    </div>
                  </dl>
                </header>
                <nav
                  className="wiki-on-this-page"
                  aria-label="Article sections"
                >
                  <strong>On this page</strong>
                  {article.sections.map((section, i) => (
                    <StaffLink key={section.heading} href={`#${sectionId(i)}`}>
                      {section.heading}
                    </StaffLink>
                  ))}
                </nav>
                <WikiFigure articleId={article.id} />
                {article.sections.map((section, i) => (
                  <section key={section.heading} id={sectionId(i)}>
                    <h2>{section.heading}</h2>
                    <ul>
                      {section.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </section>
                ))}
                <section className="wiki-related">
                  <h2>Related reading</h2>
                  <div>
                    {article.id === "working-with-creative-studio" && (
                      <StaffLink href="/content-delivery">
                        Open Creative Studio
                        <ArrowRight20Regular aria-hidden="true" />
                      </StaffLink>
                    )}
                    {chapters
                      .filter((item) => item.id !== article.id)
                      .slice(0, 3)
                      .map((item) => (
                        <StaffLink
                          key={item.id}
                          href={wikiArticleHref(item)}
                          onClick={(event) =>
                            navigate(event, wikiArticleHref(item))
                          }
                        >
                          {item.title}
                          <ArrowRight20Regular aria-hidden="true" />
                        </StaffLink>
                      ))}
                    {area?.id === "contacts" && (
                      <StaffLink
                        href={wikiAreaHref("tools")}
                        onClick={(event) =>
                          navigate(event, wikiAreaHref("tools"))
                        }
                      >
                        Tools & How-tos
                        <ArrowRight20Regular aria-hidden="true" />
                      </StaffLink>
                    )}
                  </div>
                </section>
                <footer className="wiki-source">
                  <span>Reference source</span>
                  <StaffLink
                    href={wikiSourceHref(article)}
                    onClick={(event) =>
                      navigate(event, wikiSourceHref(article))
                    }
                  >
                    <NavigationIcon kind="library" />
                    Open managed source
                  </StaffLink>
                </footer>
                <nav
                  className="wiki-article-pagination"
                  aria-label="Article navigation"
                >
                  {previous ? (
                    <StaffLink
                      href={wikiArticleHref(previous)}
                      onClick={(event) =>
                        navigate(event, wikiArticleHref(previous))
                      }
                    >
                      <ArrowLeft20Regular aria-hidden="true" />
                      <span>
                        <small>Previous article</small>
                        {previous.title}
                      </span>
                    </StaffLink>
                  ) : (
                    <span />
                  )}
                  {next && (
                    <StaffLink
                      href={wikiArticleHref(next)}
                      onClick={(event) =>
                        navigate(event, wikiArticleHref(next))
                      }
                    >
                      <span>
                        <small>Next article</small>
                        {next.title}
                      </span>
                      <ArrowRight20Regular aria-hidden="true" />
                    </StaffLink>
                  )}
                </nav>
              </article>
            )
          )}
        </main>
      </div>
    </div>
  );
}
