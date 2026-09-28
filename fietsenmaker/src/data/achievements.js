function getTotalStars(progress) {
  return Object.values(progress.games).reduce((sum, g) => sum + g.totalStars, 0);
}

export const ACHIEVEMENTS = [
  {
    id: "eerste_keer",
    naam: "Eerste rit!",
    beschrijving: "Voor het eerst een spel gespeeld",
    emoji: "\ud83d\udeb2",
    check: (p) => p.totalSessions >= 1,
  },
  {
    id: "alle_games",
    naam: "Alles geprobeerd",
    beschrijving: "Alle 6 spellen gespeeld",
    emoji: "\ud83c\udf1f",
    check: (p) =>
      ["woorden", "rekenen", "letters", "rijmen", "kleuren", "vormen"].every(
        (id) => (p.games[id]?.totalStars ?? 0) > 0
      ),
  },
  {
    id: "tien_sterren",
    naam: "Tien sterren",
    beschrijving: "10 sterren verzameld",
    emoji: "\u2b50",
    check: (p) => getTotalStars(p) >= 10,
  },
  {
    id: "vijftig_sterren",
    naam: "Sterspeler",
    beschrijving: "50 sterren verzameld",
    emoji: "\ud83c\udfc6",
    check: (p) => getTotalStars(p) >= 50,
  },
  {
    id: "honderd_sterren",
    naam: "Sterrenhemel",
    beschrijving: "100 sterren verzameld",
    emoji: "\ud83c\udf20",
    check: (p) => getTotalStars(p) >= 100,
  },
  {
    id: "perfecte_lezer",
    naam: "Perfecte lezer",
    beschrijving: "8 uit 8 in Woordenwiel",
    emoji: "\ud83d\udcd6",
    check: (p) => (p.games.woorden?.bestScore ?? 0) >= 8,
  },
  {
    id: "rekenaar",
    naam: "Rekenaar",
    beschrijving: "8 uit 8 in Rekenrace",
    emoji: "\ud83c\udfaf",
    check: (p) => (p.games.rekenen?.bestScore ?? 0) >= 8,
  },
  {
    id: "speller",
    naam: "Woordbouwer",
    beschrijving: "6 uit 6 in Letterbouwer",
    emoji: "\ud83d\udd24",
    check: (p) => (p.games.letters?.bestScore ?? 0) >= 6,
  },
  {
    id: "drie_dagen",
    naam: "Drie dagen op rij!",
    beschrijving: "3 dagen achter elkaar gespeeld",
    emoji: "\ud83d\udd25",
    check: (p) => p.streak >= 3,
  },
  {
    id: "rijmer",
    naam: "Rijmkampioen",
    beschrijving: "8 uit 8 in Rijmfiets",
    emoji: "\ud83c\udfb5",
    check: (p) => (p.games.rijmen?.bestScore ?? 0) >= 8,
  },
  {
    id: "kleurkunstenaar",
    naam: "Kleurkunstenaar",
    beschrijving: "6 uit 6 in Kleurenmixer",
    emoji: "\ud83c\udfa8",
    check: (p) => (p.games.kleuren?.bestScore ?? 0) >= 6,
  },
  {
    id: "vormenkenner",
    naam: "Vormenkenner",
    beschrijving: "6 uit 6 in Vormenrit",
    emoji: "\ud83d\udd37",
    check: (p) => (p.games.vormen?.bestScore ?? 0) >= 6,
  },
  {
    id: "kampioen",
    naam: "Kampioen",
    beschrijving: "Perfect in alle 6 spellen",
    emoji: "\ud83c\udfc5",
    check: (p) =>
      (p.games.woorden?.bestScore ?? 0) >= 8 &&
      (p.games.rekenen?.bestScore ?? 0) >= 8 &&
      (p.games.letters?.bestScore ?? 0) >= 6 &&
      (p.games.rijmen?.bestScore ?? 0) >= 8 &&
      (p.games.kleuren?.bestScore ?? 0) >= 6 &&
      (p.games.vormen?.bestScore ?? 0) >= 6,
  },
];
