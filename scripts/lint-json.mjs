#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const excludedDirs = new Set([".git", "dist", "node_modules", "reports"]);
const files = listJsonFiles(root);

let failures = 0;

files.forEach((file) => {
  try {
    JSON.parse(readFileSync(file, "utf8"));
    console.log(`ok ${relative(root, file)}`);
  } catch (error) {
    failures += 1;
    console.error(`not ok ${relative(root, file)}: ${error.message}`);
  }
});

if (failures > 0) {
  throw new Error(`${failures} JSON file${failures === 1 ? "" : "s"} failed validation.`);
}

function listJsonFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!excludedDirs.has(entry.name)) {
        files.push(...listJsonFiles(fullPath));
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files;
}