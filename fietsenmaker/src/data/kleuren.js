export const VERFPOTTEN = [
  { id: "rood", naam: "rood", kleur: "#e74c3c" },
  { id: "geel", naam: "geel", kleur: "#f1c40f" },
  { id: "blauw", naam: "blauw", kleur: "#3498db" },
  { id: "wit", naam: "wit", kleur: "#f0f0f0" },
];

export function getPot(id) {
  return VERFPOTTEN.find((v) => v.id === id);
}

/**
 * 6 rondes, oplopend in moeilijkheid:
 * 1-3: primaire → secundaire kleuren (klassieke mix)
 * 4-6: mengen met wit (lichtere tinten)
 */
export const RONDES = [
  { doel: "oranje", kleur: "#FF9F43", mix: ["rood", "geel"] },
  { doel: "groen", kleur: "#27ae60", mix: ["blauw", "geel"] },
  { doel: "paars", kleur: "#8e44ad", mix: ["rood", "blauw"] },
  { doel: "roze", kleur: "#fd79a8", mix: ["rood", "wit"] },
  { doel: "lichtblauw", kleur: "#74b9ff", mix: ["blauw", "wit"] },
  { doel: "lichtgeel", kleur: "#ffeaa7", mix: ["geel", "wit"] },
];

// What two pots really make — every pair of the 4 pots is one of the rondes
export function mixResult(a, b) {
  return RONDES.find((r) => r.mix.includes(a) && r.mix.includes(b) && a !== b) || null;
}
