import fs from "fs-extra";
import path from "path";
import fetch from "node-fetch";
import inquirer from "inquirer";
import { Command } from "commander";
import { logger } from "../util/logger";
import { loading } from "../util/loading";

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
      const { isSrcDir, styleType, isTsx, isRsc, pathResolve } = moduleJson;
      spinner.succeed("module.json read successfully.");

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

      // 파일 다운로드할 목록 설정
      let filesToDownload: string[] = [];
      if (styleType === "CSS Modules") {
        // CSS Modules 스타일일 때는 3개 파일
        filesToDownload = [
          `/Calendar.${isTsx ? "tsx" : "jsx"}`,
          `/calendar.module.css`,
        ];
      } else if (styleType === "Tailwind") {
        // Tailwind 스타일일 때는 2개 파일
        filesToDownload = [
          `/Calendar.${isTsx ? "tsx" : "jsx"}`,
          `/utils.${isTsx ? "ts" : "js"}`,
        ];
      }

      // 파일 다운로드 및 저장
      for (const filePath of filesToDownload) {
        const fileUrl = `${pathResolve}${filePath}`;
        const localFilePath = path.join(modulePath, path.basename(filePath));

        spinner.start(`Downloading ${fileUrl}...`);
        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error(`Failed to download ${fileUrl}`);
        }

        let fileContent = await response.text();
        await fs.writeFile(localFilePath, fileContent);
        spinner.succeed(`Downloaded and saved ${path.basename(filePath)}`);

        // RSC 처리 (isRsc가 true일 경우 Calendar.jsx 또는 Calendar.tsx에 "use client" 추가)
        if (isRsc && filePath.includes("Calendar")) {
          const rscComponentSpinner = loading(
            "Adding 'use client' to Calendar component...",
          ).start();
          fileContent = `"use client";\n${fileContent}`;
          await fs.writeFile(localFilePath, fileContent, "utf-8");
          rscComponentSpinner.succeed(
            "Added 'use client' to Calendar component",
          );
        }
      }

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
