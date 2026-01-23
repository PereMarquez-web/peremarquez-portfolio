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
   2) AUTO JUMP SCROLL (one <-> two)
   - intercept wheel only inside #home
---------------------------- */
function initHeroAutoScroll() {
  const home = document.querySelector("#home");
  const one = document.querySelector("#home .hero-screen--one");
  const two = document.querySelector("#home .hero-screen--two");

  if (!home || !one || !two) return;

  let isAnimating = false;
  let wheelAccum = 0;
  let wheelResetTimer = null;

  const isMenuOpen = () => document.body.classList.contains("menu-open");

  function getTop(el) {
    const r = el.getBoundingClientRect();
    return window.scrollY + r.top;
  }

  function goTo(targetEl) {
    if (isAnimating) return;
    isAnimating = true;

    const targetTop = getTop(targetEl);

    // scroll suave controlado (sin ScrollToPlugin)
    window.scrollTo({ top: targetTop, behavior: "smooth" });

    // libera el lock tras un rato (ajusta si quieres más rápido/lento)
    window.setTimeout(() => {
      isAnimating = false;
      wheelAccum = 0;
    }, 520);
  }

  function inHomeRange() {
    const homeTop = getTop(home);
    const homeBottom = homeTop + home.offsetHeight;
    const y = window.scrollY + 2; // pequeño margen
    return y >= homeTop && y < homeBottom;
  }

  function whichScreenIsVisible() {
    // Decidimos según qué pantalla está más cerca del top del viewport
    const oneTopDist = Math.abs(one.getBoundingClientRect().top);
    const twoTopDist = Math.abs(two.getBoundingClientRect().top);
    return oneTopDist <= twoTopDist ? "one" : "two";
  }

  function onWheel(e) {
    if (isMenuOpen()) return;          // si menú abierto, no interceptamos
    if (!inHomeRange()) return;        // solo dentro de #home
    if (isAnimating) { e.preventDefault(); return; }

    // Evita el scroll “a medias”
    e.preventDefault();

    // acumulamos para trackpad (muchos deltas pequeños)
    wheelAccum += e.deltaY;

    clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(() => (wheelAccum = 0), 120);

    const threshold = 60; // sensibilidad (baja a 40 si quieres más rápido)
    if (Math.abs(wheelAccum) < threshold) return;

    const dirDown = wheelAccum > 0;
    wheelAccum = 0;

    const visible = whichScreenIsVisible();

    if (dirDown) {
      // one -> two, o two -> salir al siguiente section (projects)
      if (visible === "one") {
        goTo(two);
      } else {
        // si estás en two y sigues bajando, dejas que el scroll siga normal:
        // hacemos "unlock" y permitimos que siga, pero ya sin preventDefault
        isAnimating = true;
        setTimeout(() => (isAnimating = false), 180);
        window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
      }
    } else {
      // subiendo: two -> one, o one -> dejar que suba al header/top
      if (visible === "two") {
        goTo(one);
      } else {
        isAnimating = true;
        setTimeout(() => (isAnimating = false), 180);
        window.scrollBy({ top: -window.innerHeight * 0.9, behavior: "smooth" });
      }
    }
  }

  // importantísimo: passive:false para poder preventDefault
  window.addEventListener("wheel", onWheel, { passive: false });
}

/* ---------------------------
   INIT
---------------------------- */
window.addEventListener("load", () => {
  initHeroDraggableChips();
  initHeroAutoScroll();
});
