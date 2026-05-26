#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dist = "dist";
await mkdir(dist, { recursive: true });
await writeFile(join(dist, "build.txt"), `Build completed at ${new Date().toISOString()}\n`);
console.log("Built shared workflow package artifacts in dist/.");