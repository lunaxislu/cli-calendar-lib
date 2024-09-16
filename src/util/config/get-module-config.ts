import { cosmiconfig } from "cosmiconfig";
import { logger } from "../logger";
import { highlighter } from "../color";
const DEFAULT_MODULE = "module.json";
const explorerModule = cosmiconfig(DEFAULT_MODULE);
// 탐색기를 설정해 ESLint 설정 파일을 찾음
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
    const result = await explorerModule.search();
    if (!result) {
      throw `Please Init. \n ${highlighter.error(`cli-calendar init`)}`;
    }

    const config = result.config;

    return config;
  } catch (err) {
    logger.error("not found module.json");
    throw new Error(`${err}`);
  }
}
