import * as esbuild from "esbuild";
import { mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes("--watch");
const isProd = process.argv.includes("--prod");

const SRC = resolve(__dirname, "extension-src");
const OUT = resolve(__dirname, "extension");

/* ── Entry points ─────────────────────────────────────────────── */
const entryPoints = {
  content:          resolve(SRC, "content/index.js"),
  crypto:           resolve(SRC, "crypto/index.js"),
  bridge:           resolve(SRC, "bridge/index.js"),
  popup:            resolve(SRC, "popup/index.js"),
  "rejet-detector": resolve(SRC, "rejet-detector/index.js"),
  background:       resolve(SRC, "background/index.js"),
  "erp-bridge":     resolve(SRC, "erp-bridge/index.js"),
};

/* ── Build options ────────────────────────────────────────────── */
const buildOptions = {
  entryPoints,
  bundle: true,
  format: "iife",
  outdir: OUT,
  minify: isProd,
  sourcemap: isProd ? "external" : "inline",
  target: ["chrome120"],
  logLevel: "info",
};

/* ── Ensure output directory exists ───────────────────────────── */
/* Static assets (manifest.json, popup.html, content.css, icons/) */
/* already live in extension/ — no copy needed.                    */
function ensureOutDir() {
  mkdirSync(OUT, { recursive: true });
}

/* ── Main ─────────────────────────────────────────────────────── */
async function main() {
  ensureOutDir();

  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log("👀 Watching extension-src/ for changes...");
  } else {
    await esbuild.build(buildOptions);
    console.log("✅ Extension built to extension/");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
