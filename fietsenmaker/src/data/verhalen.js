// Storyboards for the theater. Each scene is a small comic panel:
// `decor` = background, `figuren` = emoji on stage (first one is the lead),
// `lucht` = optional sky item top-right, `zin` = what is read aloud.
// Ordered from 3 to 5 panels, so the session gets harder.
export const DECORS = {
  bos: "linear-gradient(180deg, #d4f1c5 0%, #86c97a 100%)",
  huis: "linear-gradient(180deg, #fff1dc 0%, #f4c48f 100%)",
  tuin: "linear-gradient(180deg, #d6f0ff 0%, #d6f0ff 58%, #8bc34a 58%, #6fa53a 100%)",
  werkplaats: "linear-gradient(180deg, #eef2f5 0%, #c9d3db 100%)",
  water: "linear-gradient(180deg, #d6f0ff 0%, #d6f0ff 50%, #5aaee0 50%, #2f86c6 100%)",
  nacht: "linear-gradient(180deg, #2c3e75 0%, #0b1437 100%)",
  maan: "linear-gradient(180deg, #0b1437 0%, #0b1437 62%, #c8ccd6 62%, #9aa0ad 100%)",
  feest: "linear-gradient(180deg, #ffe3f1 0%, #ffc2dd 100%)",
};

export const VERHALEN = [
  {
    titel: "Het zaadje",
    scenes: [
      { decor: "tuin", figuren: ["👧", "🌰"], zin: "Het meisje plant een zaadje." },
      { decor: "tuin", figuren: ["🌱"], lucht: "🌧️", zin: "Het regent. Er komt een plantje." },
      { decor: "tuin", figuren: ["🌻", "👧"], lucht: "☀️", zin: "Kijk, een grote bloem!" },
    ],
  },
  {
    titel: "De lekke band",
    scenes: [
      { decor: "tuin", figuren: ["🚲", "😢"], lucht: "💥", zin: "Oh nee, de band is lek!" },
      { decor: "werkplaats", figuren: ["🧑‍🔧", "🔧", "🚲"], zin: "De fietsenmaker plakt de band." },
      { decor: "tuin", figuren: ["🚴", "😄"], lucht: "☀️", zin: "Hoera, weer fietsen!" },
    ],
  },
  {
    titel: "Roodkapje",
    scenes: [
      { decor: "huis", figuren: ["👧", "🧺"], zin: "Roodkapje brengt oma een mandje." },
      { decor: "bos", figuren: ["👧", "🌲", "🌸"], zin: "Ze loopt door het bos." },
      { decor: "bos", figuren: ["🐺", "👧"], lucht: "🌲", zin: "Daar is de wolf!" },
      { decor: "huis", figuren: ["👵", "👧"], lucht: "❤️", zin: "Oma en Roodkapje zijn weer blij." },
    ],
  },
  {
    titel: "De drie biggetjes",
    scenes: [
      { decor: "tuin", figuren: ["🐷", "🐷", "🐷"], lucht: "🔨", zin: "De biggetjes bouwen elk een huisje." },
      { decor: "tuin", figuren: ["🐺", "💨", "🛖"], zin: "De wolf blaast het strohuisje om." },
      { decor: "tuin", figuren: ["🐺", "💨", "🧱"], zin: "Het stenen huis blijft staan!" },
      { decor: "feest", figuren: ["🐷", "🐷", "🐷"], lucht: "🎉", zin: "De biggetjes zijn veilig." },
    ],
  },
  {
    titel: "Het lelijke eendje",
    scenes: [
      { decor: "water", figuren: ["🥚", "🦆"], zin: "Uit het ei komt een eendje." },
      { decor: "water", figuren: ["🐥", "🦆", "🦆"], lucht: "😢", zin: "Het eendje ziet er anders uit." },
      { decor: "nacht", figuren: ["🐥"], lucht: "❄️", zin: "Het is winter. Het eendje is alleen." },
      { decor: "water", figuren: ["🦢"], lucht: "☀️", zin: "In de lente is het een mooie zwaan!" },
    ],
  },
  {
    titel: "Naar de maan",
    scenes: [
      { decor: "tuin", figuren: ["🧑‍🚀", "🚀"], zin: "De astronaut stapt in de raket." },
      { decor: "tuin", figuren: ["🚀", "🔥"], lucht: "3️⃣", zin: "Drie, twee, een... lancering!" },
      { decor: "nacht", figuren: ["🚀"], lucht: "⭐", zin: "De raket vliegt tussen de sterren." },
      { decor: "maan", figuren: ["🧑‍🚀", "🚩"], lucht: "🌍", zin: "De astronaut zet een vlag op de maan." },
      { decor: "huis", figuren: ["🧑‍🚀", "👨‍👩‍👧"], lucht: "❤️", zin: "Weer thuis. Wat een reis!" },
    ],
  },
];
