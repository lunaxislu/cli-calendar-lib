// import fs from "fs-extra";
// import path from "path";
// import fetch from "node-fetch";
// import unzipper from "unzipper";
// import inquirer from "inquirer";
// import { Command } from "commander";
// import { logger } from "../util/logger";
// import { loading } from "../util/loading";

// export const add = new Command()
//   .name("add")
//   .description("Add components based on the module.json pathResolve")
//   .action(async () => {
//     const cwd = process.cwd();
//     const spinner = loading("Reading module.json...").start();

//     try {
//       // module.json 읽기
//       const moduleJsonPath = path.resolve(cwd, "module.json");
//       const moduleJson = await fs.readJSON(moduleJsonPath);
//       const { pathResolve, isSrcDir, styleType } = moduleJson;

//       spinner.succeed("module.json read successfully.");

//       // src가 있는 경우와 없는 경우에 따라 달리 처리
//       const srcDirPath = isSrcDir ? path.join(cwd, "src") : cwd;
//       const calendarPath = path.join(srcDirPath, "module", "calendar");

//       // 필요한 디렉터리가 없으면 생성
//       await fs.ensureDir(calendarPath);

//       // calendar 폴더가 이미 존재하면 덮어쓸지 여부 확인
//       const calendarExists = await fs.pathExists(calendarPath);
//       if (calendarExists) {
//         const { overwrite } = await inquirer.prompt([
//           {
//             type: "confirm",
//             name: "overwrite",
//             message: "Calendar folder already exists. Overwrite?",
//             default: true,
//           },
//         ]);

//         if (!overwrite) {
//           logger.info("Operation cancelled.");
//           return;
//         }
//       }

//       // GitHub 저장소 전체 ZIP 파일 URL
//       const githubZipUrl =
//         "https://github.com/lunaxislu/cli-calendar-lib/archive/refs/heads/main.zip";
//       const tempZipPath = path.join(cwd, "temp.zip");
//       const extractPath = path.join(cwd, "extracted");

//       // GitHub에서 zip 파일 다운로드
//       spinner.start(`Downloading zip file from ${githubZipUrl}...`);
//       const response = await fetch(githubZipUrl);

//       if (!response.ok) {
//         throw new Error(`Failed to download files from ${githubZipUrl}`);
//       }

//       // zip 파일을 로컬에 저장
//       const buffer = await response.arrayBuffer();
//       await fs.writeFile(tempZipPath, Buffer.from(buffer));
//       spinner.succeed("Downloaded zip file.");

//       // 압축 해제
//       spinner.start("Extracting zip file...");
//       await fs.ensureDir(extractPath);
//       await fs
//         .createReadStream(tempZipPath)
//         .pipe(unzipper.Extract({ path: extractPath }))
//         .promise();
//       spinner.succeed("Extracted zip file.");

//       // 중복된 폴더가 있을 경우 처리
//       const extractedFolders = await fs.readdir(extractPath);
//       const extractedMainFolder = extractedFolders.find((folder) =>
//         folder.includes("cli-calendar-lib-main"),
//       );

//       if (!extractedMainFolder) {
//         throw new Error(
//           "Extracted folder not found. Please check the downloaded content.",
//         );
//       }

//       // 실제 압축 해제 경로 설정
//       const finalExtractPath = path.join(
//         extractPath,
//         extractedMainFolder,
//         "src",
//       );

//       // 디버깅: 압축 해제된 경로 내 폴더 출력
//       const contents = await fs.readdir(finalExtractPath);
//       logger.info(`Final extracted folder contents: ${contents.join(", ")}`);

//       // isTsx 값에 따라 javascript 또는 typescript 선택
//       const languageFolder = moduleJson.isTsx ? "typescript" : "javascript";

//       // styleType에 따라 calendar-css-module 또는 calendar-tw 선택
//       const styleFolder =
//         styleType === "CSS Modules" ? "calendar-css-module" : "calendar-tw";

