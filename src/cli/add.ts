import fs from "fs-extra";
import path from "path";
import fetch from "node-fetch";
import AdmZip from "adm-zip";
import inquirer from "inquirer";
import { Command } from "commander";
import { logger } from "../util/logger";
import { loading } from "../util/loading";
import fg from "fast-glob";
import { getEslintConfig } from "../util/config/get-project-config";
import { ProjectType } from "../util/get-project-info";
import { ModuleConfig } from "./init";

import {
  updateNextJSEslint,
  updateReactJSEslint,
} from "../util/updater/update-eslint";
import { highlighter } from "../util/color";

export const add = new Command()
  .name("add")
  .description("Add components based on the module.json pathResolve")
  .action(async () => {
    const cwd = process.cwd();
    const spinner = loading("Reading module.json...").start();

    try {
      // module.json 읽기

      const moduleJsonPath = path.resolve(cwd, "module.json");
      const moduleJson = await fs.readJSON(moduleJsonPath);
      const { isSrcDir, styleType, isTsx, type } = moduleJson;
      spinner.succeed("module.json read successfully.");

      if (!isTsx) {
        const resolveEslintSpinner = loading("Detecting Eslint...").start();
        const eslintConfig = await getEslintConfig(moduleJson);
        resolveEslintSpinner.succeed("Resolve Eslint");

        if (!eslintConfig) return;

        const updateEslintSpinner = loading(
          "Updating Your Eslint File...",
        ).start();

        try {
          // react
          if (type === "react") {
            await updateReactJSEslint(eslintConfig);

            updateEslintSpinner.succeed(`Update your Eslint File of React-js `);
          }

          // nextjs javascript
          if (type !== "react") {
            await updateNextJSEslint(eslintConfig);
            updateEslintSpinner.succeed(`Update your Eslint File of Next-js `);
          }
        } catch (err) {
          console.log(highlighter.info(`${err}`));
        }
      }

      // srcDir 값에 따라 calendar 폴더 경로 결정
      const modulePath = isSrcDir
        ? path.join(cwd, "src", "components", "module", "calendar")
        : path.join(cwd, "components", "module", "calendar");

      // calendar 폴더가 이미 존재하면 덮어쓸지 여부 확인
      const calendarExists = await fs.pathExists(modulePath);
      if (calendarExists) {
        const { overwrite } = await inquirer.prompt([
          {
            type: "confirm",
            name: "overwrite",
            message: "Calendar folder already exists. Overwrite?",
            default: true,
          },
        ]);

        if (!overwrite) {
          logger.info("Operation cancelled.");
          return;
        }
      }

      // 필요한 디렉터리가 없으면 생성
      await fs.ensureDir(modulePath);

      // GitHub 저장소 전체 ZIP 파일 URL
      const githubZipUrl =
        "https://github.com/lunaxislu/cli-calendar-lib/archive/refs/heads/main.zip";
      const tempZipPath = path.join(cwd, "temp.zip");
      const extractPath = path.join(cwd, "extracted");

      // GitHub에서 zip 파일 다운로드
      spinner.start(`Downloading zip file from ${githubZipUrl}...`);
      const response = await fetch(githubZipUrl);

      if (!response.ok) {
        throw new Error(`Failed to download files from ${githubZipUrl}`);
      }

      // zip 파일을 로컬에 저장
      const buffer = await response.arrayBuffer();
      await fs.writeFile(tempZipPath, Buffer.from(buffer));
      spinner.succeed("Downloaded zip file.");

      // 압축 해제
      spinner.start("Extracting zip file...");
      await fs.ensureDir(extractPath);

      const zip = new AdmZip(tempZipPath);
      zip.extractAllTo(extractPath, true);
      spinner.succeed("Extracted zip file.");

      // 중복된 폴더가 있을 경우 처리
      const extractedFolders = await fs.readdir(extractPath);
      const extractedMainFolder = extractedFolders.find((folder) =>
        folder.includes("cli-calendar-lib-main"),
      );

      if (!extractedMainFolder) {
        throw new Error(
          "Extracted folder not found. Please check the downloaded content.",
        );
      }

      // 실제 압축 해제 경로 설정
      const finalExtractPath = path.join(
        extractPath,
        extractedMainFolder,
        "src",
      );

      // 디버깅: 압축 해제된 경로 내 폴더 출력
      const contents = await fs.readdir(finalExtractPath);
      logger.info(`Final extracted folder contents: ${contents.join(", ")}`);

      // isTsx 값에 따라 javascript 또는 typescript 선택
      const languageFolder = moduleJson.isTsx ? "typescript" : "javascript";

      // styleType에 따라 calendar-css-module 또는 calendar-tw 선택
      const styleFolder =
        styleType === "CSS Modules" ? "calendar-css-module" : "calendar-tw";

      // calendarSourcePath 동적 설정
      const calendarSourcePath = path.join(
        finalExtractPath,
        `components/${languageFolder}/${styleFolder}`,
      );

      // 폴더 존재 여부 확인
      if (!(await fs.pathExists(calendarSourcePath))) {
        throw new Error(
          highlighter.error(
            `The path ${calendarSourcePath} does not exist. Please callback cli-calendar add`,
          ),
        );
      }

      // RSC 처리
      if (moduleJson.isRsc) {
        const rscComponentSpinner = loading("Manage RSC Component...").start();
        const pathResolve = path.resolve(
          finalExtractPath,
          `components/${languageFolder}/${styleFolder}/Calendar.${
            isTsx ? "tsx" : "jsx"
          }`,
        );

        let fileContent = await fs.readFile(pathResolve, "utf-8");
        fileContent = `"use client";\n${fileContent}`;

        await fs.writeFile(pathResolve, fileContent, "utf-8");
        rscComponentSpinner.succeed("Complete Rsc Component");
      }
      // 필요한 경로로 복사
      await fs.copy(calendarSourcePath, modulePath);
      spinner.succeed(`Copied calendar files to ${modulePath}`);

      // 임시 파일 정리
      await fs.remove(tempZipPath);
      await fs.remove(extractPath);
      logger.success("Temporary files removed.");
      logger.success("Your component is now ready. Enjoy using it!");
    } catch (error) {
      spinner.fail("Operation failed.");
      if (error instanceof Error) {
        logger.error(error.message);
      } else {
        logger.error(String(error));
      }
    }
  });
