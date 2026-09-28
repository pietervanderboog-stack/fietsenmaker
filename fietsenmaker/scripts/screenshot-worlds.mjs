// Screenshots every world (and optionally games) in a headless browser,
// with hitboxes drawn via ?debug=1.
// Usage: npm run shots                 → debug/world-*.png
//        npm run shots -- theater dino_maten   → also debug/game-*.png
// At 480×700 the camera shows the whole world at scale 1.
import { createServer } from "vite";
import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "debug");
fs.mkdirSync(out, { recursive: true });

const { WORLDS } = await import(new URL("../src/data/worlds.js", import.meta.url).href);
const games = process.argv.slice(2);

const server = await createServer({ root, logLevel: "error", server: { port: 5199 } });
await server.listen();
const base = server.resolvedUrls.local[0];

// Prefer the locally installed Chrome so no browser download is needed
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 480, height: 700 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

for (const id of Object.keys(WORLDS)) {
  await page.goto(`${base}?debug=1&world=${id}`);
  await page.waitForTimeout(1200);
  const file = path.join(out, `world-${id}.png`);
  await page.screenshot({ path: file });
  console.log(`✓ ${path.relative(root, file)}`);
}

await page.setViewportSize({ width: 820, height: 1180 }); // tablet portrait
for (const g of games) {
  await page.goto(`${base}?game=${g}`);
  await page.waitForTimeout(1200);
  const file = path.join(out, `game-${g}.png`);
  await page.screenshot({ path: file });
  console.log(`✓ ${path.relative(root, file)}`);
}

await browser.close();
await server.close();

if (errors.length) {
  console.log("\nPage errors:\n  " + errors.join("\n  "));
  process.exit(1);
}
