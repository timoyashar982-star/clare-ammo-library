"use client";

import { FormEvent, useMemo, useState } from "react";

type LinkCheck = {
  ok?: boolean;
  status?: number | null;
  finalUrl?: string;
  error?: string | null;
};

export type Site = {
  id: string;
  name: string;
  url: string;
  headline?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  capabilities?: string[];
  scenarios?: string[];
  searchKeywords?: string[];
  isGithub?: boolean;
  repoType?: string;
  language?: string;
  stars?: number;
  install?: string;
  cover?: string;
  linkCheck?: LinkCheck;
};

type FilterState = {
  category: string;
  subcategory: string;
  githubOnly: boolean;
  repoType: string;
  language: string;
  query: string;
};

const all = "全部";

function unique(values: Array<string | undefined | null>) {
  return [...new Set(values.filter(Boolean) as string[])];
}

function countBy<T>(items: T[], getKey: (item: T) => string | undefined | null) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function searchableText(site: Site) {
  return [
    site.name,
    site.headline,
    site.category,
    site.subcategory,
    site.repoType,
    site.language,
    ...(site.tags || []),
    ...(site.capabilities || []),
    ...(site.scenarios || []),
    ...(site.searchKeywords || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesQuery(site: Site, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const text = searchableText(site);
  const compactText = text.replace(/\s+/g, "");
  const compactQuery = normalized.replace(/\s+/g, "");
  const tokens = normalized.split(/[\s,，/|]+/).filter(Boolean);

  return (
    text.includes(normalized) ||
    compactText.includes(compactQuery) ||
    tokens.every((token) => {
      const options = token.endsWith("工具") ? [token, token.replace(/工具$/, "")] : [token];
      return options.some((part) => part && (text.includes(part) || compactText.includes(part)));
    })
  );
}

function formatDisplayUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return url;
  }
}

function compactNumber(value: number) {
  if (!value) return "";
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 1 : 1)}k`;
  return String(value);
}

export function ToolWall({ initialSites }: { initialSites: Site[] }) {
  const [filters, setFilters] = useState<FilterState>({
    category: all,
    subcategory: all,
    githubOnly: false,
    repoType: all,
    language: all,
    query: "",
  });

  const categories = useMemo(() => [all, ...unique(initialSites.map((site) => site.category))], [initialSites]);
  const categoryCounts = useMemo(() => countBy(initialSites, (site) => site.category), [initialSites]);
  const githubSites = useMemo(() => initialSites.filter((site) => site.isGithub), [initialSites]);
  const repoTypeCounts = useMemo(() => countBy(githubSites, (site) => site.repoType), [githubSites]);
  const languageCounts = useMemo(() => countBy(githubSites, (site) => site.language), [githubSites]);

  const scopedForSubcategories = useMemo(
    () => (filters.category === all ? initialSites : initialSites.filter((site) => site.category === filters.category)),
    [filters.category, initialSites],
  );

  const subcategories = useMemo(
    () => [all, ...unique(scopedForSubcategories.map((site) => site.subcategory))],
    [scopedForSubcategories],
  );

  const filteredSites = useMemo(() => {
    return initialSites.filter((site) => {
      if (filters.category !== all && site.category !== filters.category) return false;
      if (filters.subcategory !== all && site.subcategory !== filters.subcategory) return false;
      if (filters.githubOnly && !site.isGithub) return false;
      if (filters.repoType !== all && site.repoType !== filters.repoType) return false;
      if (filters.language !== all && site.language !== filters.language) return false;
      return matchesQuery(site, filters.query);
    });
  }, [filters, initialSites]);

  function setPatch(patch: Partial<FilterState>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.querySelector("#browse")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <header className="top-header">
        <nav className="nav-shell" aria-label="主导航">
          <a className="brand glitch" href="#top" aria-label="回到首页">
            Clare 的私人弹药库
          </a>
          <a className="friend-ticket" href="#browse" aria-label="Clare 私藏">
            <span className="footprints">❧</span>
            <span>Clare 私藏</span>
          </a>
          <div className="nav-meta">
            <span>Next.js 复刻版</span>
            <span>·</span>
            <span>卡片直达外链</span>
            <button
              id="themeButton"
              className="gear"
              type="button"
              aria-label="切换主题"
              onClick={() => document.body.classList.toggle("paper-theme")}
            >
              ⚙
            </button>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="hero-imagine" aria-labelledby="heroTitle">
          <div className="scribble s1" aria-hidden="true" />
          <div className="scribble s2" aria-hidden="true" />
          <div className="hero-content">
            <p className="kicker-pill">私人收藏 · 动态手帐</p>
            <h1 id="heroTitle" className="hero-title" aria-label="你在做什么？">
              <span>你</span>
              <span>在</span>
              <span>做</span>
              <span>什</span>
              <span>么</span>
              <span>？</span>
            </h1>
            <p className="hero-sub">我亲手存的那些审美的、在生长的、不喧嚣的 AI 工具，你携带着。</p>

            <form id="askForm" className="ask-card" action="#browse" onSubmit={submitSearch}>
              <input
                id="heroSearch"
                className="ask-textarea"
                type="search"
                placeholder="AI 视频工具"
                autoComplete="off"
                aria-label="搜索工具"
                value={filters.query}
                onChange={(event) => setPatch({ query: event.target.value })}
              />
              <button className="ask-btn-jelly" type="submit">
                Ask AI
              </button>
            </form>

            <div className="prompt-rail" aria-label="快捷搜索">
              {["PPT 神器", "提示词工程", "API 中转", "AI 视频工具"].map((prompt) => (
                <button key={prompt} type="button" className="prompt-chip" onClick={() => setPatch({ query: prompt })}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          <div className="dotted-sep" aria-hidden="true" />
        </section>

        <section id="browse" className="browse-section" aria-labelledby="browseTitle">
          <aside className="browse-sidebar">
            <p className="browse-kicker">
              分类<small>按类型浏览</small>
            </p>
            <div className="category-list">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`cat-btn ${filters.category === category ? "active" : ""}`}
                  type="button"
                  onClick={() => setPatch({ category, subcategory: all })}
                >
                  <span>{category}</span>
                  <span>{category === all ? initialSites.length : categoryCounts[category]}</span>
                </button>
              ))}
            </div>

            <div className="side-section" id="githubFilter">
              <p className="side-title">GitHub</p>
              <button
                className={`cat-btn github-filter ${filters.githubOnly ? "active" : ""}`}
                type="button"
                onClick={() => setPatch({ githubOnly: !filters.githubOnly, repoType: all, language: all })}
              >
                <span>只看 GitHub</span>
                <span>{githubSites.length}</span>
              </button>
            </div>

            <div className="side-section" id="repoTypeList">
              <p className="side-title">类型</p>
              <div className="mini-filter-list">
                {[all, ...Object.keys(repoTypeCounts)].map((type) => (
                  <button
                    key={type}
                    className={`mini-filter ${filters.repoType === type ? "active" : ""}`}
                    type="button"
                    onClick={() => setPatch({ githubOnly: type !== all || filters.githubOnly, repoType: type })}
                  >
                    <span>{type}</span>
                    {type !== all && <span>{repoTypeCounts[type]}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="side-section" id="languageList">
              <p className="side-title">语言</p>
              <div className="mini-filter-list">
                {[all, ...Object.keys(languageCounts)].map((language) => (
                  <button
                    key={language}
                    className={`mini-filter ${filters.language === language ? "active" : ""}`}
                    type="button"
                    onClick={() => setPatch({ githubOnly: language !== all || filters.githubOnly, language })}
                  >
                    <span>{language}</span>
                    {language !== all && <span>{languageCounts[language]}</span>}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="browse-main">
            <div className="browse-toolbar">
              <div>
                <p className="eyebrow">tool wall</p>
                <h2 id="browseTitle" className="browse-main-title">
                  {filters.githubOnly ? "GitHub 工具" : filters.category === all ? "全部工具" : filters.category}
                  <span className="browse-count-dot">·</span>
                  <span>{filteredSites.length}</span>
                </h2>
                <p className="browse-meta">
                  {filters.subcategory === all ? "全部子类" : filters.subcategory}
                  {filters.repoType !== all && ` · ${filters.repoType}`}
                  {filters.language !== all && ` · ${filters.language}`}
                </p>
              </div>
              <label className="browse-search-shell">
                <span className="browse-search-icon">⌕</span>
                <input
                  id="browseSearch"
                  className="browse-search"
                  type="search"
                  placeholder="搜名称、标签、场景"
                  value={filters.query}
                  onChange={(event) => setPatch({ query: event.target.value })}
                />
              </label>
            </div>

            <div className="sub-list" aria-label="子分类">
              {subcategories.map((subcategory) => (
                <button
                  key={subcategory}
                  className={`sub-btn ${filters.subcategory === subcategory ? "active" : ""}`}
                  type="button"
                  onClick={() => setPatch({ subcategory })}
                >
                  {subcategory}
                </button>
              ))}
            </div>

            <div className="card-grid">
              {filteredSites.length ? (
                filteredSites.map((site) => <ToolCard key={site.id} site={site} />)
              ) : (
                <p className="empty">没有匹配的工具，换个关键词试试。</p>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Clare&apos;s private tool wall · cards jump directly to source links.</p>
      </footer>

      <button className="scroll-top-btn visible" type="button" aria-label="回到顶部" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        ↑
      </button>
    </>
  );
}

function ToolCard({ site }: { site: Site }) {
  const tags = (site.tags || []).slice(0, 5);
  const displayUrl = formatDisplayUrl(site.url);

  return (
    <a className="site-card" href={site.url} aria-label={`打开 ${site.name}`}>
      <div className="site-cover">
        {site.cover ? <img src={site.cover} alt="" loading="lazy" referrerPolicy="no-referrer" /> : null}
      </div>
      <div className="site-body">
        {site.isGithub && (
          <div className="github-row">
            <span>☂</span>
            {site.stars ? <span>☆ {compactNumber(site.stars)}</span> : null}
            {site.language ? <span className="repo-badge">{site.language}</span> : null}
            {site.repoType ? <span className="repo-badge soft">{site.repoType}</span> : null}
          </div>
        )}
        <div className="site-title-row">
          <h3 className="site-title">{site.name}</h3>
        </div>
        <p className="site-headline">{site.headline || "一件值得留在手边的小工具。"}</p>
        <div className="tag-list">
          {site.category && <span className="tag-pill">{site.category.replace(/^.+?\s/, "")}</span>}
          {site.subcategory && <span className="tag-pill">{site.subcategory}</span>}
          {tags.map((tag) => (
            <span className="tag-pill" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        {site.isGithub && site.install ? <p className="install-line">$ {site.install}</p> : null}
        <div className="site-footer">
          <span>{displayUrl}</span>
        </div>
      </div>
    </a>
  );
}
