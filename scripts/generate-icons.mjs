/**
 * Generates PWA icon PNGs from icon.svg using the canvas API in Node.
 * Run: node scripts/generate-icons.mjs
 *
 * Since we don't have sharp/canvas in Node, we use a simpler approach:
 * Create proper sized SVGs that browsers will accept.
 */
import { writeFileSync, readFileSync } from "fs";

const svgSource = readFileSync("public/icon.svg", "utf-8");

const sizes = [192, 512];

for (const size of sizes) {
  const svg = svgSource
    .replace('viewBox="0 0 512 512"', `viewBox="0 0 512 512" width="${size}" height="${size}"`);
  writeFileSync(`public/icon-${size}.svg`, svg);
  console.log(`Created public/icon-${size}.svg`);
}
