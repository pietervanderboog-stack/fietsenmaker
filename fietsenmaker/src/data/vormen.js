/**
 * Game data for Vormenrit.
 * type "count"  → antwoord is a number, opties are numbers
 * type "shape"  → antwoord is a shape name string, opties are shape name strings
 */
export const VORMEN_RONDES = [
  {
    vehicleId: "fiets",
    vraag: "Hoeveel cirkels heeft de fiets?",
    antwoord: 2,
    opties: [1, 2, 3],
    hint: "Kijk naar de wielen!",
    type: "count",
  },
  {
    vehicleId: "auto",
    vraag: "Hoeveel rechthoeken heeft de auto?",
    antwoord: 2,
    opties: [1, 2, 3],
    hint: "Kijk naar de carrosserie en het dak!",
    type: "count",
  },
  {
    vehicleId: "bus",
    vraag: "Hoeveel ramen heeft de bus?",
    antwoord: 3,
    opties: [2, 3, 4],
    hint: "Tel de groene vierkantjes!",
    type: "count",
  },
  {
    vehicleId: "raket",
    vraag: "Hoeveel driehoeken heeft de raket?",
    antwoord: 3,
    opties: [1, 2, 3],
    hint: "Kijk naar de punt en de twee vleugels!",
    type: "count",
  },
  {
    vehicleId: "trein",
    vraag: "Welke vorm zijn de wielen?",
    antwoord: "cirkel",
    opties: ["cirkel", "vierkant", "driehoek"],
    hint: "Ronde vormen kunnen goed rollen!",
    type: "shape",
  },
  {
    vehicleId: "boot",
    vraag: "Welke vorm is het zeil?",
    antwoord: "driehoek",
    opties: ["rechthoek", "driehoek", "cirkel"],
    hint: "Het zeil heeft drie hoeken!",
    type: "shape",
  },
];

// Consistent shape colors used in both SVG vehicles and option buttons
export const VORM_KLEUREN = {
  cirkel: "#74b9ff",
  driehoek: "#FF9F43",
  rechthoek: "#a29bfe",
  vierkant: "#55efc4",
};
