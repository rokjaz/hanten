/* Hanten site header and footer: the same on every page.
   Header: logo (home) on the left; Explore, Use Hanten, Contact and,
   on every page except the homepage, a Home button on the right.
   Footer: motto, Contact, Back to top, copyright. Include with
   <script src="/assets/js/site-chrome.js" defer></script>. */
(() => {
  if (!/^https?:$/.test(location.protocol) || document.querySelector(".hx-bar")) return;
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "/assets/css/site-chrome.css";
  document.head.appendChild(css);

  const path = location.pathname.replace(/index\.html$/, "");
  const isHome = path === "/" || path === "";
  const here = p => path.startsWith(p) ? ' aria-current="page"' : "";
  const logo = "/Media/branding/hanten-logo-white.svg";
  const links =
  `<a class="hx-bar-explore" href="/browse.html"${here("/browse")}>Explore</a>` +
  `<a href="/use/classroom/"${here("/use/classroom/")}>Use<span class="hx-long"> Hanten</span></a>` +
  `<a class="hx-bar-contact" href="/contact/"${here("/contact/")}>Contact</a>`;

// Old per-page brand blocks give way to the shared header.
  document.querySelectorAll("header.hanten-shell, .brand-logo, .see-brand, .experience-brand, body > header > .brand, body > header > .brandtag, body > header > .nav, body > header > .wordmark, body > header > .home-link")
    .forEach(el => {
      if (el.matches("header.hanten-shell")) el.remove();
      else el.remove();
    });
  document.querySelectorAll("body > header, .site > header").forEach(h => {
    if (!h.textContent.trim() && !h.querySelector("img, svg")) h.remove();
  });

  const bar = document.createElement("header");
  bar.className = "hx-bar";
  bar.innerHTML = `<div class="hx-inner">` +
    `<a class="hx-bar-logo" href="/" aria-label="Hanten home"><img src="${logo}" alt="Hanten — Truth deserves clarity" width="486" height="128"></a>` +
    `<nav class="hx-bar-nav" aria-label="Main">${links}${isHome ? "" : '<a class="hx-bar-home" href="/">Home</a>'}</nav></div>`;
  document.body.insertBefore(bar, document.body.firstChild);

  // One footer for every page.
  document.querySelectorAll(".site > footer, body > footer, footer.hanten-shell-footer, footer.see-footer").forEach(f => f.remove());
  const foot = document.createElement("footer");
  foot.className = "hx-foot";
  foot.innerHTML = `<div class="hx-inner">` +
    `<p class="hx-foot-line">Understanding is discovered, not delivered.</p>` +
    `<nav class="hx-foot-nav" aria-label="Footer"><a href="/contact/">Contact</a><a href="#top" class="hx-top">Back to top ↑</a></nav>` +
    `<p class="hx-foot-copy">© ${new Date().getFullYear()} Hanten · hanten.app</p></div>`;
  foot.querySelector(".hx-top").addEventListener("click", e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); });
  document.body.appendChild(foot);

  // "Start here" path: an exhibit opened from /start/ (?start=2) shows
  // where you are and links to the next one.
  const step = parseInt(new URLSearchParams(location.search).get("start"), 10);
  if (step >= 1) {
    fetch("/JS/start-path.json").then(r => r.json()).then(path => {
      if (step > path.length) return;
      const next = path[step];
      const strip = document.createElement("div");
      strip.className = "hx-path";
      strip.innerHTML =
        `<a class="hx-path-back" href="/start/">Start here</a><span class="hx-path-step">${step} of ${path.length}</span>` +
        (next
          ? `<a class="hx-path-next" href="/exhibits/${next.id}/?start=${step + 1}">Next: ${next.title} →</a>`
          : `<a class="hx-path-next" href="/browse.html">You finished the path. Explore all exhibits →</a>`);
      bar.insertAdjacentElement("afterend", strip);
    }).catch(() => {});
  }
  document.documentElement.classList.add("hx-has-chrome");
})();
