#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const [, , tapFile, junitFile, markdownFile] = process.argv;

if (!tapFile || !junitFile || !markdownFile) {
  throw new Error("Usage: node scripts/tap-report.mjs <tap-file> <junit-file> <markdown-file>");
}

const tap = readFileSync(tapFile, "utf8");
const tests = [...tap.matchAll(/^(ok|not ok) \d+ - (.+)$/gm)].map((match) => ({
  status: match[1],
  name: match[2].trim()
}));

const summary = Object.fromEntries(
  [...tap.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo|duration_ms) (.+)$/gm)].map((match) => [match[1], match[2]])
);

const failed = tests.filter((test) => test.status === "not ok");
const durationSeconds = Number.parseFloat(summary.duration_ms || "0") / 1000;

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const cases = tests
  .map((test) => {
    const failure = test.status === "not ok" ? "\n    <failure message=\"Test failed\" />" : "";
    return `  <testcase classname=\"node.test\" name=\"${xmlEscape(test.name)}\">${failure}\n  </testcase>`;
  })
  .join("\n");

const junit = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<testsuite name=\"node-unit-tests\" tests=\"${tests.length}\" failures=\"${failed.length}\" skipped=\"${summary.skipped || 0}\" time=\"${durationSeconds.toFixed(3)}\">
${cases}
</testsuite>
`;

const markdown = `# Unit Test Report

| Metric | Count |
|---|---:|
| Tests | ${summary.tests || tests.length} |
| Passed | ${summary.pass || 0} |
| Failed | ${summary.fail || failed.length} |
| Skipped | ${summary.skipped || 0} |
| Duration ms | ${summary.duration_ms || 0} |

## Test Cases

${tests.map((test) => `- ${test.status === "ok" ? "PASS" : "FAIL"}: ${test.name}`).join("\n")}
`;

mkdirSync(dirname(junitFile), { recursive: true });
mkdirSync(dirname(markdownFile), { recursive: true });
writeFileSync(junitFile, junit);
writeFileSync(markdownFile, markdown);

console.log(`Wrote ${junitFile}`);
console.log(`Wrote ${markdownFile}`);