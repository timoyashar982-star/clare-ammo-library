const sites = window.CLARE_TOOL_DATA || [];

const state = {
  activeCategory: "全部",
  activeSubcategory: "全部",
  query: "",
};

const els = {
  activeLabel: document.querySelector("#activeLabel"),
  categoryList: document.querySelector("#categoryList"),
  subCategoryList: document.querySelector("#subCategoryList"),
  cardGrid: document.querySelector("#cardGrid"),
  heroSearch: document.querySelector("#heroSearch"),
  browseSearch: document.querySelector("#browseSearch"),
  askForm: document.querySelector("#askForm"),
  modal: document.querySelector("#modal"),
  modalCover: document.querySelector("#modalCover"),
  modalTitle: document.querySelector("#modalTitle"),
  modalCategory: document.querySelector("#modalCategory"),
  modalHeadline: document.querySelector("#modalHeadline"),
  modalTags: document.querySelector("#modalTags"),
  modalIntro: document.querySelector("#modalIntro"),
  modalLink: document.querySelector("#modalLink"),
  modalClose: document.querySelector("#modalClose"),
  scrollTop: document.querySelector("#scrollTop"),
  themeButton: document.querySelector("#themeButton"),
};

const categories = ["全部", ...unique(sites.map((site) => site.category))];

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getSubcategories() {
  const scoped = state.activeCategory === "全部"
    ? sites
    : sites.filter((site) => site.category === state.activeCategory);
  return ["全部", ...unique(scoped.map((site) => site.subcategory))];
}

