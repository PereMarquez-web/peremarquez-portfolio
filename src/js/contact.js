export function initContactCopy() {
  const buttons = document.querySelectorAll(".copy-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const valueEl = btn.previousElementSibling;
      const text = valueEl?.dataset.copy;

      if (!text) return;

      navigator.clipboard.writeText(text).then(() => {
        btn.classList.add("copied");

        setTimeout(() => {
          btn.classList.remove("copied");
        }, 1200);
      });
    });
  });
}
