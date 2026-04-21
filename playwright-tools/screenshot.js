const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function main() {
  const url = process.argv[2] || "https://example.com";
  const outputDir = path.join(__dirname, "screenshots");
  const fileName = `screenshot-${Date.now()}.png`;
  const outputPath = path.join(outputDir, fileName);

  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 2200 } });

  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.screenshot({ path: outputPath, fullPage: true });

  await browser.close();

  console.log(`Saved screenshot to: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
