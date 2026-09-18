#!/usr/bin/env node
import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const viteConfigPath = path.join(root, "vite.config.ts");
const swPath = path.join(root, "dist", "sw.js");

const requiredDenylist = [
  "/admin",
  "/terminal",
  "/manage",
  "/install",
  "/database-recovery",
];

const forbiddenAllowlist = [
  "/admin",
  "/terminal",
  "/manage",
  "/install",
  "/database-recovery",
];

function extractArrayBlock(source, name) {
  const match = source.match(
    new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`),
  );
  if (!match) {
    throw new Error(`FAIL: ${name} was not found in vite.config.ts`);
  }
  return match[1];
}

function assertSourceConfig(source) {
  const allowlist = extractArrayBlock(source, "defaultThemeNavigationAllowlist");
  const denylist = extractArrayBlock(source, "defaultThemeNavigationDenylist");

  for (const route of forbiddenAllowlist) {
    if (allowlist.includes(route)) {
      throw new Error(
        `FAIL: navigateFallbackAllowlist still includes core route ${route}`,
      );
    }
  }
  for (const route of requiredDenylist) {
    if (!denylist.includes(route)) {
      throw new Error(
        `FAIL: navigateFallbackDenylist is missing core route ${route}`,
      );
    }
  }
}

function assertGeneratedSw(sw) {
  const start = sw.indexOf("NavigationRoute");
  if (start < 0) {
    throw new Error("FAIL: dist/sw.js has no NavigationRoute");
  }
  const snippet = sw.slice(start, start + 1500);
  const allowStart = snippet.indexOf("allowlist:[");
  const denyStart = snippet.indexOf("denylist:[");
  if (allowStart < 0 || denyStart < 0) {
    throw new Error("FAIL: dist/sw.js NavigationRoute is missing allowlist/denylist");
  }
  const allowlist = snippet.slice(allowStart, denyStart);
  const denylist = snippet.slice(denyStart);
  for (const route of requiredDenylist) {
    const escaped = route.replaceAll("/", "\\/");
    if (!denylist.includes(escaped) && !denylist.includes(route)) {
      throw new Error(
        `FAIL: dist/sw.js denylist does not contain ${route}: ${denylist}`,
      );
    }
  }
  for (const route of forbiddenAllowlist) {
    if (allowlist.includes(route)) {
      throw new Error(
        `FAIL: dist/sw.js allowlist still contains core route ${route}: ${allowlist}`,
      );
    }
  }
}

const source = fs.readFileSync(viteConfigPath, "utf8");
assertSourceConfig(source);
console.log("OK: vite.config.ts keeps core routes out of PWA navigation fallback");

if (fs.existsSync(swPath)) {
  assertGeneratedSw(fs.readFileSync(swPath, "utf8"));
  console.log("OK: dist/sw.js denylists core admin/terminal routes");
} else {
  console.log("SKIP: dist/sw.js is not present; source allow/deny lists were checked");
}

process.exit(0);
