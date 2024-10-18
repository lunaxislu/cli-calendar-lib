import { readPackageJson } from "./get-package-info";
import semver from "semver";
import { logger } from "./logger";

const MIN_NODE_VERSION = "14.0.0";
export async function getCompatibleInfo(cwd: string) {
  try {
    const nodeVersion = process.version;
    if (!semver.satisfies(nodeVersion, `>=${MIN_NODE_VERSION}`)) {
      throw new Error(
        `Node.js version must be ${MIN_NODE_VERSION} or higher. Current version: ${nodeVersion}`,
      );
    }
    const projectPackageJSON = await readPackageJson(cwd);

    const dependencies = {
      ...projectPackageJSON.dependencies,
      ...projectPackageJSON.devDependencies,
    };

    const isReactProject = !!dependencies["react"];
    const isNextProject = !!dependencies["next"];

    if (!isNextProject && !isReactProject)
      throw new Error(
        "Incompatible project: The project must be either a React or Next.js project.",
      );
    return {
      projectPackageJSON,
    };
  } catch (err) {
    logger.error("something wrong :", err);
    throw err;
  }
}
