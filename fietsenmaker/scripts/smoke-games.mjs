// Monkey test: opens each game headless and taps random buttons/shapes
// until the done screen ("Klaar!") appears. Reports crashes and games that
// never finish.  Usage: npm run smoke [-- gameId ...]
import { createServer } from "vite";
import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = fs.readFileSync(path.join(root, "src/App.jsx"), "utf8");
const all = [...app.matchAll(/screen === "([a-z_]+)"/g)].map((m) => m[1]).filter((g) => g !== "home" && g !== "garage");
const games = process.argv.slice(2).length ? process.argv.slice(2) : all;

const MAX_TAPS = 1500;
// Maze and sliding puzzle can't be solved by random taps; they only get a crash check
const NO_FINISH = new Set(["farm_doolhof", "space_puzzel"]);

const server = await createServer({ root, logLevel: "error", server: { port: 5197 } });
await server.listen();
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());

let failed = 0;
for (const g of games) {
  const context = await browser.newContext({ viewport: { width: 820, height: 1180 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("crash", () => errors.push("page crashed"));
  await page.addInitScript(() => { speechSynthesis.speak = () => {}; });
  await page.goto(`${base}?game=${g}`);
  await page.waitForTimeout(500);

  let taps = 0;
  let finished = false;
  while (taps < MAX_TAPS && !errors.length) {
    try {
    // Pick and tap a random target inside the page — one round-trip per tap
    const state = await page.evaluate(() => {
      if ([...document.querySelectorAll("h2")].some((h) => h.textContent.trim() === "Klaar!")) return "done";
      if (!document.querySelector("#root")?.textContent.trim()) return "blank";
      const targets = [
        ...document.querySelectorAll('button:not([disabled]):not([aria-label="Lees voor"])'),
        ...document.querySelectorAll('svg path[style*="pointer"]'),
      ].filter((el) => !el.textContent.includes("Terug"));
      if (!targets.length) return "wait";
      const el = targets[Math.floor(Math.random() * targets.length)];
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      return "tap";
    });
    if (state === "done") { finished = true; break; }
    if (state === "blank") { errors.push("blank page (component rendered nothing)"); break; }
    taps++;
    await page.waitForTimeout(state === "wait" ? 200 : 40);
    } catch (e) {
      errors.push(e.message.split("\n")[0]);
    }
  }

  const ok = !errors.length && (finished || NO_FINISH.has(g));
  if (!ok) failed++;
  const status = errors.length ? `CRASH: ${errors[0]}` : finished ? `done after ${taps} taps` : NO_FINISH.has(g) ? "no crash (not finishable by random taps)" : `NOT FINISHED after ${taps} taps`;
  console.log(`${ok ? "✓" : "✗"} ${g.padEnd(20)} ${status}`);
  await context.close();
}

await browser.close();
await server.close();
process.exit(failed ? 1 : 0);
