import { cosmiconfig } from "cosmiconfig";
import { logger } from "../logger";
import { highlighter } from "../color";
import { ModuleConfig } from "@/src/cli/init";
import path from "path";
import fs from "fs-extra";

export type Config = {
  config: any;
  fileExtension: string;
  isEmpty: boolean | undefined;
  filepath: string;
};

const explorerEslint = cosmiconfig("eslint", {
  searchPlaces: [
    ".eslintrc.json",
    ".eslintrc.cjs",
    "eslint.config.js",
    ".eslint.config.js",
    "eslint.config.mjs",
    ".eslint.config.mjs",
    "eslint.config.cjs",
    ".eslint.config.cjs",
    ".eslintr.mjs",
    ".eslintrc.js",
  ],
});

export async function getModuleConfig() {
  try {
    const filepath = path.join(process.cwd(), "module.json");
    const result = await fs.readFile(filepath, "utf-8");
    if (!result) {
      throw `Please Init. \n ${highlighter.error(`cli-calendar init`)}`;
    }

    //@todo isEmpty일 때 처리
    return result;
  } catch (err) {
    logger.error("not found module.json");
    throw new Error(`${err}`);
  }
}

export async function getEslintConfig(
  config: ModuleConfig,
): Promise<Config | null> {
  if (config.isTsx) return null;
  try {
    const result = await explorerEslint.search();
    if (!result) return null;
    const filepath = result.filepath;
    const config = result.config;
    const fileExtension = path.extname(filepath);
    const isEmpty = result.isEmpty;
    return {
      config,
      filepath,
      isEmpty,
      fileExtension,
    };
  } catch (err) {
    logger.error("Cannot Resolve Eslint");
    return null;
  }
}
