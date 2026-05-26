#!/usr/bin/env node

import { execFileSync } from "node:child_process";

import packageJson from "../package.json" with { type: "json" };

const command = process.argv[2] || "check";
const version = packageJson.version;
const tagName = `v${version}`;

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error(`package.json version must be valid semver. Received: ${version}`);
}

if (!["check", "tag"].includes(command)) {
  throw new Error("Usage: node scripts/version-tag.mjs <check|tag>");
}

const currentSha = git(["rev-parse", "HEAD"]);
const remoteSha = remoteTagSha(tagName);

if (remoteSha && remoteSha !== currentSha) {
  throw new Error(`${tagName} already exists at ${remoteSha}, but this commit is ${currentSha}. Bump package.json version before merging.`);
}

if (command === "check") {
  console.log(remoteSha ? `${tagName} already points at this commit: ${currentSha}` : `${tagName} is available for ${currentSha}`);
  process.exit(0);
}

if (remoteSha === currentSha) {
  console.log(`${tagName} already exists for ${currentSha}; no tag push needed.`);
  process.exit(0);
}

git(["tag", tagName, currentSha], { stdio: "inherit" });
git(["push", "origin", `refs/tags/${tagName}`], { stdio: "inherit" });
console.log(`Created ${tagName} for ${currentSha}`);

function remoteTagSha(tag) {
  const output = git(["ls-remote", "--tags", "origin", `refs/tags/${tag}`, `refs/tags/${tag}^{}`]);
  const lines = output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const peeled = lines.find((line) => line.endsWith(`refs/tags/${tag}^{}`));
  const direct = lines.find((line) => line.endsWith(`refs/tags/${tag}`));
  const match = peeled || direct;
  return match ? match.split(/\s+/)[0] : null;
}

function git(args, options = {}) {
  return execFileSync("git", args, { encoding: "utf8", ...options }).trim();
}