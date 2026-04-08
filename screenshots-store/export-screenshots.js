const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const LOCALES = [
  "en", "zh-Hans", "zh-Hant", "ja", "ko", "de", "fr", "es", "ru", "it", "ar", "id",
];
const SLIDES = ["life", "wisdom", "settings", "paywall"];
const WIDTH = 1290;
const HEIGHT = 2796;
const BASE_URL = "http://localhost:3000";
const OUTPUT_BASE = path.resolve(__dirname, "..", "app-store", "screenshots");

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  let total = 0;
  for (const locale of LOCALES) {
    const outDir = path.join(OUTPUT_BASE, locale, "iphone-67");
    fs.mkdirSync(outDir, { recursive: true });

    for (let i = 0; i < SLIDES.length; i++) {
      const slide = SLIDES[i];
      const url = `${BASE_URL}/export?locale=${locale}&slide=${slide}`;
      await page.goto(url, { waitUntil: "networkidle" });
      // Wait a bit for fonts to load
      await page.waitForTimeout(500);

      const outPath = path.join(outDir, `${i + 1}_${slide}.png`);
      await page.screenshot({ path: outPath, type: "png" });
      total++;
      console.log(`[${total}/${LOCALES.length * SLIDES.length}] ${locale}/${slide} -> ${outPath}`);
    }
  }

  await browser.close();
  console.log(`\nDone! ${total} screenshots exported to ${OUTPUT_BASE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
