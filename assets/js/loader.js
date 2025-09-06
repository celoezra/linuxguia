export async function loadPartial(url) {
const res = await fetch(url, { cache: "no-store" });
if (!res.ok) throw new Error(`Falha ao carregar ${url}`);
return await res.text();
}


export async function renderSection(container, url) {
try {
container.innerHTML = "<p>Carregando…</p>";
const html = await loadPartial(url);
container.innerHTML = html;
container.focus({ preventScroll: true });
container.scrollIntoView({ behavior: "smooth", block: "start" });
} catch (err) {
container.innerHTML = `<div class="error">${err.message}</div>`;
}
}