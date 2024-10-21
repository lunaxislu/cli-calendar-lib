import { readPackageJson } from "./get-package-info";
import { logger } from "./logger";

export async function getCompatibleInfo(cwd: string) {
  try {
    const projectPackageJSON = await readPackageJson(cwd);

    const dependencies = {
      ...projectPackageJSON.dependencies,
      ...projectPackageJSON.devDependencies,
    };

    const isReactProject = !!dependencies["react"];
    const isNextProject = !!dependencies["next"];

    if (!isNextProject && !isReactProject)
      throw new Error(
        "Incompatible project: The project must be either a React or Next.js project."
      );
    return {
      projectPackageJSON,
    };
  } catch (err) {
    logger.error("something wrong :", err);
    throw err;
  }
}
