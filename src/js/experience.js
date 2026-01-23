export function initExperienceTabs() {
  const root = document.querySelector("#experience");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll(".exp-tab"));
  const panels = Array.from(root.querySelectorAll(".exp-panel"));

  if (tabs.length === 0 || panels.length === 0) return;

  function activate(name) {
    tabs.forEach((t) => {
      const active = t.dataset.tab === name;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
      t.tabIndex = active ? 0 : -1;
    });

    panels.forEach((p) => {
      const active = p.dataset.panel === name;
      p.classList.toggle("is-active", active);
      if (active) p.removeAttribute("hidden");
      else p.setAttribute("hidden", "");
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activate(tab.dataset.tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

      e.preventDefault();
      const i = tabs.indexOf(tab);
      const next = e.key === "ArrowRight" ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      activate(tabs[next].dataset.tab);
    });
  });
}
