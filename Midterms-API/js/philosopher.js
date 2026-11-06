const urlParams = new URLSearchParams(location.search);
const id = urlParams.get("id");
const backParams = new URLSearchParams();
["q", "school", "era", "interest", "page"].forEach(key => { if (urlParams.get(key)) backParams.set(key, urlParams.get(key)); });
const backQuery = backParams.toString();
const carry = backQuery ? "&" + backQuery : "";
const backHref = "library.html" + (backQuery ? "?" + backQuery : "");

const KNOWN = new Set([
  "id", "name", "birthDate", "deathDate", "birthYear", "deathYear", "school", "interests", "topicalDescription",
  "images", "speLink", "iepLink", "hasEBooks", "libriVoxIDs", "username",
  "b", "d", "schools", "span", "era", "find", "no",
]);

async function init() {
  $("profile").innerHTML = loading("Fetching this philosopher…");
  $("kin").innerHTML = "";
  let all;
  try {
    all = await loadPhilosophers();
  } catch (err) {
    return showError($("profile"), err, init);
  }
  const p = all.find(x => x.id === id);
  if (!p) {
    document.title = "Not found — CALYX";
    $("profile").innerHTML = `<div class="state"><h1 class="h2">Thinker not found</h1><p>That entry is not in the archive.</p><a class="btn btn-calyx" href="${esc(backHref)}">Back to the library</a></div>`;
    return;
  }
  document.title = `${p.name} — CALYX`;
  const kin = kinOf(p, all);
  showProfile(p, all, kin);
  showKin(kin);
  fieldContext = { p, all };
}

let fieldContext = null;

const shared = (a, b) => a.filter(x => b.some(y => y.toLowerCase() === x.toLowerCase())).length;
const labelOf = key => key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").toLowerCase().replace(/^./, c => c.toUpperCase());
const lifeEnd = q => q.d ?? new Date().getFullYear();

function readable(value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return /^https?:\/\//i.test(value.trim()) ? "" : value.trim();
  if (Array.isArray(value)) return value.map(readable).filter(Boolean).join(", ");
  return "";
}

function extraDetails(p) {
  return Object.keys(p)
    .filter(key => !KNOWN.has(key))
    .map(key => [labelOf(key), readable(p[key])])
    .filter(([, value]) => value);
}

