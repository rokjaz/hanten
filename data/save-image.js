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

  async function capture(target, title, filename, btn) {
    const originalLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Rendering…";
    try {
      const el = document.querySelector(target);
      const shot = await html2canvas(el, {
        backgroundColor: PAPER,
        scale: 2,
        useCORS: true,
      });

      const PAD = 32;
      const HEADER_H = 100;
      const FOOTER_H = 44;
      const scale = 2;
      const contentW = shot.width;
      const contentH = shot.height;
      const outW = contentW + PAD * 2 * scale;
      const outH = contentH + (HEADER_H + FOOTER_H + PAD * 2) * scale;

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, outW, outH);

      ctx.fillStyle = ACCENT;
      ctx.font = `700 ${13 * scale}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = "top";
      ctx.fillText("HANTEN", PAD * scale, PAD * scale);

      ctx.fillStyle = INK;
      ctx.font = `600 ${26 * scale}px Georgia, "Times New Roman", serif`;
      const titleLines = wrapTitle(ctx, title, outW - PAD * 2 * scale);
      let ty = (PAD + 28) * scale;
      const lineH = 32 * scale;
      titleLines.slice(0, 2).forEach(line => {
        ctx.fillText(line, PAD * scale, ty);
        ty += lineH;
      });

      ctx.drawImage(shot, PAD * scale, HEADER_H * scale, contentW, contentH);

      const footerY = HEADER_H * scale + contentH + (PAD * scale) / 2;
      ctx.strokeStyle = "rgba(28,39,51,0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD * scale, footerY);
      ctx.lineTo(outW - PAD * scale, footerY);
      ctx.stroke();

      ctx.fillStyle = INK;
      ctx.globalAlpha = 0.65;
      ctx.font = `${12 * scale}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.fillText(SITE_URL, PAD * scale, footerY + 12 * scale);
      ctx.globalAlpha = 1;

      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
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
      const btn = document.createElement("button");
      btn.className = "save-image-btn";
      btn.textContent = "⬇ Save as image";
      btn.addEventListener("click", () => capture(target, title, filename, btn));
      slotEl.appendChild(btn);
    },
  };
})();
