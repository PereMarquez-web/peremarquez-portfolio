function isLandingPage(){
  return !!document.querySelector("#home");
}

function normalizeHref(href){
  // On project page, send to landing + hash
  if (href.startsWith("#") && !isLandingPage()) return `/${href}`;
  return href;
}

export function mountFooter(){
  const html = `
    <footer class="site-footer" role="contentinfo">
      <div class="footer-inner">
        <div class="footer-grid">
          <div class="footer-left">
            <p class="footer-text footer-name">Pere Márquez</p>
            <p class="footer-text footer-role">Creative Front-End Developer</p>
          </div>

          <nav class="footer-nav" aria-label="Footer navigation">
            <a href="${normalizeHref("#home")}">Home</a>
            <a href="${normalizeHref("#projects")}">Projects</a>
            <a href="${normalizeHref("#experience")}">Experience</a>
            <a href="${normalizeHref("#about")}">About</a>
            <a href="${normalizeHref("#contact")}">Contact</a>
          </nav>

          <div class="footer-right" aria-label="Footer context">
            <p>Based in UK / Spain</p>
            <p>Open to creative teams &amp; roles</p>
          </div>
        </div>

        <div class="footer-divider" aria-hidden="true"></div>

        <div class="footer-bottom">© 2026 · Built with HTML, CSS &amp; GSAP</div>
      </div>
    </footer>
  `;

  document.body.insertAdjacentHTML("beforeend", html);
}
