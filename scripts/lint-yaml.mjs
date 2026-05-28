#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parseDocument } from "yaml";

const root = process.cwd();
const excludedDirs = new Set([".git", "dist", "node_modules", "reports"]);
const files = listYamlFiles(root);

let failures = 0;

files.forEach((file) => {
  const document = parseDocument(readFileSync(file, "utf8"), { prettyErrors: true });
  const errors = [...document.errors, ...document.warnings];

  if (errors.length === 0) {
    console.log(`ok ${relative(root, file)}`);
    return;
  }

  failures += 1;
  console.error(`not ok ${relative(root, file)}`);
  errors.forEach((error) => console.error(error.message));
});

if (failures > 0) {
  throw new Error(`${failures} YAML file${failures === 1 ? "" : "s"} failed validation.`);
}

function listYamlFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!excludedDirs.has(entry.name)) {
        files.push(...listYamlFiles(fullPath));
      }
      continue;
    }

    if (entry.isFile() && (entry.name.endsWith(".yml") || entry.name.endsWith(".yaml"))) {
      files.push(fullPath);
    }
  }

  return files;
}