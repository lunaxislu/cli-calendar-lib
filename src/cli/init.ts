import { promises as fs } from "fs";
import path from "path";
import { Command } from "commander";
import { execa } from "execa";
import { loading } from "../util/loading";
import {
  addTailwindBaseToCss,
  getProjectInfo,
  getTailwindConfigPath,
  getTailwindCssFile,
  updateWithTsmorphToTailwindConfig,
} from "../util/get-project-info";
import { logger } from "../util/logger";
import { getPackageInfo, readPackageJson } from "../util/get-package-info";
import inquirer from "inquirer";
import { getCompatibleInfo } from "../util/get-compatible-info";
import { handleError } from "../util/handle-error";

export type ModuleConfig = {
  name: string;
  description: string;
  packageManager: "yarn" | "pnpm" | "bun" | "npm";
  isSrcDir: boolean;
  type: "app-router" | "pages-router" | "react";
  isTsx: boolean;
  isUsingAppDir: boolean;
  styleType: any;
  pathResolve: string;
  isRsc: boolean;
};
export const init = new Command()
  .name("init")
  .description("Initialize your project and setup Calendar component")
  .action(async () => {
    const cwd = process.cwd();
    const spinner = loading("Detecting project info...").start();
    try {
      const { projectPackageJSON } = await getCompatibleInfo(cwd);

      // 1. 프로젝트 정보를 수집
      const projectInfo = await getProjectInfo(cwd);

      if (!projectInfo) {
        return logger.error(
          "you must install packageManager : npm , pnpm or yarn",
          process.exit(1)
        );
      }

      spinner.succeed("Project info detected:");
      logger.info(JSON.stringify(projectInfo, null, 2));

      // 2. 프로젝트의 package.json 확인
      const projectDependencies = projectPackageJSON.dependencies || {};
      const projectDevDependencies = projectPackageJSON.devDependencies || {};
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

      if (styleChoice === "Tailwind") {
        // 4. Tailwind 설치 여부 확인
        const isTailwindInstalled =
          "tailwindcss" in projectDependencies ||
          "tailwindcss" in projectDevDependencies;
        logger.info("Checking Tailwind installation...");

        if (isTailwindInstalled) {
          logger.success("Tailwind is already installed.");
        }

        if (!isTailwindInstalled) {
          const tailwindSpinner = loading(
            "Tailwind is not installed. Installing Tailwind..."
          ).start();

          await execa(
            packageManager,
            [
              packageManager === "npm" ? "install" : "add",
              "tailwindcss",
              "postcss",
              "autoprefixer",
            ],
            { cwd, stdio: "inherit" }
          );
          tailwindSpinner.succeed("Tailwind installed successfully.");
        }

        // Tailwind config 파일 확인 (확장자별로 확인)
        let tailwindConfigPath = await getTailwindConfigPath(cwd);
        if (!tailwindConfigPath) {
          logger.info("No tailwind.config file found. Creating one...");
          const tailwindConfigSpinner = loading(
            "Creating Tailwind config..."
          ).start();

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
          tailwindConfigSpinner.succeed("Tailwind configuration created.");
          tailwindConfigPath = await getTailwindConfigPath(cwd);
        }

        logger.success(`Found Tailwind configuration: ${tailwindConfigPath}`);

        const contentPaths = [
          "./pages/**/*.{js,ts,jsx,tsx,mdx}",
          "./components/**/*.{js,ts,jsx,tsx,mdx}",
          "./app/**/*.{js,ts,jsx,tsx,mdx}",
        ];

        // isSrcDir 값에 따라 src 경로 또는 기본 경로 추가
        if (projectInfo.isSrcDir) {
          contentPaths.push("./src/**/*.{js,ts,jsx,tsx}");
        }

        // Tailwind 설정 파일을 업데이트하는 함수 호출
        await updateWithTsmorphToTailwindConfig(
          tailwindConfigPath,
          contentPaths
        );
        logger.success("Checked/Updated Tailwind config content.");

        //---------------

        // Tailwind-merge 설치 확인
        const isTailwindMergeInstalled =
          "tailwind-merge" in projectDependencies ||
          "tailwind-merge" in projectDevDependencies;

        if (!isTailwindMergeInstalled) {
          await execa(
            packageManager,
            [packageManager === "npm" ? "install" : "add", "tailwind-merge"],
            { cwd, stdio: "inherit" }
          );

          logger.success("tailwind-merge is already installed.");
        }
        // index.css 또는 global.css 파일에 @tailwind base 추가 확인
        const cssFilePaths = await getTailwindCssFile(cwd);

        if (cssFilePaths) {
          await addTailwindBaseToCss(cssFilePaths);
        } else {
          logger.info("No index.css or global.css found. Skipping...");
        }
      }

      // 5. Day.js 설치 확인
      const currentDayjsVersion = projectDependencies.dayjs;

      if (!currentDayjsVersion) {
        // Day.js가 없으면 설치

        logger.info("Day.js is not installed. Installing...");

        const dayjsSpinner = loading("Installing Day.js...").start();
        await execa(
          packageManager,
          [packageManager === "npm" ? "install" : "add", `dayjs`],
          { cwd, stdio: "inherit" }
        );
        dayjsSpinner.succeed("Day.js installed.");
      } else {
        logger.success("Day.js is already installed.");
      }

      // 6. TypeScript 프로젝트일 경우 CSS 모듈 타입 확인 및 설치
      if (isTsx && styleChoice === "CSS Modules") {
        const devDependencies = projectPackageJSON.devDependencies || {};
        const isCssModulesTypesInstalled =
          devDependencies["@types/css-modules"];

        if (!isCssModulesTypesInstalled) {
          logger.info("Installing @types/css-modules...");

          const installCommand =
            packageManager === "npm"
              ? ["install", "--save-dev", "@types/css-modules"]
              : ["add", "-D", "@types/css-modules"]; // yarn, pnpm 공통 처리

          await execa(packageManager, installCommand, {
            cwd,
            stdio: "inherit",
          });
          logger.success("@types/css-modules is already installed.");
        }
      }

      // clsx와 class-variance-authority 설치 여부 확인
      const isClsxInstalled =
        "clsx" in projectDependencies || "clsx" in projectDevDependencies;
      const isCvaInstalled =
        "class-variance-authority" in projectDependencies ||
        "class-variance-authority" in projectDevDependencies;

      if (!isClsxInstalled && styleChoice === "Tailwind") {
        logger.info("Installing clsx...");
        await execa(
          packageManager,
          [packageManager === "npm" ? "install" : "add", "clsx"],
          { cwd, stdio: "inherit" }
        );
        logger.success("clsx installed successfully.");
      }

      if (!isCvaInstalled) {
        logger.info("Installing class-variance-authority...");
        await execa(
          packageManager,
          [
            packageManager === "npm" ? "install" : "add",
            "class-variance-authority",
          ],
          { cwd, stdio: "inherit" }
        );
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
      const pathResolve = `https://raw.githubusercontent.com/lunaxislu/cli-calendar-lib/main/src/components/${languageFolder}/${styleFolder}`;

      // 6. module.json 파일 생성
      const moduleJson = {
        name: "Calendar",
        description: "A customizable calendar component using Day.js",
        packageManager: projectInfo.packageManager,
        isSrcDir: projectInfo.isSrcDir,
        type: projectInfo.name,
        isRsc: projectInfo.isRsc,
        isTsx: isTsx,
        isUsingAppDir: projectInfo.isUsingAppDir,
        styleType: styleChoice,
        pathResolve: pathResolve,
      };

      await fs.writeFile(
        moduleJsonPath,
        JSON.stringify(moduleJson, null, 2),
        "utf8"
      );
      logger.success(`module.json has been created at ${moduleJsonPath}`);
      logger.break();
      logger.info(`Now `);
    } catch (error) {
      spinner.fail("Failed to initialize the project");
      logger.error("Failed to initialize the project");
    }
  });
