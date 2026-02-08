import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const WIDTH = 1200;
const HEIGHT = 630;
const NAVY = "#1D2530";
const GOLD = "#FBCB46";
const LIGHT = "#F7F8FA";

// Read the logo SVG and resize it
const logoSvg = readFileSync(join(ROOT, "public/logo.svg"), "utf-8");
const logoBuffer = await sharp(Buffer.from(logoSvg), { density: 300 })
  .resize({ height: 180 })
  .png()
  .toBuffer();

const logoMeta = await sharp(logoBuffer).metadata();
const logoWidth = logoMeta.width ?? 267;
const logoHeight = logoMeta.height ?? 180;

// Create text overlay using SVG
const titleText = "BANANZA FLIGHTS";
const taglineText = "Search and compare flights worldwide";

const textSvg = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700');
  </style>
  <text
    x="${WIDTH / 2}"
    y="410"
    text-anchor="middle"
    font-family="Montserrat, Arial, Helvetica, sans-serif"
    font-weight="700"
    font-size="52"
    fill="${GOLD}"
    letter-spacing="4"
  >${titleText}</text>
  <text
    x="${WIDTH / 2}"
    y="470"
    text-anchor="middle"
    font-family="Montserrat, Arial, Helvetica, sans-serif"
    font-weight="400"
    font-size="28"
    fill="${LIGHT}"
  >${taglineText}</text>
</svg>`;

const textBuffer = await sharp(Buffer.from(textSvg)).png().toBuffer();

// Composite everything onto navy background
const image = sharp({
  create: {
    width: WIDTH,
    height: HEIGHT,
    channels: 4,
    background: NAVY,
  },
})
  .composite([
    {
      input: logoBuffer,
      top: Math.round(HEIGHT / 2 - logoHeight - 50),
      left: Math.round(WIDTH / 2 - logoWidth / 2),
    },
    {
      input: textBuffer,
      top: 0,
      left: 0,
    },
  ])
  .png();

const outputPath = join(ROOT, "public/og-image.png");
await image.toFile(outputPath);

const { width, height } = await sharp(outputPath).metadata();
console.log(`Generated ${outputPath} (${width}x${height})`);
