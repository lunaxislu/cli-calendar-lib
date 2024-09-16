import { ModuleConfig } from "@/src/cli/init";
import { cosmiconfig, CosmiconfigResult } from "cosmiconfig";
import { logger } from "../logger";
import path from "path";

// 탐색기를 설정해 ESLint 설정 파일을 찾음
const explorer = cosmiconfig("eslint", {
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
export type Config = {
  config: any;
  fileExtension: string;
  isEmpty: boolean | undefined;
  filepath: string;
};
export async function getEslintConfig(
  config: ModuleConfig,
): Promise<Config | null> {
  if (config.isTsx) return null;
  try {
    const result = await explorer.search();
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
