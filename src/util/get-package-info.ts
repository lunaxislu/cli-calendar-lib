import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { type PackageJson } from "type-fest";

export function getPackageInfo(): PackageJson {
  const packageJsonPath = path.join(process.cwd(), "package.json");

  return fs.readJSONSync(packageJsonPath);
}

export async function readPackageJson(cwd: string): Promise<PackageJson> {
  const packageJsonPath = path.join(cwd, "package.json");
  return fs.readJSON(packageJsonPath);
}
