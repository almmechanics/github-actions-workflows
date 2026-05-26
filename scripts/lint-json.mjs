#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const jsonFiles = collectJson(root);

for (const file of jsonFiles) {
  JSON.parse(readFileSync(file, "utf8"));
}

console.log(`Validated ${jsonFiles.length} JSON files.`);

function collectJson(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if ([".git", "node_modules", "dist", "reports"].includes(entry)) {
      continue;
    }
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...collectJson(full));
      continue;
    }
    if (entry.endsWith(".json")) {
      out.push(full);
    }
  }
  return out;
}