//       // calendarSourcePath 동적 설정
//       const calendarSourcePath = path.join(
//         finalExtractPath,
//         `components/${languageFolder}/${styleFolder}`,
//       );

//       // 폴더 존재 여부 확인
//       if (!(await fs.pathExists(calendarSourcePath))) {
//         throw new Error(
//           `The path ${calendarSourcePath} does not exist. Please check the extracted content.`,
//         );
//       }

//       // 필요한 경로로 복사
//       await fs.copy(calendarSourcePath, calendarPath);
//       spinner.succeed(`Copied calendar files to ${calendarPath}`);

//       // Tailwind 설정 수정
//       if (styleType === "Tailwind") {
//         spinner.start("Checking Tailwind configuration...");

//         const tailwindConfigPath = path.resolve(cwd, "tailwind.config.js");

//         if (await fs.pathExists(tailwindConfigPath)) {
//           const tailwindConfig = await fs.readJSON(tailwindConfigPath);

//           const calendarContentPath = isSrcDir
//             ? "./src/module/calendar/**/*.{js,ts,jsx,tsx}"
//             : "./module/calendar/**/*.{js,ts,jsx,tsx}";

//           if (!tailwindConfig.content.includes(calendarContentPath)) {
//             tailwindConfig.content.push(calendarContentPath);

//             // Tailwind config 파일에 수정된 내용 저장
//             await fs.writeJSON(tailwindConfigPath, tailwindConfig, {
//               spaces: 2,
//             });
//             spinner.succeed("Tailwind configuration updated.");
//           } else {
//             spinner.info("Tailwind configuration already includes calendar.");
//           }
//         } else {
//           // Tailwind config 파일이 없으면 에러 처리
//           spinner.fail(
//             "Tailwind configuration file not found. Please create a tailwind.config.js.",
//           );
//           logger.error("Tailwind configuration file not found.");
//         }
//       }

//       // 임시 파일 정리
//       await fs.remove(tempZipPath);
//       await fs.remove(extractPath);
//       logger.success("Temporary files removed.");
//       logger.success("Your component is now ready. Enjoy using it!");
//     } catch (error) {
//       spinner.fail("Operation failed.");
//       if (error instanceof Error) {
//         logger.error(error.message);
//       } else {
//         logger.error(String(error));
//       }
//     }
//   });
import fs from "fs-extra";
import path from "path";
import fetch from "node-fetch";
import unzipper from "unzipper";
import { Command } from "commander";
import { logger } from "../util/logger";
import { loading } from "../util/loading";

export const add = new Command()
  .name("add")
  .description("Download and extract ZIP file to the extracted folder")
  .action(async () => {
    const cwd = process.cwd();
    const spinner = loading("Starting the process...").start();
    let tempZipPath;
    try {
      // GitHub 저장소 전체 ZIP 파일 URL
      const githubZipUrl =
        "https://github.com/lunaxislu/cli-calendar-lib/archive/refs/heads/main.zip";
      tempZipPath = path.join(cwd, "temp.zip"); // ZIP 파일이 저장될 경로
      const extractPath = path.join(cwd, "extracted"); // 압축 해제될 폴더 경로

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
      await fs
        .createReadStream(tempZipPath)
        .pipe(unzipper.Extract({ path: extractPath }))
        .promise();
      spinner.succeed("Extracted zip file.");

      // 디버깅: 압축 해제된 폴더 내용 출력
      const contents = await fs.readdir(extractPath);
      logger.info(`Extracted folder contents: ${contents.join(", ")}`);
    } catch (error) {
      spinner.fail("Operation failed.");
      if (error instanceof Error) {
        logger.error(error.message);
      } else {
        logger.error(String(error));
      }
    } finally {
      // 작업이 끝나면 임시 zip 파일 삭제
      await fs.remove(tempZipPath as string);
      spinner.succeed("Temporary zip file removed.");
    }
  });
