// AVI Start level — short, familiar Dutch words for beginning readers (groep 2/3)
// Only words where the emoji UNAMBIGUOUSLY matches the Dutch word for a 5-6 year old.
// thema: which game location uses the word

export const WOORDEN = [
  // === STATION / TREIN (Woordenwiel) ===
  // Rule: a child seeing the emoji must immediately think of exactly this Dutch word.
  { woord: "trein",  emoji: "\ud83d\ude86", hint: "Rijdt op rails",              thema: "station" },
  { woord: "bus",    emoji: "\ud83d\ude8c", hint: "Veel mensen passen erin",     thema: "station", meervoud: "bussen" },
  { woord: "auto",   emoji: "\ud83d\ude97", hint: "Heeft vier wielen",           thema: "station", meervoud: "auto's" },
  { woord: "fiets",  emoji: "\ud83d\udeb2", hint: "Je trapt erop",               thema: "station" },
  { woord: "step",   emoji: "\ud83d\udef4", hint: "Je staat erop en duwt",       thema: "station", meervoud: "steps" },
  { woord: "jas",    emoji: "\ud83e\udde5", hint: "Trek je aan als het koud is",  thema: "station" },
  { woord: "pet",    emoji: "\ud83e\udde2", hint: "Zit op je hoofd",             thema: "station" },
  { woord: "tas",    emoji: "\ud83c\udf92", hint: "Je draagt het op je rug",     thema: "station", meervoud: "tassen" },
  { woord: "deur",   emoji: "\ud83d\udeaa", hint: "Je gaat erdoorheen",          thema: "station" },
  { woord: "raam",   emoji: "\ud83e\ude9f", hint: "Je kijkt erdoorheen",         thema: "station", meervoud: "ramen" },
  { woord: "wiel",   emoji: "\ud83d\udede", hint: "Rond en rolt",                thema: "station" },
  { woord: "bel",    emoji: "\ud83d\udd14", hint: "Ring ring!",                  thema: "station" },
  { woord: "lamp",   emoji: "\ud83d\udca1", hint: "Geeft licht",                 thema: "station" },
  { woord: "weg",    emoji: "\ud83d\udee3\ufe0f", hint: "Je rijdt erop",         thema: "station" },
  { woord: "brug",   emoji: "\ud83c\udf09", hint: "Over het water",              thema: "station" },
  { woord: "helm",   emoji: "\u26d1\ufe0f", hint: "Beschermt je hoofd",          thema: "station" },
  { woord: "slot",   emoji: "\ud83d\udd12", hint: "Tegen stelen",                thema: "station" },

  // === SCHOOL (Letterbouwer) ===
  // Rule: same — emoji must unambiguously trigger the Dutch word.
  { woord: "pen",    emoji: "\ud83d\udd8a\ufe0f", hint: "Schrijf ermee",         thema: "school" },
  { woord: "bel",    emoji: "🔔",        hint: "Die gaat als de pauze begint", thema: "school" },
  { woord: "boek",   emoji: "\ud83d\udcd6",        hint: "Daarin staan woorden",  thema: "school" },
  { woord: "juf",    emoji: "👩‍🏫",        hint: "Zij geeft les",          thema: "school" },
  { woord: "krijt",  emoji: "\ud83d\udd8d\ufe0f",  hint: "Schrijf op het bord",   thema: "school" },
  { woord: "map",    emoji: "\ud83d\udcc1",        hint: "Daarin zitten papieren", thema: "school" },
  { woord: "stoel",  emoji: "\ud83e\ude91",        hint: "Je zit erop",           thema: "school" },
  { woord: "vlag",   emoji: "\ud83d\udea9",        hint: "Wappert in de wind",    thema: "school" },
];

// === WORDS NEEDING CUSTOM SPRITES (no unambiguous emoji) ===
// Add these once a word-cards.png sprite sheet is generated:
//   gom   (eraser)     — no eraser emoji
//   lei   (slate)      — no slate emoji
//   bord  (blackboard) — emoji 🪧 reads as "sign", not "blackboard"
//   pomp  (pump)       — 💨 reads as wind
//   band  (tyre)       — no tyre emoji
//   rem   (brake)      — no brake emoji

export const CHEERS = [
  "Goed zo! \ud83c\udf1f",
  "Super! \u2b50",
  "Knap hoor! \ud83c\udf89",
  "Wauw! \ud83d\udcaa",
  "Helemaal goed! \ud83c\udfc6",
  "Jij bent slim! \ud83e\udde0",
  "Fantastisch! \ud83c\udf8a",
  "Top! \ud83d\udc4f",
];

export const OOPS = [
  "Bijna! Probeer nog eens \ud83d\udcaa",
  "Oeps! Niet erg, nog een keer!",
  "Dat was net niet... \ud83e\udd14",
  "Probeer het opnieuw! \ud83d\udd04",
];

export const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const pickN = (a, n, ex = []) =>
  shuffle(a.filter((x) => !ex.includes(x))).slice(0, n);
