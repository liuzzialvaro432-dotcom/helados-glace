import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

const findFile = (dir, matcher) => {
  if (!existsSync(dir)) {
    return null;
  }

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = findFile(full, matcher);
      if (nested) {
        return nested;
      }
      continue;
    }

    if (matcher(full, entry.name)) {
      return full;
    }
  }

  return null;
};

const rewriteAssetPaths = (html) =>
  html
    .replaceAll('src="/assets/', 'src="./assets/')
    .replaceAll('href="/assets/', 'href="./assets/')
    .replaceAll("src='/assets/", "src='./assets/")
    .replaceAll("href='/assets/", "href='./assets/");

mkdirSync(dist, { recursive: true });

const popupSource =
  findFile(dist, (full, name) => name === "index.html" && full.includes(`${join("popup")}`)) ||
  findFile(dist, (full, name) => name === "popup.html");

const optionsSource =
  findFile(dist, (full, name) => name === "index.html" && full.includes(`${join("options")}`)) ||
  findFile(dist, (full, name) => name === "options.html");

if (!popupSource) {
  throw new Error("popup HTML missing in dist");
}

if (!optionsSource) {
  throw new Error("options HTML missing in dist");
}

writeFileSync(resolve(dist, "popup.html"), rewriteAssetPaths(readFileSync(popupSource, "utf8")));
writeFileSync(
  resolve(dist, "options.html"),
  rewriteAssetPaths(readFileSync(optionsSource, "utf8")),
);

const nestedRoot = resolve(dist, "src");
if (existsSync(nestedRoot)) {
  rmSync(nestedRoot, { recursive: true, force: true });
}

const pdfSource = resolve(root, "Modellkatalog.pdf");
if (existsSync(pdfSource)) {
  copyFileSync(pdfSource, resolve(dist, "Modellkatalog.pdf"));
}

if (!existsSync(resolve(dist, "background.js"))) {
  throw new Error("background.js missing from dist");
}

if (!existsSync(resolve(dist, "manifest.json"))) {
  throw new Error("manifest.json missing from dist");
}

console.log("Postbuild complete: popup.html, options.html, PDF ready");
