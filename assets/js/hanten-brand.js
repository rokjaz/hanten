/* ==========================================================
   HANTEN BRAND STAMP
   Adds "hanten.app" along the bottom of every saved or shared
   exhibit image. It wraps html2canvas, so it must load right
   after html2canvas.min.js. Each exhibit's own Save/Share code
   keeps working unchanged.
   ========================================================== */
(function () {
    if (typeof window.html2canvas !== "function" || window.html2canvas.hantenStamped) return;
    var original = window.html2canvas;

    function stamp(canvas, options) {
        var scale = (options && options.scale) || window.devicePixelRatio || 1;
        var strip = Math.round(34 * scale);
        var out = document.createElement("canvas");
        out.width = canvas.width;
        out.height = canvas.height + strip;
        var ctx = out.getContext("2d");

        // Match the strip to the image's own bottom edge color.
        var bg = "#ffffff";
        try {
            var px = canvas.getContext("2d").getImageData(2, canvas.height - 2, 1, 1).data;
            if (px[3] > 0) bg = "rgb(" + px[0] + "," + px[1] + "," + px[2] + ")";
        } catch (e) {}
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, out.width, out.height);
        ctx.drawImage(canvas, 0, 0);

        ctx.font = "700 " + Math.round(13 * scale) + "px -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "#1A3E6E";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText("hanten.app", out.width - Math.round(22 * scale), canvas.height + strip / 2 - Math.round(2 * scale));
        return out;
    }

    // The label halos come from hanten.css, which html2canvas does not
    // carry into SVG drawings. Copy them onto each label first so the
    // saved image matches the page.
    // White labels sit on colored bars or shapes, where a white halo
    // would smear them. Turn the halo off for any label filled white.
    function isWhite(fill) {
        return /^(#fff|#ffffff|white|rgb\(255, ?255, ?255\))$/i.test((fill || "").trim());
    }
    function unhaloWhiteLabels() {
        var labels = document.querySelectorAll("svg text");
        for (var i = 0; i < labels.length; i++) {
            var t = labels[i];
            if (t.getAttribute("stroke") || t.style.stroke) continue;
            if (isWhite(getComputedStyle(t).fill)) t.style.stroke = "none";
        }
    }
    unhaloWhiteLabels();
    document.addEventListener("DOMContentLoaded", unhaloWhiteLabels);
    window.addEventListener("load", function () {
        unhaloWhiteLabels();
        setTimeout(unhaloWhiteLabels, 800);
        setTimeout(unhaloWhiteLabels, 2500);
    });

    // Previous/next arrows share one row with Save/Share: arrows on the
    // left, image buttons on the right.
    function joinPager() {
        var pager = document.querySelector(".hanten-pager");
        var slot = document.getElementById("save-image-slot") || document.querySelector(".hanten-image-actions");
        if (!pager || !slot || pager.closest(".hanten-actionbar")) return;
        var bar = document.createElement("div");
        bar.className = "hanten-actionbar";
        slot.parentNode.insertBefore(bar, slot);
        bar.appendChild(pager);
        bar.appendChild(slot);
    }
    joinPager();

    function inlineHalos() {
        unhaloWhiteLabels();
        var labels = document.querySelectorAll("svg text");
        for (var i = 0; i < labels.length; i++) {
            var t = labels[i];
            if (t.getAttribute("stroke") || t.style.stroke) continue;
            var c = getComputedStyle(t);
            var halo = c.stroke && c.stroke !== "none";
            t.style.paintOrder = "stroke fill";
            t.style.stroke = halo ? c.stroke : "rgba(255, 255, 255, 0.9)";
            t.style.strokeWidth = halo ? c.strokeWidth : "3px";
            t.style.strokeLinejoin = "round";
        }
    }


    // Saved images: the transfer question sits in the same left-aligned
    // text column as the Sources line, under its amber label. Changes made
    // to the live page for the capture are undone right afterwards.
    function norm(t) { return (t || "").replace(/\s+/g, " ").trim(); }
    function placeTransfer(card, undo) {
        var src = document.querySelector(".hanten-transfer-text");
        if (!src || !card || !card.querySelectorAll) return;
        var want = norm(src.textContent);
        var set = function (el, prop, val) {
            undo.push([el, prop, el.style[prop]]);
            el.style[prop] = val;
        };

        // Page furniture that doesn't belong in a saved image.
        ["hanten-pager", "hanten-site-footer"].forEach(function (c) {
            var el = card.querySelector("." + c);
            if (el) set(el, "display", "none");
        });

        // Centered, like the "Try it somewhere else" block on the page.
        var aha = card.querySelector(".hanten-aha p, [class*='aha'] p, [class*='aha']");
        var size = aha ? getComputedStyle(aha).fontSize : "15px";
        var ink = aha ? getComputedStyle(aha).color : "#1f1f1f";
        var fit = function (el) {
            set(el, "textAlign", "center");
            set(el, "boxSizing", "border-box");
            set(el, "maxWidth", "760px");
            set(el, "marginLeft", "auto");
            set(el, "marginRight", "auto");
            set(el, "paddingTop", "14px");
            set(el, "paddingBottom", "14px");
            set(el, "borderTop", "1px solid rgba(26, 62, 110, 0.18)");
            set(el, "borderBottom", "1px solid rgba(26, 62, 110, 0.18)");
        };

        var hit = null, all = card.querySelectorAll("div, p, section");
        for (var i = 0; i < all.length; i++) {
            if (norm(all[i].textContent) === want && !all[i].closest(".hanten-transfer")) hit = all[i];
        }
        var sections = card.querySelectorAll(".hanten-transfer");

        if (hit) {
            var sc = src.querySelector(".hanten-transfer-scenario");
            var q = src.querySelector(".hanten-transfer-question");
            hit.innerHTML =
                '<div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#8F5E00;margin:0 0 6px">Try it somewhere else</div>' +
                '<div style="font-size:' + size + ';line-height:1.5;color:' + ink + ';margin:0 auto 4px;max-width:640px">' + (sc ? sc.innerHTML : "") + '</div>' +
                '<div style="font-size:' + size + ';line-height:1.5;font-weight:400;color:' + ink + ';margin:0 auto;max-width:640px">' + (q ? q.innerHTML : "") + '</div>';
            set(hit, "fontWeight", "400");
            fit(hit);
            // A second copy cloned along with the graphic would repeat it.
            for (var n = 0; n < sections.length; n++) {
                if (!sections[n].hasAttribute("data-html2canvas-ignore")) {
                    sections[n].setAttribute("data-html2canvas-ignore", "true");
                    undo.push([sections[n], "__attr", null]);
                }
            }
        } else {
            // The transfer section was cloned with the page: keep it as is.
        }
    }

    function restore(undo) {
        for (var i = undo.length - 1; i >= 0; i--) {
            var u = undo[i];
            if (u[1] === "__attr") u[0].removeAttribute("data-html2canvas-ignore");
            else u[0].style[u[1]] = u[2];
        }
    }

    var wrapped = function (element, options) {
        try { inlineHalos(); } catch (e) {}
        var undo = [];
        try { placeTransfer(element, undo); } catch (e) {}
        // Hidden page furniture shortens the page and the transfer block's
        // spacing can lengthen it; size the image to match either way.
        if (options && options.height && element.scrollHeight !== options.height) {
            options = Object.assign({}, options, { height: element.scrollHeight });
        }
        return original(element, options).then(function (canvas) {
            restore(undo);
            try { return stamp(canvas, options); } catch (e) { return canvas; }
        }, function (err) { restore(undo); throw err; });
    };
    wrapped.hantenStamped = true;
    window.html2canvas = wrapped;
})();
