/* Hanten Weekly Flip
   One guess-first question a week, rotating automatically through the
   list below (a new one every Monday). To add a flip, copy any entry
   and edit it: "answer" is the position of the right choice, counting
   from 0. Flips can come from an exhibit's main idea or from a side
   story inside one (like Macedonia vs. North Macedonia). */
const HANTEN_FLIPS = [
  { theme: "Perspective", q: "Is Reno, Nevada east or west of Los Angeles?", choices: ["East", "West"], answer: 1,
    reveal: "West. California's coast leans east, so Los Angeles ends up east of Reno.", ex: "H043" },
  { theme: "Probability", q: "How many people does it take before a shared birthday is more likely than not?", choices: ["23", "57", "183", "366"], answer: 0,
    reveal: "Just 23. It's about pairs, not dates: 23 people make 253 different pairs.", ex: "H005" },
  { theme: "Time", q: "Cleopatra lived closer in time to which?", choices: ["Building the Great Pyramid", "The Moon landing"], answer: 1,
    reveal: "The Moon landing. The pyramid was already about 2,500 years old when she was born.", ex: "H032" },
  { theme: "Time", q: "Which country has the most time zones?", choices: ["Russia", "United States", "France", "China"], answer: 2,
    reveal: "France, with 12, thanks to territories scattered across every ocean. Russia has 11.", ex: "H068" },
  { theme: "Scale", q: "If the Sun were a basketball, how far away would the nearest star be?", choices: ["A mile", "100 miles", "4,300 miles"], answer: 2,
    reveal: "About 4,300 miles: one basketball in New York and the next one near Rome.", ex: "H083" },
  { theme: "Probability", q: "After a host opens a door with a goat, should you stay or switch?", choices: ["Stay", "Switch", "It doesn't matter"], answer: 1,
    reveal: "Switch. It wins about twice as often as staying.", ex: "H040" },
  { theme: "Perspective", q: "Is London north or south of Calgary?", choices: ["North", "South"], answer: 0,
    reveal: "North. Of Canada's major cities, only Edmonton is farther north than London.", ex: "H075" },
  { theme: "Distribution", q: "About what share of the world's people live north of the equator?", choices: ["About 50%", "About 70%", "About 87%"], answer: 2,
    reveal: "About 87%. The equator splits the globe evenly, but not the people.", ex: "H069" },
  { theme: "Time", q: "Was 1900 a leap year?", choices: ["Yes", "No"], answer: 1,
    reveal: "No. Century years are leap years only when divisible by 400, so 2000 was and 2100 won't be.", ex: "H034" },
  { theme: "Scale", q: "Which is bigger: Africa, or the U.S., China, and India combined?", choices: ["Africa", "The three countries"], answer: 0,
    reveal: "Africa, with room to spare: all three fit inside it.", ex: "H007" },
  { theme: "Probability", q: "A roulette wheel just landed on red five times in a row. Is black now more likely?", choices: ["More likely", "Less likely", "Same as always"], answer: 2,
    reveal: "Same as always. The wheel doesn't remember.", ex: "H035" },
  { theme: "Perspective", q: "Two islands sit 2.4 miles apart. How far apart are their clocks?", choices: ["1 hour", "About 10 hours", "About 21 hours"], answer: 2,
    reveal: "20 or 21 hours. The International Date Line runs between them.", ex: "H042" },
  { theme: "Optimization", q: "Which is faster for boarding a plane?", choices: ["Back to front", "Random order"], answer: 1,
    reveal: "Random order, by almost a minute and a half in a real test with 72 passengers.", ex: "H051" },
  { theme: "Measurement", q: "Which weighs more: a pound of feathers or a pound of gold?", choices: ["Feathers", "Gold", "They're equal"], answer: 0,
    reveal: "Feathers. Gold is weighed in troy pounds, which are about 18% lighter.", ex: "H088" },
  { theme: "Scale", q: "Driving straight up at highway speed, how long to reach the space station's height?", choices: ["4 hours", "4 days", "4 weeks"], answer: 0,
    reveal: "Under four hours. Staying up there is the hard part: it takes 17,500 mph sideways.", ex: "H020" },
  { theme: "Systems", q: "Hanoi paid a bounty for every rat tail in 1902. What happened to the rats?", choices: ["Fewer rats", "More rats"], answer: 1,
    reveal: "More. Hunters cut off tails and let the rats go to breed, and some people farmed rats.", ex: "H052" },
  { theme: "Perspective", q: "Is all of South America east of Pensacola, Florida?", choices: ["Yes", "No"], answer: 0,
    reveal: "Yes, even its westernmost point in Peru.", ex: "H066" },
  { theme: "Probability", q: "An album has 670 stickers. Buying at random, about how many to fill it?", choices: ["About 700", "About 1,500", "About 4,750"], answer: 2,
    reveal: "About 4,750, and the last 10 stickers alone take about 1,960.", ex: "H044" },
  { theme: "Distribution", q: "Can you turn a globe so the half you see is nearly all ocean?", choices: ["No, about 60% at most", "Yes, about 89% ocean"], answer: 1,
    reveal: "Yes. Center it just southeast of New Zealand and 89% of what you see is water.", ex: "H016" },
  { theme: "Statistics", q: "A poll shows 48% to 46%, with a ±3 margin of error. Who's ahead?", choices: ["The 48%", "Too close to tell"], answer: 1,
    reveal: "Too close to tell. The margin on the gap is about ±6 points.", ex: "H097" },
  { theme: "Perspective", q: "Does Alaska reach into the Eastern Hemisphere?", choices: ["Yes", "No"], answer: 0,
    reveal: "Yes. Its Aleutian Islands cross 180°, making Alaska the westernmost and easternmost U.S. state.", ex: "H045" },
  { theme: "Optimization", q: "Choosing one apartment out of many, how much of your search should you spend just looking?", choices: ["10%", "37%", "50%"], answer: 1,
    reveal: "About 37%. Then take the first one better than everything you've seen.", ex: "H050" },
  { theme: "Scale", q: "Rolled into one ball, would all of Earth's water be bigger or smaller than the Moon?", choices: ["Bigger", "Smaller"], answer: 1,
    reveal: "Smaller: about 860 miles across. The Moon is 2,159.", ex: "H073" },
  { theme: "Statistics", q: "Life expectancy in 1900 was under 48. Did most adults die around 40?", choices: ["Yes", "No"], answer: 1,
    reveal: "No. Childhood deaths pulled the average down; adults often lived into their 60s and 70s.", ex: "H090" },
  { theme: "Distribution", q: "Among Canadian-born NHL draftees, how do January–March birthdays compare with October–December?", choices: ["About the same", "About 1½ times", "About 2½ times"], answer: 2,
    reveal: "About 2½ times as many: 36% versus 14.5%.", ex: "H071" },
  { theme: "Perspective", q: "Al-Idrisi's famous 1154 world map put which direction at the top?", choices: ["North", "East", "South"], answer: 2,
    reveal: "South. North-up maps are a habit, not a rule.", ex: "H101" },
  { theme: "Measurement", q: "About how much of U.S. land holds 40% of Americans?", choices: ["1.8%", "10%", "25%"], answer: 0,
    reveal: "Just 1.8%, while nearly half the land holds only 1.3% of people.", ex: "H014" },
  { theme: "Systems", q: "Shoppers buy 10% more. How much do factory orders swing?", choices: ["About 10%", "Much more than 10%"], answer: 1,
    reveal: "Much more. Each step up the chain adds its own cushion: the bullwhip effect.", ex: "H053" }
];

(() => {
  const card = document.getElementById("weekly-flip");
  if (!card || !HANTEN_FLIPS.length) return;
  // Weeks since Monday, October 5, 2026: a new flip every Monday.
  const start = Date.UTC(2026, 9, 5);
  const week = Math.max(0, Math.floor((Date.now() - start) / (7 * 864e5)));
  const f = HANTEN_FLIPS[week % HANTEN_FLIPS.length];
  const $ = s => card.querySelector('[data-flip="' + s + '"]');
  $("theme").textContent = f.theme;
  $("question").textContent = f.q;
  const box = $("choices");
  box.innerHTML = "";
  const answer = card.querySelector(".flip-answer");
  f.choices.forEach((c, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = c;
    b.addEventListener("click", () => {
      [...box.children].forEach((x, j) => {
        x.disabled = true;
        x.classList.toggle("selected", x === b);
        x.classList.toggle("is-answer", j === f.answer);
      });
      $("reveal").textContent = (i === f.answer ? "Right. " : "") + f.reveal;
      $("link").href = "exhibits/" + f.ex + "/";
      answer.hidden = false;
    });
    box.appendChild(b);
  });
})();
