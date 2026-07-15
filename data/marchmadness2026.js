// Baseline: NCAA Division I men's basketball programs per state, 2025-26
// season (approximate — compiled from a public state-by-state list, not an
// official NCAA total; treat as a reasonable estimate, not an exact count).
const D1_BY_STATE = {
  "Alabama": 10, "Alaska": 0, "Arizona": 4, "Arkansas": 5, "California": 26,
  "Colorado": 5, "Connecticut": 7, "Delaware": 2, "District of Columbia": 4,
  "Florida": 13, "Georgia": 6, "Hawaii": 1, "Idaho": 3, "Illinois": 13,
  "Indiana": 11, "Iowa": 4, "Kansas": 3, "Kentucky": 8, "Louisiana": 11,
  "Maine": 1, "Maryland": 9, "Massachusetts": 8, "Michigan": 7, "Minnesota": 2,
  "Mississippi": 6, "Missouri": 5, "Montana": 2, "Nebraska": 3, "Nevada": 2,
  "New Hampshire": 2, "New Jersey": 8, "New Mexico": 2, "New York": 22,
  "North Carolina": 18, "North Dakota": 2, "Ohio": 13, "Oklahoma": 4,
  "Oregon": 4, "Pennsylvania": 14, "Rhode Island": 4, "South Carolina": 12,
  "South Dakota": 2, "Tennessee": 12, "Texas": 22, "Utah": 7, "Vermont": 1,
  "Virginia": 14, "Washington": 5, "West Virginia": 2, "Wisconsin": 3,
  "Wyoming": 1,
};

