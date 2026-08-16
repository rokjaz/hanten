// True 3D surface area vs. flat land area, by state — how much bigger a
// state's terrain is once you account for slopes, computed from a real
// elevation model rather than looked up (nobody publishes this figure).
//
// Method: GEBCO_2025 global elevation grid (15 arc-second resolution,
// ~460m cells) via CEDA. For every land cell, the local slope was derived
// from the elevation gradient to neighboring cells, and the cell's true
// surface area was computed as (flat cell area) x sqrt(1 + slope_x^2 +
// slope_y^2) — the standard method for estimating surface area from a
// digital elevation model. Cells were assigned to states by point-in-
// polygon test against state boundaries, then summed. `ratio` = true
// surface area / flat area for that state; multiply by a state's land
// area (data/state-area.js) to get its estimated true surface area.
// 15 arc-second cells still smooth out sub-cell terrain (narrow ridges,
// cliffs), so these ratios are a floor on the real effect, not a ceiling.
const STATE_SURFACE_AREA = {
  "Alabama": { ratio: 1.00049 },
  "Alaska": { ratio: 1.01879 },
  "Arizona": { ratio: 1.00448 },
  "Arkansas": { ratio: 1.00085 },
  "California": { ratio: 1.01003 },
  "Colorado": { ratio: 1.00732 },
  "Connecticut": { ratio: 1.00158 },
  "Delaware": { ratio: 1.00003 },
  "Florida": { ratio: 1.00002 },
  "Georgia": { ratio: 1.00044 },
  "Hawaii": { ratio: 1.00986 },
  "Idaho": { ratio: 1.01377 },
  "Illinois": { ratio: 1.00008 },
  "Indiana": { ratio: 1.00014 },
  "Iowa": { ratio: 1.00014 },
  "Kansas": { ratio: 1.00009 },
  "Kentucky": { ratio: 1.00137 },
  "Louisiana": { ratio: 1.00004 },
  "Maine": { ratio: 1.00194 },
  "Maryland": { ratio: 1.00082 },
  "Massachusetts": { ratio: 1.00172 },
  "Michigan": { ratio: 1.00018 },
  "Minnesota": { ratio: 1.00012 },
  "Mississippi": { ratio: 1.00010 },
  "Missouri": { ratio: 1.00027 },
  "Montana": { ratio: 1.00750 },
  "Nebraska": { ratio: 1.00018 },
  "Nevada": { ratio: 1.00562 },
  "New Hampshire": { ratio: 1.00589 },
  "New Jersey": { ratio: 1.00064 },
  "New Mexico": { ratio: 1.00227 },
  "New York": { ratio: 1.00283 },
  "North Carolina": { ratio: 1.00186 },
  "North Dakota": { ratio: 1.00015 },
  "Ohio": { ratio: 1.00035 },
  "Oklahoma": { ratio: 1.00030 },
  "Oregon": { ratio: 1.00824 },
  "Pennsylvania": { ratio: 1.00284 },
  "Rhode Island": { ratio: 1.00043 },
  "South Carolina": { ratio: 1.00020 },
  "South Dakota": { ratio: 1.00029 },
  "Tennessee": { ratio: 1.00189 },
  "Texas": { ratio: 1.00034 },
  "Utah": { ratio: 1.00719 },
  "Vermont": { ratio: 1.00644 },
  "Virginia": { ratio: 1.00279 },
  "Washington": { ratio: 1.01727 },
  "West Virginia": { ratio: 1.00488 },
  "Wisconsin": { ratio: 1.00028 },
  "Wyoming": { ratio: 1.00468 },
};
