// Sequences for DinoEi, grouped by difficulty. A session takes 2 of each,
// easy → hard. Lowercase letters (groep 3 starts with kleine letters);
// picture patterns work for kids who can't read yet.
export const REEKSEN = {
  makkelijk: [
    { reeks: [1, 2, 3], antwoord: 4, opties: [4, 5, 2, 6] },
    { reeks: [3, 4, 5], antwoord: 6, opties: [6, 7, 4, 2] },
    { reeks: [6, 7, 8], antwoord: 9, opties: [9, 10, 7, 5] },
    { reeks: ["a", "b", "c"], antwoord: "d", opties: ["d", "e", "b", "o"] },
    { reeks: ["🦴", "🥚", "🦴", "🥚"], antwoord: "🦴", opties: ["🦴", "🥚", "🌿"] },
    { reeks: ["🦖", "🦖", "🦕", "🦖", "🦖"], antwoord: "🦕", opties: ["🦕", "🦖", "🥚"] },
  ],
  middel: [
    { reeks: [5, 4, 3], antwoord: 2, opties: [2, 1, 4, 6] },
    { reeks: [10, 9, 8], antwoord: 7, opties: [7, 6, 9, 11] },
    { reeks: [2, 4, 6], antwoord: 8, opties: [8, 7, 10, 9] },
    { reeks: ["d", "e", "f"], antwoord: "g", opties: ["g", "h", "e", "b"] },
    { reeks: ["m", "n", "o"], antwoord: "p", opties: ["p", "q", "n", "u"] },
    { reeks: ["🌿", "🦕", "🦕", "🌿", "🦕"], antwoord: "🦕", opties: ["🦕", "🌿", "🦴"] },
  ],
  moeilijk: [
    { reeks: [1, 3, 5], antwoord: 7, opties: [7, 6, 9, 8] },
    { reeks: [2, 4, 6, 8], antwoord: 10, opties: [10, 9, 12, 7] },
    { reeks: [8, 6, 4], antwoord: 2, opties: [2, 3, 0, 5] },
    { reeks: [10, 20, 30], antwoord: 40, opties: [40, 31, 50, 35] },
    { reeks: ["a", "c", "e"], antwoord: "g", opties: ["g", "f", "d", "h"] },
    { reeks: ["🥚", "🐣", "🦖", "🥚", "🐣"], antwoord: "🦖", opties: ["🦖", "🥚", "🐣"] },
  ],
};
