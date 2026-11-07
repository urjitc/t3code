#!/usr/bin/env node
// @effect-diagnostics nodeBuiltinImport:off globalConsole:off - A tiny build-time asset script; plain Node keeps it readable.
// Renders assets/app-icon/icon.png (a full-bleed square) into every icon file the desktop, web, and installer
// builds read, for all three brands (prod, nightly, dev). Needs `rsvg-convert` (brew install librsvg).
// Usage: pnpm icons:app

import * as NodeChildProcess from "node:child_process";
import * as NodeFS from "node:fs";

import { BRAND_ASSET_PATHS, DEVELOPMENT_PUBLIC_ICON_OVERRIDES } from "./lib/brand-assets.ts";
import { encodePngIco, WINDOWS_ICON_SIZES } from "./lib/icon-export.ts";

const png = NodeFS.readFileSync("assets/app-icon/icon.png").toString("base64");
const inner = `<image width="1024" height="1024" href="data:image/png;base64,${png}"/>`;
const source = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${inner}</svg>`;

// Classic macOS safe area: 824px rounded body inset 100px, with a soft drop shadow.
const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <clipPath id="body"><rect x="100" y="100" width="824" height="824" rx="185"/></clipPath>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect x="100" y="100" width="824" height="824" rx="185" fill="#050304" filter="url(#shadow)"/>
  <g clip-path="url(#body)">
    <svg x="100" y="100" width="824" height="824" viewBox="0 0 1024 1024">${inner}</svg>
  </g>
</svg>`;

const render = (svg: string, size: number): Buffer =>
  NodeChildProcess.execFileSync("rsvg-convert", ["-w", String(size), "-h", String(size)], {
    input: svg,
  });

const ico = (svg: string, sizes: readonly number[]): Buffer =>
  encodePngIco(sizes.map((size) => ({ size, contents: render(svg, size) })));

const write = (path: string, contents: Buffer) => {
  NodeFS.writeFileSync(path, contents);
  console.log(`wrote ${path}`);
};

for (const [key, path] of Object.entries(BRAND_ASSET_PATHS)) {
  if (key.endsWith("IconComposerProject")) continue;
  if (key.endsWith("IosIconPng") || key.endsWith("AppleTouchIconPng")) {
    write(path, render(source, key.endsWith("AppleTouchIconPng") ? 180 : 1024));
  } else if (key.endsWith("Favicon16Png")) {
    write(path, render(source, 16));
  } else if (key.endsWith("Favicon32Png")) {
    write(path, render(source, 32));
  } else if (key.endsWith("WebFaviconIco")) {
    write(path, ico(source, [16, 32, 48]));
  } else if (key.endsWith("WindowsIconIco")) {
    write(path, ico(rounded, WINDOWS_ICON_SIZES));
  } else {
    // macOS, Linux, universal, and desktop dev-dock icons.
    write(path, render(rounded, 1024));
  }
}

for (const { sourceRelativePath, targetRelativePath } of DEVELOPMENT_PUBLIC_ICON_OVERRIDES) {
  NodeFS.copyFileSync(sourceRelativePath, targetRelativePath);
  console.log(`copied ${targetRelativePath}`);
}
