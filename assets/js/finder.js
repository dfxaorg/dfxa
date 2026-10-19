// Service finder: client-side filtering of the server-rendered service list.
//
// Progressive enhancement: the page shows the complete list without
// JavaScript; the filter form is only displayed when the <html> element has
// the class "js" (set in the head). This script loads the JSON index
// (/services.json or /en/services.json) and only hides or shows existing
// elements. Filter state is kept in the query string (?q=…&audience=…&domain=…)
// so that filtered views can be shared. Parameter values are the
// language-independent term keys.

const form = document.querySelector(".finder__form");

// Lowercase and strip diacritics so that "kryptowahrung" matches "Kryptowährung".
const normalize = (s) =>
  (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function readState() {
  const p = new URLSearchParams(location.search);
  return { q: p.get("q") || "", audience: p.getAll("audience"), domain: p.getAll("domain") };
}

function writeState(state) {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  state.audience.forEach((v) => p.append("audience", v));
  state.domain.forEach((v) => p.append("domain", v));
  const qs = p.toString();
  history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
}

function formState() {
  const checked = (name) =>
    [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((i) => i.value);
  return { q: form.q.value.trim(), audience: checked("audience"), domain: checked("domain") };
}

function applyStateToForm(state) {
  form.q.value = state.q;
  form.querySelectorAll('input[type="checkbox"]').forEach((i) => {
    i.checked = (state[i.name] || []).includes(i.value);
  });
}

function matches(service, state, terms) {
  if (state.domain.length && !state.domain.includes(service.domain)) return false;
  if (state.audience.length && !state.audience.some((a) => service.audiences.includes(a))) return false;
  return terms.every((t) => service.text.includes(t));
}

function render(services, state) {
  const terms = normalize(state.q).split(/\s+/).filter(Boolean);
  let count = 0;
  document.querySelectorAll("[data-service]").forEach((card) => {
    const s = services.get(card.dataset.service);
    const show = !s || matches(s, state, terms);
    card.hidden = !show;
    if (show) count++;
  });
  document.querySelectorAll(".service-group").forEach((group) => {
    group.hidden = !group.querySelector("[data-service]:not([hidden])");
  });
  const status = form.querySelector(".finder__count");
  status.textContent = count === 1 ? form.dataset.countOne : form.dataset.countOther.replace("{n}", count);
  document.querySelector(".finder__none").hidden = count > 0;
}

async function init() {
  if (!form) return;
  // Without the index the filters cannot work: remove the form, keep the list.
  const giveUp = () => form.remove();
  if (!window.fetch || !window.URLSearchParams) return giveUp();
  let data;
  try {
    const res = await fetch(form.dataset.index, { credentials: "same-origin" });
    if (!res.ok) return giveUp();
    data = await res.json();
  } catch {
    return giveUp();
  }
  const experts = new Map(data.experts.map((e) => [e.id, e]));
  const services = new Map(
    data.services.map((s) => [
      s.id,
      {
        domain: s.domain,
        audiences: s.audiences || [],
        // Search over title, description, keywords and the experts' names.
        text: normalize(
          [s.title, s.description, ...(s.keywords || []), ...s.experts.map((id) => (experts.get(id) || {}).name)].join(" ")
        ),
      },
    ])
  );

  const state = readState();
  applyStateToForm(state);
  render(services, state);

  const update = () => {
    const s = formState();
    writeState(s);
    render(services, s);
  };
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    update();
  });
  form.addEventListener("reset", () => setTimeout(update, 0));
}

init();
