import { existsSync, mkdirSync, renameSync } from "node:fs";

if (existsSync("public/_next") || existsSync("public/index.html")) {
  mkdirSync(".generated-trash", { recursive: true });
  renameSync("public", `.generated-trash/public-${Date.now()}`);
}

