import { renderSection } from "./loader.js";

const root = document.documentElement;
const content = document.getElementById("content");
const menuEl = document.getElementById("menu");

async function getMenu() {
  const res = await fetch("/data/menu.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Não foi possível carregar o menu");
  return await res.json();
}

function createMenuItem(item) {
  if (item.submenu?.length) {
    const li = document.createElement("li");
    li.className = "has-sub";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "submenu-toggle";
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = `${item.label} <span class="caret" aria-hidden="true"></span>`;

    const ul = document.createElement("ul");
    ul.className = "submenu";
    ul.setAttribute("role", "menu");

    item.submenu.forEach(sub => ul.appendChild(createMenuItem(sub)));

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      li.classList.toggle("open");
      const open = li.classList.contains("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    li.append(btn, ul);
    return li;
  }

  const li = document.createElement("li");
  li.setAttribute("role", "none");
  const a = document.createElement("a");
  a.setAttribute("role", "menuitem");
  a.href = item.hash;
  a.textContent = item.label;
  a.dataset.partial = item.partial;
  li.appendChild(a);
  return li;
}

function setupTheme() {
  const themeBtn = document.getElementById("theme-toggle");
  if (!themeBtn) return;
  const setLabel = () => {
    themeBtn.textContent = root.getAttribute("data-theme") === "dark" ? "Alternar para Light" : "Alternar para Dark";
  };
  setLabel();
  themeBtn.addEventListener("click", () => {
    const dark = root.getAttribute("data-theme") === "dark";
    if (dark) root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", "dark");
    setLabel();
  });
}

function setupHamburger() {
  const nav = document.querySelector("nav");
  const btn = document.querySelector(".hamburger");
  const backdrop = document.querySelector(".backdrop");

  function openMenu() {
    nav.setAttribute("data-open", "");
    btn?.setAttribute("aria-expanded", "true");
    backdrop?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    nav.removeAttribute("data-open");
    btn?.setAttribute("aria-expanded", "false");
    backdrop?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.querySelectorAll('.menu .has-sub.open').forEach(li => {
      li.classList.remove('open');
      const t = li.querySelector('.submenu-toggle');
      t && t.setAttribute('aria-expanded', 'false');
    });
  }
  btn && btn.addEventListener("click", () => nav.hasAttribute("data-open") ? closeMenu() : openMenu());
  backdrop && backdrop.addEventListener("click", closeMenu);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  menuEl?.addEventListener("click", (e) => {
    if (e.target.closest('.submenu-toggle')) return;
    if (e.target.closest('a')) closeMenu();
  });
}

let MENU = null;

function findPartialByHash(hash) {
  const flat = (items) => items.flatMap(i => i.submenu ? flat(i.submenu) : [i]);
  const list = flat(MENU.items);
  const item = list.find(i => i.hash === hash);
  return item?.partial || null;
}

async function route() {
  if (!MENU) return;
  const hash = location.hash || MENU.defaultHash;
  const partial = findPartialByHash(hash);
  if (partial) await renderSection(content, partial);
}

(async function init() {
  setupTheme();
  setupHamburger();

  const res = await fetch("/data/menu.json", { cache: "no-store" });
  MENU = await res.json();

  MENU.items.forEach(item => menuEl.appendChild(createMenuItem(item)));
  window.addEventListener("hashchange", route);
  await route();
})();