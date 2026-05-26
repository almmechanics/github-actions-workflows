#!/usr/bin/env node

import { existsSync } from "node:fs";

const required = [
  ".github/workflows/shift-left.yml",
  ".github/workflows/shift-left-ci.yml",
  "README.md",
  "package.json"
];

for (const file of required) {
  if (!existsSync(file)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

console.log("Sanity checks passed.");