const API_ORIGIN = "https://philosophersapi.com";
const API_URL = API_ORIGIN + "/api/philosophers";

const ERAS = [
  { id: "antiquity", label: "Antiquity", span: "before 500", until: 500 },
  { id: "medieval", label: "Medieval", span: "500 – 1450", until: 1450 },
  { id: "early-modern", label: "Early Modern", span: "1450 – 1750", until: 1750 },
  { id: "modern", label: "Modern", span: "1750 – 1900", until: 1900 },
  { id: "contemporary", label: "Contemporary", span: "1900 onward", until: Infinity },
];

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const plain = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const splitList = (text, separator) => (text || "").split(separator).map(s => s.trim()).filter(Boolean);

function parseYear(text) {
  const m = /(\d+)\s*(BC|AD)/i.exec(text || "");
  if (!m) return null;
  return m[2].toUpperCase() === "BC" ? -Number(m[1]) : Number(m[1]);
}

const yearLabel = n => (n < 0 ? `${-n} BC` : n < 1000 ? `${n} AD` : `${n}`);

function lifeSpan(born, died) {
  if (born === null) return "";
  if (died === null) return `b. ${yearLabel(born)}`;
  if (born < 0 && died < 0) return `${-born} – ${-died} BC`;
  if (born > 0 && died > 0 && died < 1000) return `${born} – ${died} AD`;
  return `${yearLabel(born)} – ${yearLabel(died)}`;
}

function dateLabel(date, year) {
  if (!date) return year === null ? "" : yearLabel(year);
  return year < 0 && !/BC/i.test(date) ? `${date} BC` : date;
}

function prepare(raw) {
  const b = parseYear(raw.birthYear);
  const d = parseYear(raw.deathYear);
  const schools = splitList(raw.school, /,|\//);
  const interests = splitList(raw.interests, ",");
  return {
    ...raw,
    b, d, schools, interests,
    span: lifeSpan(b, d),
    era: b === null ? null : ERAS.find(e => b < e.until).id,
    find: plain([raw.name, ...schools, ...interests].join(" ")),
  };
}

const readCache = () => { try { return JSON.parse(sessionStorage.getItem("calyx-data")); } catch { return null; } };
const writeCache = raw => { try { sessionStorage.setItem("calyx-data", JSON.stringify(raw)); } catch { return false; } return true; };

async function loadPhilosophers() {
  let raw = readCache();
  if (!raw) {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`The archive replied with status ${res.status}.`);
    raw = await res.json();
    if (!Array.isArray(raw)) throw new Error("The archive sent an unexpected response.");
    writeCache(raw);
  }
  return raw
    .map(prepare)
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }))
    .map((p, i) => ({ ...p, no: i + 1 }));
}

function countBy(list, pick) {
  const rows = new Map();
  list.forEach(p => pick(p).forEach(label => {
    const row = rows.get(label.toLowerCase()) || { label, n: 0 };
    row.n++;
    rows.set(label.toLowerCase(), row);
  }));
  return [...rows.values()];
}

const noImg = alt => `<span class="no-img" role="img" aria-label="${esc(alt)}">${esc(alt.replace("Portrait of ", "").charAt(0))}</span>`;
document.addEventListener("error", e => {
  const el = e.target;
  if (el.tagName !== "IMG") return;
  if (el.dataset.backup) {
    const url = el.dataset.backup;
    delete el.dataset.backup;
    el.removeAttribute("srcset");
    el.src = url;
    return;
  }
  el.insertAdjacentHTML("afterend", noImg(el.alt));
  el.remove();
}, true);

const sizesOf = group => Object.entries(group || {})
  .map(([key, path]) => ({ m: /(\d+)x(\d+)/.exec(key), url: API_ORIGIN + path }))
  .filter(i => i.m)
  .map(i => ({ w: +i.m[1], h: +i.m[2], url: i.url }))
  .sort((a, b) => a.w - b.w);

function img(group, sizes, alt, eager, backup) {
  const main = sizesOf(group);
  const spare = sizesOf(backup);
  const items = main.length ? main : spare;
  if (!items.length) return noImg(alt);
  const small = items[0];
  const srcset = items.map(i => `${i.url} ${i.w}w`).join(", ");
  const retry = main.length && spare.length ? ` data-backup="${spare[spare.length - 1].url}"` : "";
  return `<img src="${small.url}" srcset="${srcset}" sizes="${sizes}" width="${small.w}" height="${small.h}" alt="${esc(alt)}" loading="${eager ? "eager" : "lazy"}" decoding="async"${retry}>`;
}

const plate = (p, carry = "") => `
  <li class="plate"><a href="philosopher.html?id=${encodeURIComponent(p.id)}${esc(carry)}">
    <span class="plate-img">${img(p.images?.faceImages, "20rem", `Portrait of ${p.name}`, false, p.images?.fullImages)}</span>
    <span class="plate-body">
      <span class="plate-name">${esc(p.name)}</span>
      <span class="plate-years">${esc(p.span)}</span>
      <span class="plate-desc">${esc(p.topicalDescription || p.school)}</span>
    </span>
  </a></li>`;

const loading = text => `<div class="state" role="status"><span class="spinner-border spinner-border-sm" aria-hidden="true"></span> <span class="ms-2">${text}</span></div>`;

const skeleton = n => `
  <p class="visually-hidden" role="status">Loading the archive…</p>
  <ul class="catalogue placeholder-glow" aria-hidden="true">${`
    <li class="plate"><span class="plate-box">
      <span class="plate-img placeholder d-block"></span>
      <span class="placeholder d-block col-5 mt-3"></span>
      <span class="placeholder d-block col-4 mt-2"></span>
      <span class="placeholder d-block col-11 mt-2"></span>
    </span></li>`.repeat(n)}
  </ul>`;

function showError(target, err, retry) {
  target.innerHTML = `
    <div class="alert alert-calyx" role="alert">
      <h2 class="h4">The archive could not be opened</h2>
      <p>${esc(err.message)} Please check your connection and try again.</p>
      <button class="btn btn-calyx" type="button">Try again</button>
    </div>`;
  target.querySelector("button").onclick = retry;
}