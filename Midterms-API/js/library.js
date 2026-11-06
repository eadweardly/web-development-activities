const PAGE_SIZE = 12;
const params = new URLSearchParams(location.search);
const state = {
  q: params.get("q") || "",
  school: params.get("school") || "",
  era: params.get("era") || "",
  interest: params.get("interest") || "",
  sort: "name",
  view: window.innerWidth < 576 ? "index" : "plates",
  page: Math.max(1, parseInt(params.get("page"), 10) || 1),
};
let all = [];

const sorters = {
  name: (a, b) => a.no - b.no,
  born: (a, b) => (a.b ?? 1e9) - (b.b ?? 1e9),
  "born-desc": (a, b) => (b.b ?? -1e9) - (a.b ?? -1e9),
};

async function init() {
  $("results").innerHTML = skeleton(6);
  $("pages").innerHTML = "";
  try {
    all = await loadPhilosophers();
  } catch (err) {
    $("count").textContent = "";
    return showError($("results"), err, init);
  }
  fillSelects();
  $("q").value = state.q;
  $("era").value = state.era;
  update();
}

function fillSelects() {
  const schools = countBy(all, p => p.schools).sort((a, b) => a.label.localeCompare(b.label));
  $("school").insertAdjacentHTML("beforeend", schools.map(r => `<option value="${esc(r.label)}">${esc(r.label)} (${r.n})</option>`).join(""));
  $("era").insertAdjacentHTML("beforeend", ERAS.map(e => `<option value="${e.id}">${e.label} (${e.span})</option>`).join(""));

  const match = schools.find(r => r.label.toLowerCase() === state.school.toLowerCase());
  state.school = match ? match.label : "";
  $("school").value = state.school;
  if (!ERAS.some(e => e.id === state.era)) state.era = "";
}

function filtered() {
  const words = plain(state.q).split(/\s+/).filter(Boolean);
  const same = (list, value) => list.some(x => x.toLowerCase() === value.toLowerCase());
  return all
    .filter(p =>
      words.every(w => p.find.includes(w)) &&
      (!state.school || same(p.schools, state.school)) &&
      (!state.era || p.era === state.era) &&
      (!state.interest || same(p.interests, state.interest)))
    .sort(sorters[state.sort]);
}

function queryFor(page) {
  const next = new URLSearchParams();
  ["q", "school", "era", "interest"].forEach(key => { if (state[key]) next.set(key, state[key]); });
  if (page > 1) next.set("page", page);
  return next.toString();
}

function update() {
  drawChips();
  drawResults();
  syncUrl();
}

function drawChips() {
  const rows = countBy(all, p => p.interests).sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
  const top = rows.slice(0, 8);
  const active = rows.find(r => r.label.toLowerCase() === state.interest.toLowerCase());
  state.interest = active ? active.label : "";
  if (active && !top.includes(active)) top.push(active);
  $("chips").innerHTML = [{ label: "All", value: "" }, ...top.map(r => ({ label: r.label, value: r.label }))]
    .map(c => `<button class="tag" type="button" data-interest="${esc(c.value)}" aria-pressed="${c.value === state.interest}">${esc(c.label)}</button>`)
    .join("");
}

function drawResults() {
  const list = filtered();
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * PAGE_SIZE;
  const shown = list.slice(start, start + PAGE_SIZE);
  const isFiltered = state.q || state.school || state.era || state.interest;

  $("count").innerHTML = (shown.length
    ? `Showing ${start + 1}–${start + shown.length} of ${list.length} philosophers${isFiltered ? `, filtered from ${all.length}` : ""}`
    : "Showing 0 philosophers") +
    (isFiltered ? ` <button class="btn btn-link clear p-0" type="button" id="clear">Clear filters</button>` : "");
  if (isFiltered) $("clear").onclick = reset;
  document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", b.dataset.view === state.view));

  if (!all.length) {
    $("results").innerHTML = `<div class="state"><h2>The archive is empty</h2><p>The API returned no philosophers.</p></div>`;
  } else if (!list.length) {
    $("results").innerHTML = `<div class="state"><h2>No thinker matches</h2><p>Try a different name, or loosen the filters.</p><button class="btn btn-calyx" type="button" id="reset">Clear filters</button></div>`;
    $("reset").onclick = reset;
  } else {
    const query = queryFor(state.page);
    const carry = query ? "&" + query : "";
    $("results").innerHTML = `<ul class="catalogue${state.view === "index" ? " is-list" : ""}">${shown.map(p => plate(p, carry)).join("")}</ul>`;
  }
  drawPages(pages);
}

function pageNumbers(current, total) {
  const wanted = new Set([1, total, current - 1, current, current + 1]);
  const nums = [...wanted].filter(n => n >= 1 && n <= total).sort((a, b) => a - b);
  const items = [];
  nums.forEach((n, i) => {
    const gap = i ? n - nums[i - 1] : 1;
    if (gap === 2) items.push(n - 1);
    if (gap > 2) items.push(null);
    items.push(n);
  });
  return items;
}

function drawPages(total) {
  if (total < 2) {
    $("pages").innerHTML = "";
    return;
  }
  const current = state.page;
  const link = (label, page, aria) => `<li class="page-item"><a class="page-link" href="?${esc(queryFor(page))}" data-page="${page}" aria-label="${aria}">${label}</a></li>`;
  const off = label => `<li class="page-item disabled"><span class="page-link">${label}</span></li>`;
  const numbers = pageNumbers(current, total).map(n => n === null
    ? off("…")
    : n === current
      ? `<li class="page-item active"><a class="page-link" href="?${esc(queryFor(n))}" data-page="${n}" aria-current="page" aria-label="Page ${n}, current page">${n}</a></li>`
      : link(n, n, `Page ${n}`));
  $("pages").innerHTML = `<ul class="pagination justify-content-center mb-0">
    ${current > 1 ? link("Previous", current - 1, "Previous page") : off("Previous")}
    ${numbers.join("")}
    ${current < total ? link("Next", current + 1, "Next page") : off("Next")}
  </ul>`;
}

function reset() {
  Object.assign(state, { q: "", school: "", era: "", interest: "", page: 1 });
  $("q").value = "";
  $("school").value = "";
  $("era").value = "";
  update();
}

function syncUrl() {
  const query = queryFor(state.page);
  history.replaceState(null, "", query ? `?${query}` : location.pathname);
}

function focusSearch() {
  $("q").focus();
  $("q").scrollIntoView({ block: "center" });
}

$("filters").onsubmit = e => e.preventDefault();
$("q").oninput = e => { state.q = e.target.value; state.page = 1; update(); };
["school", "era", "sort"].forEach(id => { $(id).onchange = e => { state[id] = e.target.value; state.page = 1; update(); }; });
$("chips").onclick = e => {
  const button = e.target.closest("button");
  if (button) { state.interest = button.dataset.interest; state.page = 1; update(); }
};
$("pages").onclick = e => {
  const link = e.target.closest("a[data-page]");
  if (!link || e.ctrlKey || e.metaKey || e.shiftKey) return;
  e.preventDefault();
  state.page = Number(link.dataset.page);
  update();
  document.querySelector(".results-bar").scrollIntoView({ block: "start" });
};
document.querySelector(".view-toggle").onclick = e => {
  const button = e.target.closest("button");
  if (button) { state.view = button.dataset.view; drawResults(); }
};
document.querySelector('.site-header a[href$="#q"]').onclick = e => {
  e.preventDefault();
  focusSearch();
};

init();
if (location.hash === "#q") $("q").focus();