const day = Math.floor(Date.now() / 864e5);

async function init() {
  $("highlights-body").innerHTML = loading("Opening the archive…");
  $("schools").hidden = $("eras").hidden = true;
  $("archive-count").hidden = true;
  $("featured").innerHTML = "";

  let list;
  try {
    list = await loadPhilosophers();
    if (!list.length) throw new Error("The archive is empty right now.");
  } catch (err) {
    $("featured").innerHTML = `<p class="text-lg-end fst-italic mb-0" role="status">The archive could not be opened. Use the button below to try again.</p>`;
    return showError($("highlights-body"), err, init);
  }

  $("schools").hidden = $("eras").hidden = false;
  $("archive-count").textContent = `${list.length} philosophers in the archive`;
  $("archive-count").hidden = false;
  showFeatured(list[day % list.length]);
  linkSocrates(list);
  showHighlights(list);
  showSchools(list);
  showEras(list);
}

function showFeatured(p) {
  const first = sizesOf(p.images?.fullImages)[0] || sizesOf(p.images?.faceImages)[0];
  const ratio = first ? (first.w / first.h).toFixed(3) : "0.667";
  $("featured").innerHTML = `
    <figure class="relic" style="--ratio:${ratio}">
      <a href="philosopher.html?id=${encodeURIComponent(p.id)}">${img(p.images?.fullImages, "min(27rem, 90vw)", `Portrait of ${p.name}`, true, p.images?.faceImages)}</a>
      <figcaption>
        <span>Thinker of the day</span>
        <a href="philosopher.html?id=${encodeURIComponent(p.id)}"><strong>${esc(p.name)}</strong></a>
        <span>${esc(p.span)}</span>
      </figcaption>
    </figure>`;
}

function linkSocrates(list) {
  const socrates = list.find(p => plain(p.name) === "socrates");
  if (socrates) $("socrates").href = `philosopher.html?id=${encodeURIComponent(socrates.id)}`;
}

function showHighlights(list) {
  const withNotes = list.filter(p => p.topicalDescription);
  const picks = Array.from({ length: Math.min(6, withNotes.length) }, (_, i) => withNotes[(day + i) % withNotes.length]);
  $("highlights-body").innerHTML = picks.length
    ? `<div class="notes">${picks.map(p => `
        <article class="note">
          <p class="eyebrow">${esc(p.school)}</p>
          <h3><a href="philosopher.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3>
          <p>${esc(p.topicalDescription)}</p>
        </article>`).join("")}</div>`
    : `<p>No highlights are available yet.</p>`;
}

function showSchools(list) {
  const rows = countBy(list, p => p.schools);
  const byName = [...rows].sort((a, b) => a.label.localeCompare(b.label));
  $("hero-school").insertAdjacentHTML("beforeend", byName.map(r => `<option value="${esc(r.label)}">${esc(r.label)}</option>`).join(""));

  const top = rows.sort((a, b) => b.n - a.n || a.label.localeCompare(b.label)).slice(0, 12);
  $("schools-body").innerHTML = `<ol class="index">${top.map(r => `
    <li><a href="library.html?school=${encodeURIComponent(r.label)}">${esc(r.label)} <span class="n">${r.n}</span></a></li>`).join("")}</ol>`;
}

function showEras(list) {
  $("eras-body").innerHTML = `<ul class="eras">${ERAS.map(e => `
    <li class="era"><a href="library.html?era=${e.id}">
      <span class="era-count">${list.filter(p => p.era === e.id).length}</span>
      <span class="era-name">${e.label}</span>
      <span class="era-span">${e.span}</span>
    </a></li>`).join("")}</ul>`;
}

$("hero-school").onchange = e => { if (e.target.value) $("hero-form").requestSubmit(); };

init();
