function initContactCopy(){
  const buttons = document.querySelectorAll(".copy-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const wrapper = btn.closest(".contact__value-wrap");
      if (!wrapper) return;

      const link = wrapper.querySelector("[data-copy]");
      if (!link) return;

      const value = link.getAttribute("data-copy");

      try {
        await navigator.clipboard.writeText(value);

        btn.classList.add("is-copied");

        // reset visual after 2s
        setTimeout(() => {
          btn.classList.remove("is-copied");
        }, 2000);

      } catch (err) {
        console.error("Copy failed", err);
      }
    });
  });
}

window.addEventListener("load", initContactCopy);
