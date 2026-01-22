import { gsap } from "gsap";
import Draggable from "gsap/Draggable";

gsap.registerPlugin(Draggable);

function initHeroDraggableChips(){
  const hero = document.querySelector(".section-hero");
  const chips = gsap.utils.toArray(".section-hero .chip");

  if (!hero || chips.length === 0) return;

  // Make sure chips are on top when dragging
  Draggable.create(chips, {
    type: "x,y",
    bounds: hero,
    zIndexBoost: true,
    onPress() {
      gsap.to(this.target, { scale: 1.03, duration: 0.12, overwrite: true });
    },
    onRelease() {
      gsap.to(this.target, { scale: 1, duration: 0.12, overwrite: true });
    },
  });
}

window.addEventListener("load", initHeroDraggableChips);
