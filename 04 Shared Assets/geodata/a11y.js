// Self-contained accessibility toggle: larger text + reduced motion,
// persisted in localStorage so the choice sticks across pages/visits.
// Mirrors data/save-image.js in being a single drop-in script with no
// separate CSS file — it injects its own <style> tag.
const HantenA11y = (() => {
  const KEY = "hanten:a11y";

  function readPrefs() {
    try {
      return { largeText: false, reduceMotion: false, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
    } catch {
      return { largeText: false, reduceMotion: false };
    }
  }

  function writePrefs(prefs) {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  }

  function applyPrefs(prefs) {
    document.documentElement.classList.toggle("a11y-large-text", prefs.largeText);
    document.documentElement.classList.toggle("a11y-reduce-motion", prefs.reduceMotion);
  }

  function injectStyle() {
    if (document.getElementById("hanten-a11y-style")) return;
    const style = document.createElement("style");
    style.id = "hanten-a11y-style";
    style.textContent = `
      html.a11y-large-text { font-size: 118%; }
      html.a11y-reduce-motion *, html.a11y-reduce-motion *::before, html.a11y-reduce-motion *::after {
        animation: none !important;
        transition: none !important;
      }
      .a11y-panel {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        font-family: ui-monospace, "SF Mono", Menlo, monospace;
        font-size: 0.78rem;
      }
      .a11y-panel label { display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer; }
    `;
    document.head.appendChild(style);
  }

  // Apply any saved prefs immediately, before init() is ever called, so a
  // returning visitor's choice takes effect on first paint of any page
  // that includes this script.
  applyPrefs(readPrefs());

  return {
    init({ target }) {
      injectStyle();
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return;
      const prefs = readPrefs();

      const panel = document.createElement("div");
      panel.className = "a11y-panel";

      const makeToggle = (labelText, key) => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = !!prefs[key];
        input.addEventListener("change", () => {
          prefs[key] = input.checked;
          writePrefs(prefs);
          applyPrefs(prefs);
        });
        label.appendChild(input);
        label.appendChild(document.createTextNode(labelText));
        return label;
      };

      panel.appendChild(makeToggle("Larger text", "largeText"));
      panel.appendChild(makeToggle("Reduce motion", "reduceMotion"));
      el.appendChild(panel);
    },
  };
})();
