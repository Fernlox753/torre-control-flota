import { build } from "esbuild";
await build({
  entryPoints: ["src/app.js", "src/viewer.js"],
  bundle: true,
  splitting: true,
  format: "esm",
  outdir: "assets/build",
  target: ["chrome110", "firefox115", "safari16"],
  minify: true,
  legalComments: "eof",
});
console.log("Plataforma reconstruida en assets/build/");
await import("./build-relato.mjs");
