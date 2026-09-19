#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

const removedPaths = [
  "src/pages/terminal",
  "src/pages/admin/exec.tsx",
  "src/pages/admin/settings/xtermjs.tsx",
  "src/hooks/useRemoteControlClients.ts",
  "src/hooks/useXtermjsSettings.ts",
  "src/contexts/CommandClipboardContext.tsx",
  "src/contexts/TerminalContext.tsx",
];

for (const relative of removedPaths) {
  const target = path.join(root, relative);
  const exists = fs.existsSync(target);
  const containsFiles = exists && fs.statSync(target).isDirectory()
    ? fs.readdirSync(target).length > 0
    : exists;
  if (containsFiles) {
    errors.push(`removed path exists: ${relative}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
for (const dependency of [
  "@monaco-editor/react",
  "@xterm/addon-fit",
  "@xterm/addon-search",
  "@xterm/addon-web-links",
  "@xterm/xterm",
  "@zxing/text-encoding",
  "chardet",
  "monaco-editor",
]) {
  if (dependency in dependencies) {
    errors.push(`removed dependency exists: ${dependency}`);
  }
}

const forbiddenSource = [
  "/admin/exec",
  "/admin/settings/xtermjs",
  "/api/admin/task",
  "/terminal?uuid=",
  "admin:file",
  "--disable-web-ssh",
  "--enable-remote-control",
  "remote_control_known",
  "@xterm/",
  "monaco-editor",
];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "locales") walk(full);
      continue;
    }
    if (!/\.(?:ts|tsx|css|json)$/.test(entry.name)) continue;
    const source = fs.readFileSync(full, "utf8");
    for (const token of forbiddenSource) {
      if (source.includes(token)) {
        errors.push(`${path.relative(root, full)} contains removed token ${JSON.stringify(token)}`);
      }
    }
  }
}
walk(path.join(root, "src"));

const menu = JSON.parse(fs.readFileSync(path.join(root, "src/config/menuConfig.json"), "utf8"));
const menuText = JSON.stringify(menu);
for (const route of ["/terminal", "/admin/exec", "/admin/settings/xtermjs"]) {
  if (menuText.includes(route)) errors.push(`menu contains removed route: ${route}`);
}

const localeDir = path.join(root, "src/i18n/locales");
for (const name of fs.readdirSync(localeDir).filter((name) => name.endsWith(".json"))) {
  const locale = JSON.parse(fs.readFileSync(path.join(localeDir, name), "utf8"));
  for (const key of ["exec", "file_manager", "terminal"]) {
    if (key in locale) errors.push(`${name} contains removed top-level key: ${key}`);
  }
  if (locale.operations?.workbench !== undefined) errors.push(`${name} contains operations.workbench`);
  if (locale.settings?.xtermjs !== undefined) errors.push(`${name} contains settings.xtermjs`);
  if (locale.admin?.nodeTable?.disableWebSsh !== undefined) errors.push(`${name} contains disableWebSsh`);
  if (locale.admin?.nodeTable?.enableRemoteControl !== undefined) errors.push(`${name} contains enableRemoteControl`);
}

const viteConfig = fs.readFileSync(path.join(root, "vite.config.ts"), "utf8");
if (!viteConfig.includes("/^\\/terminal(?:\\/|$)/")) {
  errors.push("vite.config.ts must keep /terminal in the navigation denylist so Server can return 410");
}

if (errors.length > 0) {
  console.error("remote-control UI removal guard: FAIL");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log("remote-control UI removal guard: OK");