function kinOf(p, all) {
  return all
    .filter(q => q !== p)
    .map(q => ({ q, score: shared(q.schools, p.schools) * 3 + shared(q.interests, p.interests) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score || a.q.no - b.q.no)
    .slice(0, 4)
    .map(r => r.q);
}

function contemporariesOf(p, all) {
  if (p.b === null) return [];
  return all
    .filter(q => q !== p && q.b !== null)
    .map(q => ({ q, overlap: Math.min(lifeEnd(p), lifeEnd(q)) - Math.max(p.b, q.b) }))
    .filter(r => r.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || a.q.no - b.q.no)
    .slice(0, 4)
    .map(r => r.q);
}

function lifespanText(p) {
  if (p.b === null || p.d === null) return "";
  const years = p.d - p.b - (p.b < 0 && p.d > 0 ? 1 : 0);
  return years > 0 ? `About ${years} years` : "";
}

function showProfile(p, all, kin) {
  const prev = all[(p.no - 2 + all.length) % all.length];
  const next = all[p.no % all.length];
  const era = ERAS.find(e => e.id === p.era);
  const facts = [
    ["Born", dateLabel(p.birthDate, p.b)],
    ["Died", dateLabel(p.deathDate, p.d)],
    ["Lifespan", lifespanText(p)],
    ["Era", era ? `${era.label} (${era.span})` : ""],
    ["School of thought", p.schools.join(", ")],
    ["E-books", p.hasEBooks ? "Available" : "None listed"],
    ["Audiobook editions", p.libriVoxIDs?.length || ""],
    ["Handle", p.username],
  ].filter(([, value]) => value);

  const extras = extraDetails(p);
  const shortExtras = extras.filter(([, value]) => value.length <= 60);
  const longExtras = extras.filter(([, value]) => value.length > 60);
  const contemporaries = contemporariesOf(p, all);
  const hasAside = p.interests.length > 0 || contemporaries.length > 0;

  const sections = [
    ["overview", "Overview", true],
    ["fields", "Fields of inquiry", p.interests.length > 0],
    ["contemporaries", "Same era", contemporaries.length > 0],
    ["details", "More details", extras.length > 0],
    ["related", "Related philosophers", kin.length > 0],
  ].filter(s => s[2]);

  const fields = p.interests.length ? `
        <div id="fields">
          <h2>Fields of inquiry</h2>
          <p class="verse-hint">Select a field to read more about it.</p>
          <ul class="verse-list">${p.interests.map(i => `<li><button type="button" class="field-link" data-field="${esc(i)}" data-bs-toggle="modal" data-bs-target="#field-modal">${esc(i)}</button></li>`).join("")}</ul>
        </div>` : "";
  const sameEra = contemporaries.length ? `
        <section class="verse-links" id="contemporaries" aria-labelledby="era-title">
          <h2 id="era-title">Lived in the same era</h2>
          <ul class="links">${contemporaries.map(q => `<li><a href="philosopher.html?id=${encodeURIComponent(q.id)}${esc(carry)}">${esc(q.name)}</a> <span class="verse-years">${esc(q.span)}</span></li>`).join("")}</ul>
        </section>` : "";
  const aside = hasAside ? `
      <div class="col-12 col-lg-4">
        <aside class="verse" aria-label="Fields of inquiry and contemporaries">
          <img class="verse-mark" src="assets/laurel.svg" alt="" width="36" height="36">${fields}${sameEra}
        </aside>
      </div>` : "";

  const details = extras.length ? `
            <section class="overview mt-5" id="details" aria-labelledby="details-title">
              <h2 id="details-title">More details</h2>
              ${shortExtras.length ? `<dl class="facts">${shortExtras.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
              ${longExtras.length ? `<div class="detail-notes">${longExtras.map(([k, v]) => `<div><h3>${esc(k)}</h3><p>${esc(v)}</p></div>`).join("")}</div>` : ""}
            </section>` : "";

  $("profile").innerHTML = `
    <a class="back" href="${esc(backHref)}">← Back to Library</a>
    <article class="row g-5">
      <div class="col-12 ${hasAside ? "col-lg-8" : ""}">
        <div class="row g-4 g-xl-5 align-items-start">
          <div class="col-12 col-sm-5">
            <figure class="portrait">${img(p.images?.fullImages, "min(24rem, 90vw)", `Portrait of ${p.name}`, true)}</figure>
          </div>
          <div class="col-12 col-sm-7">
            <h1 class="profile-name">${esc(p.name)}</h1>
            <p class="profile-years">${esc(p.span)}</p>
            ${p.schools.length ? `<ul class="tags">${p.schools.map(s => `<li><a class="tag" href="library.html?school=${encodeURIComponent(s)}">${esc(s)}</a></li>`).join("")}</ul>` : ""}
            ${p.topicalDescription ? `<p class="passage">${esc(p.topicalDescription)}</p>` : ""}
          </div>
        </div>
        <div class="row g-4 mt-3">
          <div class="col-12 col-md-4 col-xl-3">
            <nav aria-label="On this page">
              <ul class="side-nav d-flex flex-wrap flex-md-column">${sections.map(([anchor, label], i) => `<li><a href="#${anchor}"${i === 0 ? ' aria-current="true"' : ""}>${label}</a></li>`).join("")}</ul>
            </nav>
          </div>
          <div class="col-12 col-md-8 col-xl-9">
            <section class="overview" id="overview" aria-labelledby="overview-title">
              <h2 id="overview-title">Overview</h2>
              <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
            </section>${details}
          </div>
        </div>
      </div>${aside}
    </article>
    <nav class="pager" aria-label="Neighbouring entries">
      <a href="philosopher.html?id=${encodeURIComponent(prev.id)}${esc(carry)}">← ${esc(prev.name)}</a>
      <a href="philosopher.html?id=${encodeURIComponent(next.id)}${esc(carry)}">${esc(next.name)} →</a>
    </nav>`;

  document.querySelectorAll(".side-nav a").forEach(a => {
    a.addEventListener("click", () => {
      document.querySelectorAll(".side-nav a").forEach(x => x.removeAttribute("aria-current"));
      a.setAttribute("aria-current", "true");
    });
  });
}

function showKin(kin) {
  if (!kin.length) return;
  $("kin").innerHTML = `
    <section class="band on-dark" id="related" aria-labelledby="kin-title">
      <div class="container-xxl">
        <h2 id="kin-title" class="mb-4">Related philosophers</h2>
        <ul class="catalogue catalogue-tight">${kin.map(p => plate(p, carry)).join("")}</ul>
      </div>
    </section>`;
}

function renderField(name) {
  const { p, all } = fieldContext;
  const same = (list, value) => list.some(x => x.toLowerCase() === value.toLowerCase());
  const note = FIELD_NOTES[fieldKey(name)];
  const others = all
    .filter(q => q !== p && same(q.interests, name))
    .sort((a, b) => shared(b.schools, p.schools) - shared(a.schools, p.schools) || a.no - b.no);
  const alsoExplores = p.interests.filter(i => i.toLowerCase() !== name.toLowerCase());
  const shown = others.slice(0, 12);

  $("field-title").textContent = name;
  $("field-body").innerHTML = `
    ${note ? `<p class="field-about">${esc(note.about)}</p>
    <h3>Questions it asks</h3>
    <ul class="field-questions">${note.questions.map(q => `<li>${esc(q)}</li>`).join("")}</ul>` : `<p class="field-about">${others.length + 1} thinkers in the archive are listed under ${esc(name)}.</p>`}
    <h3>${esc(p.name)} and ${esc(name)}</h3>
    <p class="mb-2">${esc(p.topicalDescription || `${p.name} (${p.span}) is listed among the thinkers who explore ${name}.`)}</p>
    ${alsoExplores.length ? `<p class="field-also mb-0">Also explores: ${alsoExplores.map(i => `<button type="button" class="tag" data-field="${esc(i)}">${esc(i)}</button>`).join(" ")}</p>` : ""}
    <h3>Others who explore ${esc(name)}</h3>
    ${shown.length
      ? `<ul class="field-people">${shown.map(q => `<li><a href="philosopher.html?id=${encodeURIComponent(q.id)}${esc(carry)}">${esc(q.name)}</a> <span>${esc(q.span)}</span></li>`).join("")}</ul>${others.length > shown.length ? `<p class="mb-0 fst-italic">and ${others.length - shown.length} more in the library.</p>` : ""}`
      : `<p class="mb-0">${esc(p.name)} is the only thinker in the archive listed under ${esc(name)}.</p>`}`;
  $("field-library").href = `library.html?interest=${encodeURIComponent(name)}`;
  $("field-library").textContent = `See all ${others.length + 1} in the library`;
}

$("field-modal").addEventListener("show.bs.modal", e => {
  if (fieldContext && e.relatedTarget) renderField(e.relatedTarget.dataset.field);
});
$("field-body").addEventListener("click", e => {
  const button = e.target.closest("[data-field]");
  if (!button) return;
  renderField(button.dataset.field);
  $("field-title").focus();
});

init();