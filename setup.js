// @ts-check
import { execSync } from "node:child_process";
import fs from "node:fs";

const pkgName = "remix-development-tools";
const encoding = "utf-8";
const pkgJsonPath = new URL("./package.json", import.meta.url);

function loadPkgJson() {
  return JSON.parse(fs.readFileSync(pkgJsonPath, { encoding }));
}
function writePkgJson(json) {
  const content = JSON.stringify(json, null, 2);
  fs.writeFileSync(pkgJsonPath, content, { encoding });
}

const pkgJson = loadPkgJson();
const currentVersion = pkgJson?.version.trim();
const newVersion = execSync(`npm view ${pkgName} version`, { encoding }).trim();

if (newVersion !== currentVersion) {
  console.log("New version available:", newVersion);
  pkgJson.version = newVersion;
  pkgJson.dependencies[pkgName] = newVersion;
  writePkgJson(pkgJson);
}
