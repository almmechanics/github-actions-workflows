#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const [, , title, outputFile, ...entries] = process.argv;

if (!title || !outputFile || entries.length === 0) {
  throw new Error("Usage: node scripts/markdown-run-report.mjs <title> <output-file> <Label=path>...");
}

function section(label, file) {
  const content = existsSync(file) ? readFileSync(file, "utf8").trim() : `Missing output file: ${file}`;
  return `## ${label}\n\n\`\`\`text\n${content || "(no output)"}\n\`\`\``;
}

const body = [`# ${title}`, "", ...entries.map((entry) => {
  const separator = entry.indexOf("=");
  if (separator === -1) {
    throw new Error(`Invalid entry: ${entry}`);
  }
  return section(entry.slice(0, separator), entry.slice(separator + 1));
})].join("\n\n");

mkdirSync(dirname(outputFile), { recursive: true });
writeFileSync(outputFile, `${body}\n`);

console.log(`Wrote ${outputFile}`);