function searchableText(site) {
  return [
    site.name,
    site.headline,
    site.category,
    site.subcategory,
    site.language,
    site.repoType,
    ...(site.tags || []),
    ...(site.capabilities || []),
    ...(site.scenarios || []),
    ...(site.searchKeywords || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function applyFilters() {
  const query = state.query.trim().toLowerCase();
  const compactQuery = query.replace(/\s+/g, "");
  const tokens = query.split(/[\s,，/|]+/).filter(Boolean);
  return sites.filter((site) => {
    const categoryOk = state.activeCategory === "全部" || site.category === state.activeCategory;
    const subOk = state.activeSubcategory === "全部" || site.subcategory === state.activeSubcategory;
    const text = searchableText(site);
    const compactText = text.replace(/\s+/g, "");
    const queryOk = !query || text.includes(query) || compactText.includes(compactQuery) || tokens.every((token) => {
      const alternatives = token.endsWith("工具") ? [token, token.replace(/工具$/, "")] : [token];
      return alternatives.some((part) => part && (text.includes(part) || compactText.includes(part)));
    });
    return categoryOk && subOk && queryOk;
  });
}

function renderCategories() {
  els.categoryList.innerHTML = categories
    .map((category) => {
      const active = category === state.activeCategory ? " active" : "";
      return `
        <button class="cat-btn${active}" type="button" data-category="${escapeAttr(category)}">
          <span>${escapeHtml(category)}</span>
        </button>
      `;
    })
    .join("");
}

function renderSubcategories() {
  const subs = getSubcategories();
  els.subCategoryList.innerHTML = subs
    .map((sub) => {
      const active = sub === state.activeSubcategory ? " active" : "";
      return `<button class="sub-btn${active}" type="button" data-subcategory="${escapeAttr(sub)}">${escapeHtml(sub)}</button>`;
    })
    .join("");
}

function renderCards(items) {
  els.activeLabel.textContent = state.activeSubcategory === "全部"
    ? state.activeCategory
    : `${state.activeCategory} / ${state.activeSubcategory}`;

  if (!items.length) {
    els.cardGrid.innerHTML = `<p class="empty">没有匹配的工具，换个关键词试试。</p>`;
    return;
  }

  els.cardGrid.innerHTML = items
    .map((site) => {
      const tags = (site.tags || []).slice(0, 4).map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join("");
      const cover = site.cover || "";
      const linkOk = site.linkCheck?.ok === true;
      return `
        <article class="site-card" tabindex="0" role="button" data-id="${escapeAttr(site.id)}" aria-label="查看 ${escapeAttr(site.name)}">
          <div class="site-cover">
            <img src="${escapeAttr(cover)}" alt="" loading="lazy" referrerpolicy="no-referrer" />
          </div>
          <div class="site-body">
            <div class="site-title-row">
              <h3 class="site-title">${escapeHtml(site.name)}</h3>
              <span class="status-pill ${linkOk ? "link-ok" : "link-review"}">${linkOk ? "可访问" : "待复核"}</span>
            </div>
            <p class="site-headline">${escapeHtml(site.headline || "一件值得留在手边的小工具。")}</p>
            <div class="tag-list">${tags}</div>
            <div class="site-footer">
              <span>${escapeHtml(site.subcategory || site.category || "工具")}</span>
              <span>${linkOk ? "外链核验通过" : "外链可能失效"}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAll() {
  const items = applyFilters();
  renderCategories();
  renderSubcategories();
  renderCards(items);
}

function setQuery(value) {
  state.query = value;
  els.heroSearch.value = value;
  els.browseSearch.value = value;
  renderCards(applyFilters());
}

function openDetail(id) {
  const site = sites.find((item) => item.id === id);
  if (!site) return;

  els.modalCover.src = site.cover || "";
  els.modalCover.alt = site.name;
  els.modalTitle.textContent = site.name;
  els.modalCategory.textContent = `${site.category || ""} · ${site.subcategory || ""}`;
  els.modalHeadline.textContent = site.headline || "";
  els.modalTags.innerHTML = (site.tags || []).slice(0, 8).map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join("");
  els.modalIntro.textContent = compactIntro(site);
  els.modalLink.href = site.url || "#";
  els.modalLink.textContent = site.linkCheck?.ok === true ? "打开原网站 ↗" : "尝试打开原网站（待复核）↗";
  els.modalLink.classList.toggle("link-warning", site.linkCheck?.ok !== true);
  els.modal.classList.add("open");
  els.modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeDetail() {
  els.modal.classList.remove("open");
  els.modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function compactIntro(site) {
  const intro = site.intro || "";
  const normalized = intro
    .replace(/\*\*/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/^###\s*/gm, "")
    .replace(/^\*\s+/gm, "· ")
    .trim();

  if (normalized) return normalized.slice(0, 1200);

  const capabilities = (site.capabilities || []).slice(0, 5).map((item) => `· ${item}`).join("\n");
  return `${site.name}\n\n${site.headline || ""}\n\n${capabilities}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function bindEvents() {
  els.categoryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.activeCategory = button.dataset.category;
    state.activeSubcategory = "全部";
    renderAll();
  });

  els.subCategoryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-subcategory]");
    if (!button) return;
    state.activeSubcategory = button.dataset.subcategory;
    renderAll();
  });

  els.browseSearch.addEventListener("input", (event) => {
    setQuery(event.target.value);
  });

  els.heroSearch.addEventListener("input", (event) => {
    state.query = event.target.value;
  });

  els.askForm.addEventListener("submit", (event) => {
    event.preventDefault();
    setQuery(els.heroSearch.value);
    document.querySelector("#browse").scrollIntoView({ behavior: "smooth" });
  });

  document.querySelectorAll(".prompt-chip").forEach((button) => {
    button.addEventListener("click", () => {
      setQuery(button.textContent.trim());
      document.querySelector("#browse").scrollIntoView({ behavior: "smooth" });
    });
  });

  els.cardGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-id]");
    if (card) openDetail(card.dataset.id);
  });

  els.cardGrid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-id]");
    if (!card) return;
    event.preventDefault();
    openDetail(card.dataset.id);
  });

  document.querySelector(".modal-scrim").addEventListener("click", closeDetail);
  els.modalClose.addEventListener("click", closeDetail);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDetail();
  });

  window.addEventListener("scroll", () => {
    els.scrollTop.classList.toggle("visible", window.scrollY > 680);
  });

  els.scrollTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  els.themeButton.addEventListener("click", () => {
    document.body.classList.toggle("paper-theme");
  });
}

bindEvents();
renderAll();