// The 68-team 2026 NCAA Division I men's basketball tournament field.
// `reached`: last round a team actually played before losing (higher = further).
// 1 = lost in the First Four, 2 = lost in the Round of 64, 3 = Round of 32,
// 4 = Sweet 16, 5 = Elite Eight, 6 = Final Four, 7 = runner-up (lost the
// championship game), 8 = champion. Verified game-by-game against the
// official bracket, region by region, after an initial AI-summarized pass
// of the results turned out to have several rounds mislabeled.
const MM_TEAMS = {
  // East Region
  "Duke":                 { state: "North Carolina",   seed: 1,  region: "East", reached: 5, note: "Lost to UConn in the Elite Eight, 73–72" },
  "UConn":                { state: "Connecticut",       seed: 2,  region: "East", reached: 7, note: "Runner-up — beat Illinois 71–62 in the Final Four, then lost the championship to Michigan, 69–63" },
  "Michigan State":       { state: "Michigan",          seed: 3,  region: "East", reached: 4, note: "Lost to UConn in the Sweet 16, 67–63" },
  "Kansas":               { state: "Kansas",            seed: 4,  region: "East", reached: 3, note: "Lost to St. John's in the Round of 32, 67–65" },
  "St. John's":           { state: "New York",          seed: 5,  region: "East", reached: 4, note: "Lost to Duke in the Sweet 16, 80–75" },
  "Louisville":           { state: "Kentucky",          seed: 6,  region: "East", reached: 3, note: "Lost to Michigan State in the Round of 32, 77–69" },
  "UCLA":                 { state: "California",        seed: 7,  region: "East", reached: 3, note: "Lost to UConn in the Round of 32, 73–57" },
  "Ohio State":           { state: "Ohio",              seed: 8,  region: "East", reached: 2, note: "Lost to TCU in the Round of 64, 66–64" },
  "TCU":                  { state: "Texas",             seed: 9,  region: "East", reached: 3, note: "Lost to Duke in the Round of 32, 81–58" },
  "UCF":                  { state: "Florida",           seed: 10, region: "East", reached: 2, note: "Lost to UCLA in the Round of 64, 75–71" },
  "South Florida":        { state: "Florida",           seed: 11, region: "East", reached: 2, note: "Lost to Louisville in the Round of 64, 83–79" },
  "Northern Iowa":        { state: "Iowa",              seed: 12, region: "East", reached: 2, note: "Lost to St. John's in the Round of 64, 79–53" },
  "California Baptist":   { state: "California",        seed: 13, region: "East", reached: 2, note: "Lost to Kansas in the Round of 64, 68–60" },
  "North Dakota State":   { state: "North Dakota",      seed: 14, region: "East", reached: 2, note: "Lost to Michigan State in the Round of 64, 92–67" },
  "Furman":               { state: "South Carolina",    seed: 15, region: "East", reached: 2, note: "Lost to UConn in the Round of 64, 82–71" },
  "Siena":                { state: "New York",          seed: 16, region: "East", reached: 2, note: "Lost to Duke in the Round of 64, 71–65" },

  // West Region
  "Arizona":              { state: "Arizona",           seed: 1,  region: "West", reached: 6, note: "Lost to Michigan in the Final Four, 91–73" },
  "Purdue":               { state: "Indiana",           seed: 2,  region: "West", reached: 5, note: "Lost to Arizona in the Elite Eight, 79–64" },
  "Gonzaga":              { state: "Washington",        seed: 3,  region: "West", reached: 3, note: "Lost to Texas in the Round of 32, 74–68" },
  "Arkansas":             { state: "Arkansas",          seed: 4,  region: "West", reached: 4, note: "Lost to Arizona in the Sweet 16, 109–88" },
  "Wisconsin":            { state: "Wisconsin",         seed: 5,  region: "West", reached: 2, note: "Lost to High Point in the Round of 64, 83–82" },
  "BYU":                  { state: "Utah",              seed: 6,  region: "West", reached: 2, note: "Lost to Texas in the Round of 64, 79–71" },
  "Miami (FL)":           { state: "Florida",           seed: 7,  region: "West", reached: 3, note: "Lost to Purdue in the Round of 32, 104–69" },
  "Villanova":            { state: "Pennsylvania",      seed: 8,  region: "West", reached: 2, note: "Lost to Utah State in the Round of 64, 86–76" },
  "Utah State":           { state: "Utah",              seed: 9,  region: "West", reached: 3, note: "Lost to Arizona in the Round of 32, 78–66" },
  "Missouri":             { state: "Missouri",          seed: 10, region: "West", reached: 2, note: "Lost to Miami (FL) in the Round of 64, 80–66" },
  "Texas":                { state: "Texas",             seed: 11, region: "West", reached: 4, note: "First Four winner (beat NC State 68–66) — lost to Purdue in the Sweet 16, 79–77" },
  "High Point":           { state: "North Carolina",    seed: 12, region: "West", reached: 3, note: "Lost to Arkansas in the Round of 32, 94–88" },
  "Hawaii":               { state: "Hawaii",            seed: 13, region: "West", reached: 2, note: "Lost to Arkansas in the Round of 64, 94–78" },
  "Kennesaw State":       { state: "Georgia",           seed: 14, region: "West", reached: 2, note: "Lost to Gonzaga in the Round of 64, 73–64" },
  "Queens":               { state: "North Carolina",    seed: 15, region: "West", reached: 2, note: "Lost to Purdue in the Round of 64, 79–71" },
  "LIU":                  { state: "New York",          seed: 16, region: "West", reached: 2, note: "Lost to Arizona in the Round of 64, 92–58" },

  // South Region
  "Florida":              { state: "Florida",           seed: 1,  region: "South", reached: 3, note: "Lost to Iowa in the Round of 32, 73–72" },
  "Houston":              { state: "Texas",             seed: 2,  region: "South", reached: 4, note: "Lost to Illinois in the Sweet 16, 65–55" },
  "Illinois":             { state: "Illinois",          seed: 3,  region: "South", reached: 6, note: "Lost to UConn in the Final Four, 71–62" },
  "Nebraska":             { state: "Nebraska",          seed: 4,  region: "South", reached: 4, note: "Lost to Iowa in the Sweet 16, 77–71" },
  "Vanderbilt":           { state: "Tennessee",         seed: 5,  region: "South", reached: 3, note: "Lost to Nebraska in the Round of 32, 74–72" },
  "North Carolina":       { state: "North Carolina",    seed: 6,  region: "South", reached: 2, note: "Lost to VCU in the Round of 64, 82–78 (OT)" },
  "Saint Mary's":         { state: "California",        seed: 7,  region: "South", reached: 2, note: "Lost to Texas A&M in the Round of 64, 63–50" },
  "Clemson":              { state: "South Carolina",    seed: 8,  region: "South", reached: 2, note: "Lost to Iowa in the Round of 64, 67–61" },
  "Iowa":                 { state: "Iowa",              seed: 9,  region: "South", reached: 5, note: "Lost to Illinois in the Elite Eight, 71–59" },
  "Texas A&M":            { state: "Texas",             seed: 10, region: "South", reached: 3, note: "Lost to Houston in the Round of 32, 88–57" },
  "VCU":                  { state: "Virginia",          seed: 11, region: "South", reached: 3, note: "Lost to Illinois in the Round of 32, 76–55" },
  "McNeese":              { state: "Louisiana",         seed: 12, region: "South", reached: 2, note: "Lost to Vanderbilt in the Round of 64, 78–68" },
  "Troy":                 { state: "Alabama",           seed: 13, region: "South", reached: 2, note: "Lost to Nebraska in the Round of 64, 76–47" },
  "Penn":                 { state: "Pennsylvania",      seed: 14, region: "South", reached: 2, note: "Lost to Illinois in the Round of 64, 105–70" },
  "Idaho":                { state: "Idaho",             seed: 15, region: "South", reached: 2, note: "Lost to Houston in the Round of 64, 88–47" },
  "Prairie View A&M":     { state: "Texas",             seed: 16, region: "South", reached: 2, note: "First Four winner (beat Lehigh 67–55) — lost to Florida in the Round of 64, 114–55" },

  // Midwest Region
  "Michigan":             { state: "Michigan",          seed: 1,  region: "Midwest", reached: 8, note: "Champion — beat UConn 69–63 in the title game" },
  "Iowa State":           { state: "Iowa",              seed: 2,  region: "Midwest", reached: 4, note: "Lost to Tennessee in the Sweet 16, 76–62" },
  "Virginia":             { state: "Virginia",          seed: 3,  region: "Midwest", reached: 3, note: "Lost to Tennessee in the Round of 32, 79–72" },
  "Alabama":              { state: "Alabama",           seed: 4,  region: "Midwest", reached: 4, note: "Lost to Michigan in the Sweet 16, 90–77" },
  "Texas Tech":           { state: "Texas",             seed: 5,  region: "Midwest", reached: 3, note: "Lost to Alabama in the Round of 32, 90–65" },
  "Tennessee":            { state: "Tennessee",         seed: 6,  region: "Midwest", reached: 5, note: "Lost to Michigan in the Elite Eight, 95–62" },
  "Kentucky":             { state: "Kentucky",          seed: 7,  region: "Midwest", reached: 3, note: "Lost to Iowa State in the Round of 32, 82–63" },
  "Georgia":              { state: "Georgia",           seed: 8,  region: "Midwest", reached: 2, note: "Lost to Saint Louis in the Round of 64, 102–77" },
  "Saint Louis":          { state: "Missouri",          seed: 9,  region: "Midwest", reached: 3, note: "Lost to Michigan in the Round of 32, 95–72" },
  "Santa Clara":          { state: "California",        seed: 10, region: "Midwest", reached: 2, note: "Lost to Kentucky in the Round of 64, 89–84 (OT)" },
  "Miami (OH)":           { state: "Ohio",              seed: 11, region: "Midwest", reached: 2, note: "First Four winner (beat SMU 89–79) — lost to Tennessee in the Round of 64, 78–56" },
  "Akron":                { state: "Ohio",              seed: 12, region: "Midwest", reached: 2, note: "Lost to Texas Tech in the Round of 64, 91–71" },
  "Hofstra":              { state: "New York",          seed: 13, region: "Midwest", reached: 2, note: "Lost to Alabama in the Round of 64, 90–70" },
  "Wright State":         { state: "Ohio",              seed: 14, region: "Midwest", reached: 2, note: "Lost to Virginia in the Round of 64, 82–73" },
  "Tennessee State":      { state: "Tennessee",         seed: 15, region: "Midwest", reached: 2, note: "Lost to Iowa State in the Round of 64, 108–74" },
  "Howard":               { state: "District of Columbia", seed: 16, region: "Midwest", reached: 2, note: "First Four winner (beat UMBC 86–83) — lost to Michigan in the Round of 64, 101–80" },

  // First Four — eliminated before the Round of 64
  "UMBC":                 { state: "Maryland",          seed: 16, region: "East (First Four)",    reached: 1, note: "Lost to Howard in the First Four, 86–83" },
  "NC State":             { state: "North Carolina",    seed: 11, region: "West (First Four)",    reached: 1, note: "Lost to Texas in the First Four, 68–66" },
  "Lehigh":               { state: "Pennsylvania",      seed: 16, region: "South (First Four)",   reached: 1, note: "Lost to Prairie View A&M in the First Four, 67–55" },
  "SMU":                  { state: "Texas",             seed: 11, region: "Midwest (First Four)", reached: 1, note: "Lost to Miami (OH) in the First Four, 89–79" },
};
