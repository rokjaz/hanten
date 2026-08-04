// Shared "Graphic of the Day" pool — used by index.html's featured card
// and daily.html's Daily Flip quiz. Picking is deterministic by day-of-year
// modulo pool size, so every visitor sees the same one on a given day with
// no backend or storage involved.
const HantenFeatured = {
  pool: [
    {
      href: "sea-of-japan.html",
      title: "The sea between Japan and Korea has two official names",
      colors: ["#c1442d", "#0b3d5c"],
      quiz: {
        prompt: "How many officially-recognized names does the sea between Japan and Korea have?",
        choices: ["One", "Two", "Three"],
        correct: 1,
      },
    },
    {
      href: "persian-gulf.html",
      title: "The gulf between Iran and Arabia has two names in active use",
      colors: ["#6b4fa0", "#c98a23"],
      quiz: {
        prompt: "How many names for this gulf are in real, current, active use?",
        choices: ["One", "Two", "Three"],
        correct: 1,
      },
    },
    {
      href: "gulf-of-mexico.html",
      title: "Depending where you open Google Maps, this gulf has a different name",
      colors: ["#2f7d5c", "#3b6ea3"],
      quiz: {
        prompt: "What decides which name you see for this gulf?",
        choices: ["Where you're browsing from", "How old your map app is", "Nothing — it's the same everywhere"],
        correct: 0,
      },
    },
    {
      href: "senkaku-diaoyu.html",
      title: "An uninhabited island group with three names and three claimants",
      colors: ["#3b6ea3", "#c1442d", "#2f7d5c"],
      quiz: {
        prompt: "How many countries claim this island group?",
        choices: ["Two", "Three", "Four"],
        correct: 1,
      },
    },
    {
      href: "derry-londonderry.html",
      title: "Northern Ireland's second-largest city has two names in daily use",
      colors: ["#3b6ea3", "#2f7d5c"],
      quiz: {
        prompt: "How many names does this city go by in daily use?",
        choices: ["One", "Two", "Three"],
        correct: 1,
      },
    },
    {
      href: "mount-everest.html",
      title: "The world's tallest mountain has three names",
      colors: ["#c1442d", "#c98a23", "#6b4fa0"],
      quiz: {
        prompt: "How many names does the world's tallest mountain have?",
        choices: ["One", "Two", "Three"],
        correct: 2,
      },
    },
    {
      href: "crimea.html",
      title: "The same peninsula looks different depending whose map you open",
      colors: ["#a13d3d", "#3b6ea3"],
      quiz: {
        prompt: "What changes about this peninsula depending whose map you open?",
        choices: ["Its borders", "Its language", "Its population count"],
        correct: 0,
      },
    },
    {
      href: "kashmir.html",
      title: "The world's most militarized border looks different depending whose map you open",
      colors: ["#c9862c", "#2f7d5c"],
      quiz: {
        prompt: "What's true of this border depending whose map you check?",
        choices: ["It shows a different location entirely", "It's drawn differently", "It doesn't appear at all"],
        correct: 1,
      },
    },
    {
      href: "arunachal-pradesh.html",
      title: "India's easternmost state doesn't exist on Chinese maps",
      colors: ["#c9862c", "#b0392f"],
      quiz: {
        prompt: "What happens to this Indian state on Chinese maps?",
        choices: ["It's shown as part of China", "It's left blank", "It's shown as India, just unlabeled"],
        correct: 0,
      },
    },
  ],

  // A pie slice reads oddly with only two names (it just implies a 50/50
  // split that isn't the point) — mirrors the twin-dot marker used on
  // those pages' maps instead of a wedge circle.
  wedgeIcon(colors) {
    const cx = 20, cy = 20, r = 18;
    if (colors.length === 2) {
      const cr = r * 0.55, offset = cr + 2;
      const dots = colors.map((color, i) =>
        `<circle cx="${cx + (i === 0 ? -offset : offset)}" cy="${cy}" r="${cr}" fill="${color}" stroke="#fff" stroke-width="1.5"/>`
      ).join("");
      return `<svg viewBox="0 0 40 40">${dots}</svg>`;
    }
    const n = colors.length;
    let paths = "";
    colors.forEach((color, i) => {
      const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
      const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const largeArc = (a1 - a0) > Math.PI ? 1 : 0;
      paths += `<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${largeArc} 1 ${x1},${y1} Z" fill="${color}"/>`;
    });
    return `<svg viewBox="0 0 40 40">${paths}<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-width="2"/></svg>`;
  },

  // Deterministic by calendar date (day-of-year modulo pool size), so
  // every visitor sees the same pick on a given day with no backend.
  todayPick() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return this.pool[dayOfYear % this.pool.length];
  },
};
