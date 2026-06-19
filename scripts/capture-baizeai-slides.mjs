import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const url = "https://baizeai.github.io/talks/2025-06-11-kubecon-hk/#/1";
const outDir = join(process.cwd(), "output", "playwright", "baizeai-kubecon-hk");

async function waitForSlidev(page) {
  await page.waitForFunction(() => {
    return document.body?.innerText?.includes(" / ") && location.hash.startsWith("#/");
  }, null, { timeout: 30000 });
}

async function getSlideInfo(page) {
  return page.evaluate(() => {
    const text = document.body.innerText;
    const match = text.match(/(\d+)\s*\/\s*(\d+)/);
    const total = match ? Number(match[2]) : null;
    const current = Number(location.hash.match(/^#\/(\d+)/)?.[1] ?? match?.[1] ?? 1);
    const title = document.querySelector("h1,h2,h3")?.textContent?.trim().replace(/\s+/g, " ") || null;
    return { current, total, title };
  });
}

async function goToSlide(page, index) {
  await page.goto(`https://baizeai.github.io/talks/2025-06-11-kubecon-hk/#/${index}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await waitForSlidev(page);
  await page.waitForTimeout(500);
}

async function showAllClicksAndCapture(page, index, filePath) {
  await goToSlide(page, index);
  let info = await getSlideInfo(page);
  let finalTitle = info.title;
  await page.screenshot({ path: filePath, fullPage: false });

  for (let click = 0; click < 80; click += 1) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(180);
    info = await getSlideInfo(page);
    const stillSameSlide = info.current === index;
    if (!stillSameSlide) break;
    finalTitle = info.title || finalTitle;
    await page.screenshot({ path: filePath, fullPage: false });
  }

  return finalTitle;
}

function safeName(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

try {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await waitForSlidev(page);

  const firstInfo = await getSlideInfo(page);
  const total = firstInfo.total;
  if (!total) throw new Error("Could not determine Slidev slide count.");

  const manifest = [];

  for (let index = 1; index <= total; index += 1) {
    const tempName = `${String(index).padStart(2, "0")}.png`;
    const tempPath = join(outDir, tempName);
    const title = await showAllClicksAndCapture(page, index, tempPath);
    const suffix = safeName(title);
    const fileName =
      `${String(index).padStart(2, "0")}` +
      `${suffix ? `-${suffix}` : ""}.png`;
    const filePath = join(outDir, fileName);
    if (filePath !== tempPath) {
      await import("node:fs/promises").then(({ rename }) => rename(tempPath, filePath));
    }
    manifest.push({
      file: fileName,
      title,
      index,
    });
    console.log(`captured ${fileName}`);
  }

  await writeFile(
    join(outDir, "manifest.json"),
    JSON.stringify({ url, capturedAt: new Date().toISOString(), count: manifest.length, slides: manifest }, null, 2),
    "utf8",
  );
  console.log(`done: ${outDir}`);
} finally {
  await browser.close();
}
