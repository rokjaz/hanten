// Shared "Save Image" button for every Hanten map page. Captures a target
// element with html2canvas, then composites it onto a branded canvas
// (title header + site footer) and triggers a PNG download.
//
// Usage on a page:
//   <div id="save-image-slot"></div>   (placeholder where the button goes)
//   <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
//   <script src="data/save-image.js"></script>
//   <script>HantenSaveImage.init({ target: "#map-wrap", title: "...", filename: "hanten-....png" });</script>

(function () {
  const INK = "#1c2733";
  const PAPER = "#eef1ec";
  const ACCENT = "#0e7c86";
  const SITE_URL = "hanten.app";

  const STYLE = `
    .save-image-btn {
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
      font-size: 0.8rem;
      padding: 0.55rem 0.9rem;
      border: 1px solid ${ACCENT};
      background: #fff;
      color: ${ACCENT};
      cursor: pointer;
      margin-bottom: 1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .save-image-btn:hover { background: ${ACCENT}; color: #fff; }
    .save-image-btn:disabled { opacity: 0.6; cursor: wait; }
  `;

  function injectStyleOnce() {
    if (document.getElementById("save-image-style")) return;
    const s = document.createElement("style");
    s.id = "save-image-style";
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function wrapTitle(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  async function capture(target, title, filename, btn, action = "save") {
    const originalLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Rendering…";
    try {
      const el = document.querySelector(target);
      const shot = await html2canvas(el, {
        backgroundColor: PAPER,
        scale: 2,
        useCORS: true,
        onclone: (doc) => {
          doc.querySelectorAll("details").forEach(el => {
            el.style.display = "none";
          });

          doc.querySelectorAll(
            ".save-image-btn, #save-image-slot, [class*='save-image']"
          ).forEach(el => {
            el.style.display = "none";
          });
        },
      });

      // Export the captured exhibit exactly as rendered.
      const canvas = shot;

      canvas.toBlob(async blob => {
        if (!blob) return;

        const file = new File([blob], filename, { type: "image/png" });

        if (action === "share") {
          if (
            typeof navigator.share === "function" &&
            (!navigator.canShare || navigator.canShare({ files: [file] }))
          ) {
            try {
              await navigator.share({ files: [file], title });
              btn.disabled = false;
              btn.textContent = originalLabel;
              return;
            } catch (err) {
              if (err && err.name === "AbortError") {
                btn.disabled = false;
                btn.textContent = originalLabel;
                return;
              }
            }
          }
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        btn.disabled = false;
        btn.textContent = originalLabel;
      }, "image/png");
    } catch (err) {
      console.error("Save image failed:", err);
      btn.disabled = false;
      btn.textContent = originalLabel;
      alert("Couldn't generate the image in this browser. Try Chrome or Safari, or take a screenshot instead.");
    }
  }

  window.HantenSaveImage = {
    init({ target, title, filename, slot = "#save-image-slot" }) {
      injectStyleOnce();
      const slotEl = document.querySelector(slot);
      if (!slotEl) { console.error("save-image slot not found:", slot); return; }
      const saveBtn = document.createElement("button");
      saveBtn.className = "save-image-btn";
      saveBtn.textContent = "↓ Save image";
      saveBtn.addEventListener("click", () =>
        capture(target, title, filename, saveBtn, "save")
      );
      slotEl.appendChild(saveBtn);

      if (typeof navigator.share === "function") {
        const shareBtn = document.createElement("button");
        shareBtn.className = "save-image-btn share-image-btn";
        shareBtn.textContent = "↗ Share image";
        shareBtn.addEventListener("click", () =>
          capture(target, title, filename, shareBtn, "share")
        );
        slotEl.appendChild(shareBtn);
      }
    },
  };
})();
