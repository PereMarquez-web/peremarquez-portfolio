// Basic anchor scroll with optional header offset
const header = document.querySelector(".site-header");
const headerHeight = () => header ? header.getBoundingClientRect().height : 0;

document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;

  const id = a.getAttribute("href");
  const target = document.querySelector(id);
  if (!target) return;

  e.preventDefault();

  const y = target.getBoundingClientRect().top + window.scrollY - headerHeight();
  window.scrollTo({ top: y, behavior: "smooth" });
});
