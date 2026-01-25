import { gsap } from "gsap";
import Draggable from "gsap/Draggable";

gsap.registerPlugin(Draggable);

/* ---------------------------
   1) DRAGGABLE CHIPS (screen 1)
---------------------------- */
function initHeroDraggableChips() {
  const screenOne = document.querySelector("#home .hero-screen--one");
  const chips = gsap.utils.toArray("#home .hero-screen--one .chip");

  if (!screenOne || chips.length === 0) return;

  // mejor para touch/trackpad
  chips.forEach((chip) => (chip.style.touchAction = "none"));

  Draggable.create(chips, {
    type: "x,y",
    bounds: screenOne,
    zIndexBoost: true,
    onPress() {
      gsap.to(this.target, { scale: 1.03, duration: 0.12, overwrite: true });
    },
    onRelease() {
      gsap.to(this.target, { scale: 1, duration: 0.12, overwrite: true });
    },
  });
}

/* ---------------------------
   2) HERO STEP SCROLL (one <-> two)
   - 1 wheel gesture = 1 snap
   - does NOT "push" scroll into projects (fixes skip)
---------------------------- */
function initHeroAutoScroll() {
  const home = document.querySelector("#home");
  const one = document.querySelector("#home .hero-screen--one");
  const two = document.querySelector("#home .hero-screen--two");

  if (!home || !one || !two) return;

  // tuning
  const THRESHOLD = 60;      // trackpad delta accumulation
  const COOLDOWN_MS = 700;   // lock to avoid double step
  const ANIM_MS = 520;       // duration match to your smooth scroll timing

  let isAnimating = false;
  let locked = false;
  let wheelAccum = 0;
  let resetTimer = null;

  const isMenuOpen = () => document.body.classList.contains("menu-open");

  function lock() {
    locked = true;
    window.setTimeout(() => (locked = false), COOLDOWN_MS);
  }

  function getTop(el) {
    const r = el.getBoundingClientRect();
    return window.scrollY + r.top;
  }

  function inHomeRange() {
    // “Estoy dentro del hero” cuando el hero ocupa el viewport
    const rect = home.getBoundingClientRect();
    return rect.top <= 0 && rect.bottom >= window.innerHeight;
  }

  function whichScreenIsVisible() {
    const d1 = Math.abs(one.getBoundingClientRect().top);
    const d2 = Math.abs(two.getBoundingClientRect().top);
    return d1 <= d2 ? "one" : "two";
  }

  function goTo(targetEl) {
    if (isAnimating) return;

    isAnimating = true;
    lock();          // clave para que un gesto no dispare 2 veces
    wheelAccum = 0;

    const y = getTop(targetEl);

    window.scrollTo({ top: y, behavior: "smooth" });

    window.setTimeout(() => {
      // hard snap (evita quedarse “a medias”)
      window.scrollTo(0, Math.round(y));
      isAnimating = false;
    }, ANIM_MS);
  }

  function onWheel(e) {
    if (isMenuOpen()) return;
    if (!inHomeRange()) return;

    // Si está locked/animating, cancelamos dentro del hero
    if (locked || isAnimating) {
      e.preventDefault();
      return;
    }

    // acumulamos delta (trackpad)
    wheelAccum += e.deltaY;
    clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => (wheelAccum = 0), 120);

    if (Math.abs(wheelAccum) < THRESHOLD) return;

    const dirDown = wheelAccum > 0;
    wheelAccum = 0;

    const visible = whichScreenIsVisible();

    // ---- REGLA CLAVE:
    // Solo hacemos preventDefault cuando vamos a SNAP (one <-> two).
    // Si estamos en screen two y bajamos, dejamos scroll normal (para entrar a projects),
    // pero ponemos lock para que no se coma el primer snap de projects.
    if (dirDown) {
      if (visible === "one") {
        e.preventDefault();
        goTo(two);
      } else {
        // visible === "two" y bajamos -> dejar scroll normal
        // (pero bloquea un gesto para evitar doble salto en projects)
        lock();
        // NO preventDefault, NO scrollBy, NO smooth extra
      }
    } else {
      if (visible === "two") {
        e.preventDefault();
        goTo(one);
      } else {
        // visible === "one" y subimos -> dejar scroll normal
        lock();
      }
    }
  }

  window.addEventListener("wheel", onWheel, { passive: false });
}

/* ---------------------------
   INIT
---------------------------- */
window.addEventListener("load", () => {
  initHeroDraggableChips();
  initHeroAutoScroll();
});
