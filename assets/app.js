"use strict";
/* 中港新聞速報 HK-China News Express */

const CATS = {
  hk:           {en:"HK News",      zh_hant:"港聞",   zh_hans:"港闻"},
  china:        {en:"China",        zh_hant:"中國",   zh_hans:"中国"},
  world:        {en:"World",        zh_hant:"國際",   zh_hans:"国际"},
  finance:      {en:"Finance",      zh_hant:"財經",   zh_hans:"财经"},
  tech:         {en:"Tech",         zh_hant:"科技",   zh_hans:"科技"},
  society:      {en:"Society",      zh_hant:"社會",   zh_hans:"社会"},
  entertainment:{en:"Entertainment",zh_hant:"娛樂",   zh_hans:"娱乐"},
  others:       {en:"Others",       zh_hant:"其他",   zh_hans:"其他"}
};

const STR = {
  en:{siteName:"HK-China News Express",search:"Search news, tags…",all:"All",latest:"Latest",
      readMore:"Read full story →",copied:"Link copied!",noResult:"No news found. Try another keyword.",
      loadMore:"Load earlier news",updated:"Updated",articles:"articles",loading:"Loading…",
      footer:"Summaries are rewritten by our editors. Photos belong to their original sources."},
  zh_hant:{siteName:"中港新聞速報",search:"搜尋新聞、標籤…",all:"全部",latest:"最新",
      readMore:"閱讀原文 →",copied:"連結已複製！",noResult:"搵唔到相關新聞，試下其他關鍵字。",
      loadMore:"載入更早新聞",updated:"更新於",articles:"則新聞",loading:"載入中…",
      footer:"摘要由本站重新編寫，圖片版權歸原新聞機構所有。"},
  zh_hans:{siteName:"中港体育速报",search:"搜索新闻、标签、球队…",all:"全部",latest:"最新",
      readMore:"阅读原文 →",copied:"链接已复制！",noResult:"找不到相关新闻，试试其他关键字。",
      loadMore:"加载更早新闻",updated:"更新于",articles:"则新闻",loading:"加载中…",
      footer:"摘要由本站重新编写，图片版权归原新闻机构所有。"}
};

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

let LANG = localStorage.getItem("hks_lang") || "zh_hant";
if (!STR[LANG]) LANG = "zh_hant";
let ALL = [];            // loaded articles
let DATES = [];          // [{date,count}] desc
let UPDATED_AT = "";
let loadedDates = new Set();
const filter = {cat:"all", date:"all", q:""};
const PAGE_DAYS = 7;

/* ---------- theme ---------- */
function setLogo(){
  const dark = document.documentElement.dataset.theme === "dark";
  const bn = document.getElementById("brandName");
  if (bn && bn.style.display === "flex") return; // text fallback active
  const l = document.getElementById("logoLight"), d = document.getElementById("logoDark");
  if (l && d) { l.style.display = dark ? "none" : ""; d.style.display = dark ? "" : "none"; }
}
function initTheme(){
  let t = localStorage.getItem("hks_theme");
  if (!t) t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.dataset.theme = t;
  $("#themeBtn").textContent = t === "dark" ? "☀️" : "🌙";
  setLogo();
}
$("#themeBtn").addEventListener("click", () => {
  const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  localStorage.setItem("hks_theme", t);
  $("#themeBtn").textContent = t === "dark" ? "☀️" : "🌙";
  setLogo();
});

/* ---------- i18n ---------- */
function t(k){ return (STR[LANG] && STR[LANG][k]) || STR.zh_hant[k] || k; }
function applyI18n(){
  document.documentElement.lang = LANG === "en" ? "en" : (LANG === "zh_hans" ? "zh-CN" : "zh-Hant");
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll(".lang-switch button").forEach(b => b.classList.toggle("active", b.dataset.lang === LANG));
  document.title = t("siteName") + " | HK-China News Express";
}
document.querySelectorAll(".lang-switch button").forEach(b => b.addEventListener("click", () => {
  LANG = b.dataset.lang; localStorage.setItem("hks_lang", LANG);
  applyI18n(); renderChips(); render();
}));

/* ---------- data ---------- */
async function loadManifest(){
  const r = await fetch("data/manifest.json");
  const m = await r.json();
  DATES = m.dates || []; UPDATED_AT = m.updated_at || "";
}
async function loadBatch(n){
  const next = DATES.map(d => d.date).filter(d => !loadedDates.has(d)).slice(0, n);
  if (!next.length) return false;
  const results = await Promise.all(next.map(d => fetch("data/" + d + ".json").then(r => r.ok ? r.json() : []).catch(() => [])));
  results.forEach((arr, i) => { loadedDates.add(next[i]); ALL.push(...arr); });
  ALL.sort((a, b) => (b.published_at || "").localeCompare(a.published_at || ""));
  return true;
}

/* ---------- format ---------- */
function fmtTime(iso){
  try {
    const d = new Date(iso);
    const o = {timeZone:"Asia/Hong_Kong", month:"numeric", day:"numeric", hour:"2-digit", minute:"2-digit", hour12:false};
    return new Intl.DateTimeFormat(LANG === "en" ? "en-HK" : (LANG === "zh_hans" ? "zh-CN" : "zh-HK"), o).format(d);
  } catch(e){ return (iso || "").slice(0, 16).replace("T", " "); }
}
function fmtDate(ds){
  const [y, m, d] = ds.split("-");
  return LANG === "en" ? `${d}/${m}` : `${m}月${d}日`;
}
function articleUrl(a){
  const base = location.href.split("#")[0].replace(/index\.html$/, "").replace(/\/?$/, "/");
  return base + "a/" + a.id + ".html";
}

