import path from "path";
import { loadConfig } from "tsconfig-paths";
import fs from "fs-extra";
import fg from "fast-glob";
import { getPackageManager } from "./get-package-manager";
import { Framework, FRAMEWORKS } from "./frameworks";
import { JsonValue } from "type-fest";
export type ProjectType = {
  framework: Framework;
  isUsingAppDir: boolean;
  isSrcDir: boolean;
  isTsx: boolean;
  configFiles: string[];
  packageManager: "yarn" | "pnpm" | "bun" | "npm";
};
const PROJECT_SHARED_IGNORE = [
  "**/node_modules/**",
  ".next",
  "public",
  "dist",
  "build",
];

export async function getTsConfigAliasPrefix(cwd: string) {
  const tsConfig = loadConfig(cwd);

  if (tsConfig?.resultType === "failed" || !tsConfig?.paths) {
    return null;
  }
  // This assume that the first alias is the prefix.
  for (const [alias, paths] of Object.entries(tsConfig.paths)) {
    if (
      paths.includes("./*") ||
      paths.includes("./src/*") ||
      paths.includes("./app/*") ||
      paths.includes("./resources/js/*") // Laravel.
    ) {
      return alias.at(0) ?? null;
    }
  }

  return null;
}
export async function getProjectInfo(cwd: string) {
  const [isSrcDir, isTsx, configFiles, packageManager] = await Promise.all([
    fs.pathExists(path.resolve(cwd, "src")),
    isTypeScriptProject(cwd),
    fg.glob("next.config.*", {
      cwd,
      deep: 1,
    }),
    getPackageManager(cwd),
  ]);

  const isNext = configFiles.length > 0;
  const projectType: ProjectType = {
    framework: FRAMEWORKS["react.js"],
    isUsingAppDir: false,
    isSrcDir,
    isTsx,
    configFiles,
    packageManager,
  };

  if (isNext) {
    projectType.isUsingAppDir = await fs.pathExists(
      path.resolve(cwd, `${isSrcDir ? "src/" : ""}app`)
    );
    projectType.framework = projectType.isUsingAppDir
      ? FRAMEWORKS["next-app"]
      : FRAMEWORKS["next-pages"];
  }
  const resolveConfig = {
    ...projectType,
    ...projectType.framework,
  };

  return resolveConfig;
}
export async function isTypeScriptProject(cwd: string) {
  // vite는 tsconfig가 3개임
  const files = await fg.glob("tsconfig.*", {
    cwd,
    deep: 1,
    ignore: PROJECT_SHARED_IGNORE,
  });

  return files.length > 0;
}

export async function getTsConfig() {
  try {
    const tsconfigPath = path.join("tsconfig.json");
    const tsconfig = await fs.readJSON(tsconfigPath);

    if (!tsconfig) {
      throw new Error("tsconfig.json is missing");
    }

    return tsconfig;
  } catch (error) {
    return null;
  }
}

export async function getTailwindConfigPath(cwd: string) {
  const configFiles = await fg(["tailwind.config.*"], {
    cwd,
    deep: 1,
    ignore: PROJECT_SHARED_IGNORE,
  });

  if (configFiles.length > 0) {
    return path.resolve(cwd, configFiles[0]);
  }

  return null;
}
