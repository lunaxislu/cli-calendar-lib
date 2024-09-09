// src/commands/init.ts
import { promises as fs } from "fs";
import path from "path";
import { Command } from "commander";
import { execa } from "execa";
import prompts from "prompts";
import { loading } from "../util/loading";
import {
  getProjectInfo,
  getTailwindConfigPath,
} from "../util/get-project-info";
import { logger } from "../util/logger";
import { getPackageInfo, readPackageJson } from "../util/get-package-info";
import inquirer from "inquirer";

const REQUIRED_DAYJS_VERSION = "^1.10.4";

export const init = new Command()
  .name("init")
  .description("Initialize your project and setup Calendar component")
  .action(async () => {
    const cwd = process.cwd();
    const spinner = loading("Detecting project info...").start();

    try {
      // 1. 프로젝트 정보를 수집
      const projectInfo = await getProjectInfo(cwd);
      if (!projectInfo) {
        return logger.error(
          "you must install packageManager : npm , pnpm or yarn",
          process.exit(1),
        );
      }

      spinner.succeed("Project info detected:");
      logger.info(JSON.stringify(projectInfo, null, 2));

      // 2. 프로젝트의 package.json 확인
      const projectPackageJson = await readPackageJson(cwd);
      const projectDependencies = projectPackageJson.dependencies || {};
      const projectDevDependencies = projectPackageJson.devDependencies || {};
      const packageManager = projectInfo.packageManager;
      const isTsx = projectInfo.isTsx;

      // 3. CSS Modules 또는 Tailwind 선택
      const { styleChoice } = await inquirer.prompt([
        {
          type: "list",
          name: "styleChoice",
          message: "Which styling solution do you want to use?",
          choices: ["CSS Modules", "Tailwind"],
        },
      ]);

      logger.info(`You chose: ${styleChoice}`);

      // 4. Tailwind 설치 여부 확인
      const isTailwindInstalled =
        "tailwindcss" in projectDependencies ||
        "tailwindcss" in projectDevDependencies;
      if (styleChoice === "Tailwind") {
        logger.info("Checking Tailwind installation...");

        if (isTailwindInstalled) {
          logger.success("Tailwind is already installed.");
        } else {
          logger.info("Tailwind is not installed. Installing Tailwind...");

          // Tailwind 설치 및 설정
          await execa(
            packageManager,
            [
              packageManager === "npm" ? "install" : "add",
              "tailwindcss",
              "postcss",
              "autoprefixer",
            ],
            { cwd, stdio: "inherit" },
          );
          logger.success("tailwind installed successfully.");
        }
        // Tailwind config 파일 확인 (확장자별로 확인)
        const tailwindConfigPath = await getTailwindConfigPath(cwd);
        if (!tailwindConfigPath) {
          logger.info("No tailwind.config file found. Creating one...");

          // Tailwind config 생성 (패키지 매니저에 맞춰 실행)
          if (packageManager === "npm") {
            await execa("npx", ["tailwindcss", "init", "-p"], {
              cwd,
              stdio: "inherit",
            });
          }
          if (packageManager === "yarn") {
            await execa("yarn", ["tailwindcss", "init", "-p"], {
              cwd,
              stdio: "inherit",
            });
          }
          if (packageManager === "pnpm") {
            await execa("pnpx", ["tailwindcss", "init", "-p"], {
              cwd,
              stdio: "inherit",
            });
          }

          logger.success("Tailwind configuration created.");
        } else {
          logger.success(`Found Tailwind configuration: ${tailwindConfigPath}`);
        }

        // Tailwind-merge 설치 확인
        const isTailwindMergeInstalled =
          "tailwind-merge" in projectDependencies ||
          "tailwind-merge" in projectDevDependencies;

        if (!isTailwindMergeInstalled) {
          logger.info("Installing tailwind-merge...");
          await execa(
            packageManager,
            [packageManager === "npm" ? "install" : "add", "tailwind-merge"],
            { cwd, stdio: "inherit" },
          );
          logger.success("tailwind-merge installed successfully.");
        } else {
          logger.success("tailwind-merge is already installed.");
        }
      }

      // 5. Day.js 설치 확인 및 업데이트
      const currentDayjsVersion = projectDependencies.dayjs;

      if (!currentDayjsVersion) {
        // Day.js가 없으면 설치
        logger.info("Day.js is not installed. Installing...");
        await execa(
          packageManager,
          [
            packageManager === "npm" ? "install" : "add",
            `dayjs@${REQUIRED_DAYJS_VERSION}`,
          ],
          { cwd, stdio: "inherit" },
        );
        logger.success(`Day.js@${REQUIRED_DAYJS_VERSION} installed.`);
      } else if (currentDayjsVersion < REQUIRED_DAYJS_VERSION) {
        // Day.js가 설치되어 있지만 버전이 낮으면 업데이트
        logger.info(
          `Day.js version is lower than required. Updating to ${REQUIRED_DAYJS_VERSION}...`,
        );
        await execa(
          packageManager,
          [
            packageManager === "npm" ? "install" : "add",
            `dayjs@${REQUIRED_DAYJS_VERSION}`,
          ],
          { cwd, stdio: "inherit" },
        );
        logger.success(`Day.js updated to ${REQUIRED_DAYJS_VERSION}.`);
      } else {
        logger.success("Day.js is up to date.");
      }

      // 6. TypeScript 프로젝트일 경우 CSS 모듈 타입 확인 및 설치
      if (isTsx && styleChoice === "CSS Modules") {
        const devDependencies = projectPackageJson.devDependencies || {};
        const isCssModulesTypesInstalled =
          devDependencies["@types/css-modules"];

        if (!isCssModulesTypesInstalled) {
          logger.info("Installing @types/css-modules for CSS Modules...");
          await execa(
            packageManager,
            [
              packageManager === "npm" ? "install" : "add",
              "--save-dev",
              "@types/css-modules",
            ],
            { cwd, stdio: "inherit" },
          );
          logger.success("@types/css-modules installed.");
        } else {
          logger.success("@types/css-modules is already installed.");
        }
      }

      // clsx와 class-variance-authority 설치 여부 확인
      const isClsxInstalled =
        "clsx" in projectDependencies || "clsx" in projectDevDependencies;
      const isCvaInstalled =
        "class-variance-authority" in projectDependencies ||
        "class-variance-authority" in projectDevDependencies;

      if (!isClsxInstalled) {
        logger.info("Installing clsx...");
        await execa(
          packageManager,
          [packageManager === "npm" ? "install" : "add", "clsx"],
          { cwd, stdio: "inherit" },
        );
        logger.success("clsx installed successfully.");
      } else {
        logger.success("clsx is already installed.");
      }

      if (!isCvaInstalled) {
        logger.info("Installing class-variance-authority...");
        await execa(
          packageManager,
          [
            packageManager === "npm" ? "install" : "add",
            "class-variance-authority",
          ],
          { cwd, stdio: "inherit" },
        );
        logger.success("class-variance-authority installed successfully.");
      } else {
        logger.success("class-variance-authority is already installed.");
      }

      // 7. module.json 파일 생성 또는 덮어쓰기 여부 확인
      const moduleJsonPath = path.resolve(cwd, "module.json");

      const fileExists = await fs
        .access(moduleJsonPath)
        .then(() => true)
        .catch(() => false);

      let overwrite = true; // 기본값은 덮어쓰기 허용

      if (fileExists) {
        const response = await inquirer.prompt({
          type: "confirm",
          name: "overwrite",
          message: "module.json already exists. Do you want to overwrite it?",
          default: true,
        });

        overwrite = response.overwrite;
      }

      if (!overwrite) {
        logger.info("module.json file was not overwritten.");
        return logger.info("Execution terminated.");
      }

      /**
       * module.json write
       */
      const packageInfo = getPackageInfo();
      // isTsx 값에 따라 'javascript' 또는 'typescript' 폴더를 선택
      const languageFolder = isTsx ? "typescript" : "javascript";
      // styleType 값에 따라 'calendar-css-module' 또는 'calendar-tw' 폴더를 선택
      const styleFolder =
        styleChoice === "CSS Modules" ? "calendar-css-module" : "calendar-tw";

      // pathResolve 경로 동적으로 생성
      const pathResolve = `https://github.com/lunaxislu/cli-calendar-lib/tree/main/src/components/${languageFolder}/${styleFolder}`;

      // 6. module.json 파일 생성
      const moduleJson = {
        name: "Calendar",
        version: packageInfo.version || "1.0.0",
        description: "A customizable calendar component using Day.js",
        packageManager: projectInfo.packageManager,
        isSrcDir: projectInfo.isSrcDir,
        isTsx: isTsx,
        isNext: projectInfo.isNext,
        isUsingAppDir: projectInfo.isUsingAppDir,
        styleType: styleChoice,
        pathResolve: pathResolve,
      };

      await fs.writeFile(
        moduleJsonPath,
        JSON.stringify(moduleJson, null, 2),
        "utf8",
      );
      logger.success(`module.json has been created at ${moduleJsonPath}`);
    } catch (error) {
      spinner.fail("Failed to initialize the project");
      logger.error("Failed to initialize the project");
    }
  });
