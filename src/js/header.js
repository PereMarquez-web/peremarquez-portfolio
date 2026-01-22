const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

function isLandingPage() {
  // Landing: sections exist
  return !!document.querySelector("#home");
}

function headerHeightPx() {
  const header = document.querySelector(".site-header");
  if (!header) return 0;
  return header.getBoundingClientRect().height;
}

function scrollToId(id) {
  const target = document.querySelector(id);
  if (!target) return;

  const topGap = 26; // your header top spacing
  const y = target.getBoundingClientRect().top + window.scrollY - (headerHeightPx() + topGap + 14);
  window.scrollTo({ top: y, behavior: "smooth" });
}

function setActiveLink(hash) {
  const headerLinks = document.querySelectorAll('.site-header a[data-nav="1"], .mobile-drawer a[data-nav="1"]');
  headerLinks.forEach(a => {
    const isActive = a.getAttribute("href") === hash;
    a.classList.toggle("is-active", isActive);
  });
}

function setupActiveObserver() {
  const ids = NAV_ITEMS.map(i => i.href).filter(h => h.startsWith("#"));
  const sections = ids.map(id => document.querySelector(id)).filter(Boolean);
  if (!sections.length) return;

  const topGap = 26;
  const headerOffset = headerHeightPx() + topGap + 18;

  const observer = new IntersectionObserver((entries) => {
    // Pick the most visible section
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    setActiveLink(`#${visible.target.id}`);
  }, {
    root: null,
    threshold: [0.2, 0.35, 0.5, 0.65],
    rootMargin: `-${headerOffset}px 0px -55% 0px`,
  });

  sections.forEach(sec => observer.observe(sec));
}

function setupMobileMenu() {
  const header = document.querySelector(".site-header");
  const drawer = document.querySelector(".mobile-drawer");
  const btn = document.querySelector(".mobile-toggle");
  if (!header || !drawer || !btn) return;

  const close = () => header.classList.remove("is-open");
  const toggle = () => header.classList.toggle("is-open");

  btn.addEventListener("click", toggle);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  document.addEventListener("click", (e) => {
    const insideHeader = e.target.closest(".site-header");
    const insideDrawer = e.target.closest(".mobile-drawer");
    if (!insideHeader && !insideDrawer) close();
  });

  drawer.addEventListener("click", (e) => {
    const a = e.target.closest('a[data-nav="1"]');
    if (!a) return;
    close();

    if (isLandingPage()) {
      e.preventDefault();
      scrollToId(a.getAttribute("href"));
    }
  });
}

export function mountHeader({ brandHref = "#home" } = {}) {
  const container = document.querySelector('[data-slot="header"]') || document.body;

  const left = NAV_ITEMS.slice(0, 3);
  const right = NAV_ITEMS.slice(3);

  const navLinks = (items) =>
    items.map(i => `<a data-nav="1" href="${i.href}">${i.label}</a>`).join("");

  const headerHTML = `
    <header class="site-header" role="banner">
      <div class="site-header__inner" aria-label="Primary navigation">
        <nav class="site-nav site-nav--left">${navLinks(left)}</nav>

        <a class="site-header__brand" href="${brandHref}" aria-label="Go to home">
            <span class="brand-first">Pere</span>
            <span class="brand-last">Márquez</span>
        </a>

        <nav class="site-nav site-nav--right">${navLinks(right)}</nav>
      </div>

      <div class="site-header__mobile">
        <a class="mobile-brand" href="${brandHref}" aria-label="Go to home">
            <span class="brand-first">Pere</span>
            <span class="brand-last">Márquez</span>
        </a>

        <button class="mobile-toggle" type="button" aria-label="Open menu">
          <span class="icon" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
        </button>
      </div>
    </header>

    <div class="mobile-drawer" aria-label="Mobile menu">
      ${NAV_ITEMS.map(i => `<a data-nav="1" href="${i.href}">${i.label}</a>`).join("")}
    </div>
  `;

  if (container === document.body) {
    document.body.insertAdjacentHTML("afterbegin", headerHTML);
  } else {
    container.insertAdjacentHTML("beforeend", headerHTML);
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest('.site-header a[data-nav="1"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href.startsWith("#")) return;

    if (!isLandingPage()) return;

    e.preventDefault();
    scrollToId(href);

    document.querySelector(".site-header")?.classList.remove("is-open");
  });

  if (isLandingPage()) setupActiveObserver();

  setupMobileMenu();
}
