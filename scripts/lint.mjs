#!/usr/bin/env node

import { readFileSync } from "node:fs";

const workflow = ".github/workflows/shift-left.yml";
const text = readFileSync(workflow, "utf8");

if (!text.includes("workflow_call")) {
  throw new Error(`${workflow} must declare workflow_call.`);
}

console.log("Workflow lint checks passed.");