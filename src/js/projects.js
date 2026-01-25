import { PROJECTS } from "../sections/projects/projects-data.js";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(ScrollTrigger, Observer);

/* ---------------------------
   helpers
---------------------------- */
function escapeHTML(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTags(tags = []) {
  return tags.map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join("");
}

function renderActions(actions = [], isPrimary) {
  return actions
    .map((a, idx) => {
      const isVisit = a.label.toLowerCase().includes("visit");
      const classes = ["pbtn"];
      if (isPrimary && isVisit && idx === 0) classes.push("pbtn--primary");

      const isExternal = a.href?.startsWith("http");
      const rel = isExternal ? ` rel="noreferrer" target="_blank"` : "";

      return `
        <a class="${classes.join(" ")}" href="${a.href}"${rel}>
          ${escapeHTML(a.label)} <span class="pbtn__icon">${escapeHTML(a.icon)}</span>
        </a>
      `;
    })
    .join("");
}

function projectLeftHTML(p) {
  const isPrimary = p.tier === "primary";
  const leftClass = isPrimary ? "project-left project-left--primary" : "project-left";
  const dotStyle = isPrimary ? "" : ` style="background:#ff7a1a"`;

  return `
    <article class="${leftClass}">
      <div class="project-topmeta">
        <span class="project-dot"${dotStyle}></span>
        <span>${escapeHTML(p.topMeta)}</span>
      </div>

      <div class="project-title">${escapeHTML(p.title)}</div>
      <div class="project-subtitle">${escapeHTML(p.subtitle)}</div>

      <div class="project-sep"></div>

      <div class="project-role-label">Role</div>
      <div class="project-role">${escapeHTML(p.role)}</div>

      <div class="project-desc">${escapeHTML(p.desc)}</div>

      <div class="project-actions">
        ${renderActions(p.actions, isPrimary)}
      </div>
    </article>
  `;
}

function projectRightHTML(p) {
  const isTertiary = p.tier === "tertiary";

  if (!isTertiary) {
    return `
      <div class="project-right">
        <div class="project-right__top">
          <div class="project-tags">
            ${renderTags(p.tags)}
          </div>
          <div class="status">${escapeHTML(p.status)}</div>
        </div>

        <div class="project-kicker">${escapeHTML(p.rightKicker)}</div>

        <div class="project-mock">
          <img src="${p.mockupSrc}" alt="${escapeHTML(p.mockupAlt)}" loading="lazy" />
        </div>
      </div>
    `;
  }

  // Tertiary (no flip obligatorio; mantenemos tu layout especial)
  return `
    <div class="project-right project-right--tertiary">
      <div class="tertiary-panel">
        <div class="tertiary-title-row">
          <div class="tertiary-title">${escapeHTML(p.focusTitle)}</div>
          <div class="status">${escapeHTML(p.status)}</div>
        </div>

        <div class="project-tags">
          ${renderTags(p.focusTags)}
        </div>

        <div class="tertiary-sep"></div>

        <div class="tertiary-title">${escapeHTML(p.nextTitle)}</div>
        <div class="tertiary-next">${escapeHTML(p.nextLine)}</div>
      </div>
    </div>
  `;
}

function projectCardHTML(p) {
  const isTertiary = p.tier === "tertiary";

  // Nota (solo tertiary)
  const note =
    isTertiary && p.footerNote
      ? `<div class="projects__note">${escapeHTML(p.footerNote)}</div>`
      : "";

  // ✅ Para primary/secondary: metemos flip wrapper con dos caras
  if (!isTertiary) {
    return `
      <div class="project-shell">
        <div class="project">
          <div class="project-flip" data-project-flip>
            <div class="project-face project-face--front">
              ${projectLeftHTML(p)}
            </div>
            <div class="project-face project-face--back">
              ${projectRightHTML(p)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Tertiary: normal (sin flip)
  return `
    <div class="project-shell project-shell--tertiary">
      <div class="project project--tertiary">
        ${projectLeftHTML(p)}
        ${projectRightHTML(p)}
      </div>
    </div>
    ${note}
  `;
}

/* ---------------------------
   state (cleanup-safe)
---------------------------- */
let projectsST = null;
let projectsObs = null;
let onResize = null;

/* ---------------------------
   Mobile flip: tap anywhere on inner card
---------------------------- */
function initMobileFlip() {
  const stack = document.querySelector("[data-projects-stack]");
  if (!stack) return;

  const mq = window.matchMedia("(max-width: 980px)");

  function isMobile() {
    return mq.matches;
  }

  function onClick(e) {
    if (!isMobile()) return;

    // Si es un link o botón, NO flip (deja hacer click normal)
    if (e.target.closest("a,button")) return;

    const flip = e.target.closest("[data-project-flip]");
    if (!flip) return;

    flip.classList.toggle("is-flipped");
  }

  stack.addEventListener("click", onClick);
}

/* ---------------------------
   Projects step scroll (horizontal)
---------------------------- */
function initProjectsStepScroll() {
  const section = document.querySelector("#projects");
  const track = document.querySelector("[data-projects-stack]");
  const panels = gsap.utils.toArray("#projects .project-panel");

  if (!section || !track || panels.length < 2) return;

  // cleanup previous
  if (projectsObs) { projectsObs.kill(); projectsObs = null; }
  if (projectsST) { projectsST.kill(true); projectsST = null; }
  if (onResize) { window.removeEventListener("resize", onResize); onResize = null; }

  const total = panels.length;

  // CONFIG
  const THRESHOLD = 60;
  const RESET_MS = 140;
  const COOLDOWN_MS = 900;
  const ANIM_DUR = 0.55;

  let index = 0;
  let isAnimating = false;
  let locked = false;

  let acc = 0;
  let resetT = null;

  function snapX() {
    return Math.round(-index * window.innerWidth);
  }

  function setXImmediate() {
    gsap.set(track, { x: snapX() });
  }

  function lockOnce() {
    locked = true;
    window.setTimeout(() => (locked = false), COOLDOWN_MS);
  }

  function goTo(nextIndex) {
    const clamped = Math.max(0, Math.min(total - 1, nextIndex));
    if (clamped === index || isAnimating) return;

    index = clamped;
    isAnimating = true;
    lockOnce();

    document.querySelectorAll("#projects .project-shell.is-flipped").forEach((el) => el.classList.remove("is-flipped"));

    gsap.to(track, {
      x: snapX(),
      duration: ANIM_DUR,
      ease: "power3.inOut",
      overwrite: true,
      onComplete: () => {
        setXImmediate();
        isAnimating = false;
      },
    });
  }

  function escapeDown() {
    if (!projectsST) return;
    projectsObs && projectsObs.disable();
    lockOnce();
    const y = Math.ceil(projectsST.end + 2);
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  function escapeUp() {
    if (!projectsST) return;
    projectsObs && projectsObs.disable();
    lockOnce();
    const y = Math.floor(projectsST.start - 2);
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  projectsST = ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => `+=${window.innerHeight * (total - 1)}`,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onEnter: () => projectsObs && projectsObs.enable(),
    onEnterBack: () => projectsObs && projectsObs.enable(),
    onLeave: () => projectsObs && projectsObs.disable(),
    onLeaveBack: () => projectsObs && projectsObs.disable(),
  });

  projectsObs = Observer.create({
    type: "wheel,touch",
    target: window,
    preventDefault: true,
    allowClicks: true,
    tolerance: 8,
    wheelSpeed: 1,

    onWheel: (self) => {
      if (!projectsST || !projectsObs.isEnabled) return;
      if (isAnimating || locked) return;

      acc += self.deltaY;

      clearTimeout(resetT);
      resetT = window.setTimeout(() => (acc = 0), RESET_MS);

      if (Math.abs(acc) < THRESHOLD) return;

      const dirDown = acc > 0;
      acc = 0;

      if (dirDown) {
        if (index >= total - 1) return escapeDown();
        return goTo(index + 1);
      } else {
        if (index <= 0) return escapeUp();
        return goTo(index - 1);
      }
    },

    onDown: () => {
      if (isAnimating || locked) return;
      if (index >= total - 1) return escapeDown();
      goTo(index + 1);
    },

    onUp: () => {
      if (isAnimating || locked) return;
      if (index <= 0) return escapeUp();
      goTo(index - 1);
    },
  });

  projectsObs.disable();

  onResize = () => {
    setXImmediate();
    ScrollTrigger.refresh();
  };
  window.addEventListener("resize", onResize);

  setXImmediate();
  ScrollTrigger.refresh();
}

/* ---------------------------
   public mount
---------------------------- */
export function mountProjects() {
  const stack = document.querySelector("[data-projects-stack]");
  if (!stack) return;

  const total = PROJECTS.length;

  stack.innerHTML = PROJECTS.map((p, i) => {
    const isFirst = i === 0;
    const isLast = i === total - 1;

    return `
      <div class="project-panel ${isFirst ? "project-panel--first" : ""} ${isLast ? "project-panel--last" : ""}">
        <div class="container-projects">
          ${projectCardHTML(p)}
        </div>
      </div>
    `;
  }).join("");

  initProjectsStepScroll();
  initMobileFlip();
}

