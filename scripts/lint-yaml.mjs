#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseDocument } from "yaml";

const root = process.cwd();
const yamlFiles = collectYaml(root);

for (const file of yamlFiles) {
  const doc = parseDocument(readFileSync(file, "utf8"));
  if (doc.errors.length > 0) {
    throw new Error(`${file} has YAML parsing errors.`);
  }
}

console.log(`Validated ${yamlFiles.length} YAML files.`);

function collectYaml(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if ([".git", "node_modules", "dist", "reports"].includes(entry)) {
      continue;
    }
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...collectYaml(full));
      continue;
    }
    if (entry.endsWith(".yml") || entry.endsWith(".yaml")) {
      out.push(full);
    }
  }
  return out;
}