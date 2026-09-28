/**
 * Rhyme pairs for the Rijmfiets (haven) game.
 * Each entry: target word + the correct rhyme word.
 * Distractors are generated at runtime from other rijmt values.
 * All words at AVI Start level — short, familiar, decodable.
 */
export const RIJMDATA = [
  // === HAVEN / BOOT (nautical context) ===
  { woord: "boot",  emoji: "\u26f5",          rijmt: "groot",  hint: "Luister naar het einde: -oot" },
  { woord: "haai", emoji: "🦈", rijmt: "kraai", hint: "Luister naar het einde: -aai" },
  { woord: "zee",   emoji: "🏖️",     rijmt: "mee",    hint: "Luister naar het einde: -ee" },
  { woord: "vis",   emoji: "\ud83d\udc1f",     rijmt: "mis",    hint: "Luister naar het einde: -is" },
  { woord: "net",   emoji: "\ud83c\udfa3",     rijmt: "het",    hint: "Luister naar het einde: -et" },
  { woord: "sok", emoji: "🧦", rijmt: "rok", hint: "Luister naar het einde: -ok" },
  { woord: "golf",  emoji: "\ud83c\udf0a",     rijmt: "wolf",   hint: "Luister naar het einde: -olf" },
  { woord: "beer", emoji: "🐻", rijmt: "peer", hint: "Luister naar het einde: -eer" },
  { woord: "pier", emoji: "🪱", rijmt: "vier", hint: "Luister naar het einde: -ier" },
  { woord: "jas", emoji: "🧥", rijmt: "tas", hint: "Luister naar het einde: -as" },

  // === ALGEMEEN (extra variatie) ===
  { woord: "fiets", emoji: "\ud83d\udeb2",     rijmt: "niets",  hint: "Luister naar het einde: -iets" },
  { woord: "bus",   emoji: "\ud83d\ude8c",     rijmt: "kus",    hint: "Luister naar het einde: -us" },
  { woord: "trein", emoji: "\ud83d\ude86",     rijmt: "klein",  hint: "Luister naar het einde: -ein" },
  { woord: "lamp",  emoji: "\ud83d\udca1",     rijmt: "kamp",   hint: "Luister naar het einde: -amp" },
  { woord: "band",  emoji: "🛞",           rijmt: "hand",   hint: "Luister naar het einde: -and" },
  { woord: "pen", emoji: "🖊️", rijmt: "ren", hint: "Luister naar het einde: -en" },
  { woord: "bel",   emoji: "\ud83d\udd14",     rijmt: "snel",   hint: "Luister naar het einde: -el" },
  { woord: "slot",  emoji: "\ud83d\udd12",     rijmt: "pot",    hint: "Luister naar het einde: -ot" },
  { woord: "tang",  emoji: "\ud83d\udd27",     rijmt: "lang",   hint: "Luister naar het einde: -ang" },
  { woord: "brug",  emoji: "\ud83c\udf09",     rijmt: "rug",    hint: "Luister naar het einde: -ug" },
  { woord: "weg",   emoji: "\ud83d\udee3\ufe0f", rijmt: "zeg",  hint: "Luister naar het einde: -eg" },
  { woord: "kat",   emoji: "\ud83d\udc31",     rijmt: "mat",    hint: "Luister naar het einde: -at" },
  { woord: "hond",  emoji: "\ud83d\udc36",     rijmt: "rond",   hint: "Luister naar het einde: -ond" },
  { woord: "dag",   emoji: "\u2600\ufe0f",     rijmt: "mag",    hint: "Luister naar het einde: -ag" },
  { woord: "boom",  emoji: "\ud83c\udf33",     rijmt: "room",   hint: "Luister naar het einde: -oom" },
  { woord: "doos",  emoji: "\ud83d\udce6",     rijmt: "roos",   hint: "Luister naar het einde: -oos" },
  { woord: "rood",  emoji: "🔴",     rijmt: "brood",  hint: "Luister naar het einde: -ood" },
  { woord: "man",   emoji: "\ud83e\uddd4",     rijmt: "pan",    hint: "Luister naar het einde: -an" },
];