/* ---------- render ---------- */
function renderChips(){
  const sc = $("#catChips");
  sc.innerHTML = `<button class="chip${filter.cat==="all"?" active":""}" data-cat="all">${esc(t("all"))}</button>` +
    Object.keys(CATS).map(k => `<button class="chip${filter.cat===k?" active":""}" data-cat="${k}">${esc(CATS[k][LANG]||CATS[k].en)}</button>`).join("");
  sc.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => { filter.cat = c.dataset.cat; renderChips(); render(); }));

  const dc = $("#dateChips");
  const counts = {}; DATES.forEach(d => counts[d.date] = d.count);
  dc.innerHTML = `<button class="chip${filter.date==="all"?" active":""}" data-date="all">${esc(t("latest"))}</button>` +
    DATES.map(d => `<button class="chip${filter.date===d.date?" active":""}" data-date="${d.date}">${esc(fmtDate(d.date))} <span class="n">${d.count}</span></button>`).join("");
  dc.querySelectorAll(".chip").forEach(c => c.addEventListener("click", async () => {
    filter.date = c.dataset.date;
    if (filter.date !== "all" && !loadedDates.has(filter.date)) { await loadBatch(PAGE_DAYS); }
    renderChips(); render();
  }));
}

function filtered(){
  const q = filter.q.trim().toLowerCase();
  return ALL.filter(a => {
    if (filter.cat !== "all" && a.category !== filter.cat) return false;
    if (filter.date !== "all" && !(a.published_at || "").startsWith(filter.date)) return false;
    if (q) {
      const hay = [a.title.en, a.title.zh_hant, a.title.zh_hans, a.summary.en, a.summary.zh_hant, a.summary.zh_hans,
                   a.source, ...(a.tags.en||[]), ...(a.tags.zh_hant||[]), ...(a.tags.zh_hans||[])].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function cardHTML(a){
  const url = articleUrl(a);
  const img = a.image_url
    ? `<img src="${esc(a.image_url)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML='<div class=&quot;noimg&quot;>🏅</div>'">`
    : `<div class="noimg">🏅</div>`;
  const tags = (a.tags[LANG] || a.tags.zh_hant || []).map(g => `<button class="tag" data-tag="${esc(g)}">#${esc(g)}</button>`).join("");
  return `<article class="card" id="a-${esc(a.id)}">
    <a class="thumb" href="a/${esc(a.id)}.html">${img}</a>
    <div class="card-body">
      <div class="card-top"><span class="cat-tag">${esc((CATS[a.category]||CATS.others)[LANG])}</span><span>${esc(fmtTime(a.published_at))}</span></div>
      <h2 class="card-title"><a href="a/${esc(a.id)}.html">${esc(a.title[LANG] || a.title.zh_hant)}</a></h2>
      <p class="card-summary">${esc(a.summary[LANG] || a.summary.zh_hant)}</p>
      <div class="tags">${tags}</div>
      <div class="card-foot">
        <span class="src">${esc(a.source)}</span>
        <span class="actions">
          <a class="abtn primary" href="${esc(a.source_url)}" target="_blank" rel="noopener">${esc(t("readMore"))}</a>
          <button class="abtn" data-share="fb" data-id="${esc(a.id)}">f</button>
          <button class="abtn" data-share="native" data-id="${esc(a.id)}">⤴</button>
          <button class="abtn" data-share="copy" data-id="${esc(a.id)}">🔗</button>
        </span>
      </div>
    </div>
  </article>`;
}

function render(){
  const list = filtered();
  $("#cards").innerHTML = list.map(cardHTML).join("");
  $("#empty").hidden = list.length > 0;
  $("#meta").textContent = `${list.length} ${t("articles")}` + (UPDATED_AT ? ` · ${t("updated")} ${fmtTime(UPDATED_AT)}` : "");
  const more = DATES.some(d => !loadedDates.has(d.date));
  $("#loadMore").hidden = !more;
  $("#loadMore").textContent = t("loadMore");
  document.querySelectorAll("[data-share]").forEach(b => b.addEventListener("click", ev => { ev.stopPropagation(); doShare(b.dataset.share, b.dataset.id); }));
  document.querySelectorAll(".tag").forEach(b => b.addEventListener("click", () => {
    filter.q = b.dataset.tag; $("#search").value = filter.q; render();
    window.scrollTo({top:0, behavior:"smooth"});
  }));
}

let toastTimer;
function toast(msg){
  const el = $("#toast"); el.textContent = msg; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

function doShare(kind, id){
  const a = ALL.find(x => x.id === id); if (!a) return;
  const url = articleUrl(a);
  const title = a.title[LANG] || a.title.zh_hant;
  if (kind === "fb") {
    window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url), "_blank", "width=600,height=540");
  } else if (kind === "native" && navigator.share) {
    navigator.share({title, text:(a.summary[LANG]||a.summary.zh_hant), url}).catch(()=>{});
  } else {
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(
      () => toast(t("copied")),
      () => { prompt(url, url); });
  }
}

$("#search").addEventListener("input", e => { filter.q = e.target.value; render(); });
$("#loadMore").addEventListener("click", async () => { $("#loadMore").disabled = true; await loadBatch(PAGE_DAYS); $("#loadMore").disabled = false; renderChips(); render(); });

/* ---------- init ---------- */
(async function(){
  initTheme(); applyI18n();
  $("#meta").textContent = t("loading");
  try {
    await loadManifest();
    await loadBatch(PAGE_DAYS);
  } catch(e){ /* offline / empty */ }
  renderChips(); render();
  if (location.hash.startsWith("#a-")) {
    const el = document.getElementById(location.hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({block:"center"}), 400);
  }
})();
