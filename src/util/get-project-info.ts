import path from "path";
import { loadConfig } from "tsconfig-paths";
import fs from "fs-extra";
import fg from "fast-glob";
import { getPackageManager } from "./get-package-manager";
import { Framework, FRAMEWORKS } from "./frameworks";
import { ObjectLiteralExpression, Project, SyntaxKind } from "ts-morph";
import { logger } from "./logger";
import { highlighter } from "./color";
export type ProjectType = {
  framework: Framework;
  isUsingAppDir: boolean;
  isSrcDir: boolean;
  isTsx: boolean;
  configFiles: string[];
  packageManager: "yarn" | "pnpm" | "bun" | "npm";
};
const PROJECT_SHARED_IGNORE = [
  "**/node_modules/**",
  ".next",
  "public",
  "dist",
  "build",
];

export async function getTsConfigAliasPrefix(cwd: string) {
  const tsConfig = loadConfig(cwd);

  if (tsConfig?.resultType === "failed" || !tsConfig?.paths) {
    return null;
  }
  // This assume that the first alias is the prefix.
  for (const [alias, paths] of Object.entries(tsConfig.paths)) {
    if (
      paths.includes("./*") ||
      paths.includes("./src/*") ||
      paths.includes("./app/*") ||
      paths.includes("./resources/js/*") // Laravel.
    ) {
      return alias.at(0) ?? null;
    }
  }

  return null;
}
export async function getProjectInfo(cwd: string) {
  try {
    const [isSrcDir, isTsx, configFiles, packageManager] = await Promise.all([
      fs.pathExists(path.resolve(cwd, "src")),
      isTypeScriptProject(cwd),
      fg.glob("next.config.*", {
        cwd,
        deep: 1,
      }),
      getPackageManager(cwd),
    ]);

    const isNext = configFiles.length > 0;
    const projectType: ProjectType = {
      framework: FRAMEWORKS["react.js"],
      isUsingAppDir: false,
      isSrcDir,
      isTsx,
      configFiles,
      packageManager,
    };

    if (isNext) {
      projectType.isUsingAppDir = await fs.pathExists(
        path.resolve(cwd, `${isSrcDir ? "src/" : ""}app`)
      );
      projectType.framework = projectType.isUsingAppDir
        ? FRAMEWORKS["next-app"]
        : FRAMEWORKS["next-pages"];
    }
    const resolveConfig = {
      ...projectType,
      ...projectType.framework,
    };

    return resolveConfig;
  } catch (err) {
    throw new Error(highlighter.error("Cannot resolve project config"));
  }
}
export async function isTypeScriptProject(cwd: string) {
  // vite는 tsconfig가 3개임
  try {
    const files = await fg.glob("tsconfig.*", {
      cwd,
      deep: 1,
      ignore: PROJECT_SHARED_IGNORE,
    });

    return files.length > 0;
  } catch (err) {
    throw new Error(highlighter.error("No tsconfig, or Something went wrong"));
  }
}

export async function getTsConfig() {
  try {
    const tsconfigPath = path.join("tsconfig.json");
    const tsconfig = await fs.readJSON(tsconfigPath);

    if (!tsconfig) {
      throw new Error("tsconfig.json is missing");
    }

    return tsconfig;
  } catch (error) {
    return null;
  }
}

export async function getTailwindConfigPath(cwd: string) {
  try {
    const configFiles = await fg(["tailwind.config.*"], {
      cwd,
      deep: 1,
      ignore: PROJECT_SHARED_IGNORE,
    });

    if (configFiles.length > 0) {
      return path.resolve(cwd, configFiles[0]);
    }

    return null;
  } catch (err) {
    throw new Error(highlighter.error("Failed get tailwind config path"));
  }
}
// _getQuoteChar: 객체에서 사용하는 쿼트 형식을 확인하는 함수
export function getQuoteChar(configObject: ObjectLiteralExpression): string {
  return configObject
    .getFirstDescendantByKind(SyntaxKind.StringLiteral)
    ?.getQuoteKind() === "'"
    ? "'"
    : '"';
}

// Tailwind 설정 파일 수정
export async function updateWithTsmorphToTailwindConfig(
  filePath: string | null,
  content: string[]
) {
  try {
    if (!filePath) return logger.error("File path not found");

    const project = new Project();

    // 설정 파일 읽기
    const sourceFile = project.addSourceFileAtPath(filePath);

    // Tailwind config의 ObjectLiteralExpression 찾기
    const configObject = sourceFile
      .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
      .find((node) =>
        node
          .getProperties()
          .some(
            (property) =>
              property.isKind(SyntaxKind.PropertyAssignment) &&
              property.getName() === "content"
          )
      );

    if (!configObject) {
      throw new Error("Could not find content field in tailwind config.");
    }

    // 현재 사용 중인 쿼트 형식 확인
    const quoteChar = getQuoteChar(configObject);

    // content 필드를 업데이트
    const existingContent = configObject.getProperty("content");

    if (existingContent?.isKind(SyntaxKind.PropertyAssignment)) {
      const initializer = existingContent.getInitializer();
      if (initializer?.isKind(SyntaxKind.ArrayLiteralExpression)) {
        content.forEach((contentItem) => {
          const formattedItem = `${quoteChar}${contentItem}${quoteChar}`;

          // 이미 존재하는지 확인 후 없으면 추가
          if (
            !initializer
              .getElements()
              .some((el) => el.getText().includes(contentItem))
          ) {
            initializer.addElement(formattedItem);
          }
        });
      }
    }

    // 수정된 내용을 파일에 저장
    await sourceFile.save();
  } catch (err) {
    throw new Error(highlighter.error("Failed update your tailwind config"));
  }
}
//
/**
 * @tailwind base 추가 작업 유틸리티
 * @explain No try {...} catch {...} css file 없으면 그냥 지나가자
 */
export async function addTailwindBaseToCss(filePaths: string[]) {
  const globalCssPath = filePaths.find((file) => file.includes("global.css"));
  const indexCssPath = filePaths.find((file) => file.includes("index.css"));

  // global.css가 있으면 해당 파일에 추가, 없으면 index.css에 추가
  const fileToAddDirectives = globalCssPath || indexCssPath || filePaths[0];
  const cssContent = await fs.readFile(fileToAddDirectives, "utf8");

  // 추가할 Tailwind directives
  const tailwindDirectives = [
    "@tailwind base;",
    "@tailwind components;",
    "@tailwind utilities;",
  ];

  let updatedContent = cssContent;

  // 각 directive가 있는지 확인하고 없으면 추가
  tailwindDirectives.forEach((directive) => {
    if (!updatedContent.includes(directive)) {
      updatedContent = `${directive}\n${updatedContent}`;
    }
  });

  // 파일에 추가된 내용을 저장
  await fs.writeFile(fileToAddDirectives, updatedContent, "utf8");
  logger.info(`Added Tailwind directives to ${fileToAddDirectives}`);
}
export async function getTailwindCssFile(cwd: string) {
  const files = await fg.glob("**/*.css", {
    cwd,
    deep: 5,
    ignore: ["**/node_modules/**", ".next", "public", "dist", "build"],
  });

  if (!files.length) {
    throw new Error("No CSS files found.");
  }

  const tailwindBaseCssFiles: string[] = [];

  for (const file of files) {
    const contents = await fs.readFile(path.resolve(cwd, file), "utf8");

    // @tailwind base가 있는 파일을 필터링하여 저장
    if (contents.includes("@tailwind base")) {
      tailwindBaseCssFiles.push(file);
    }
  }

  // @tailwind base가 있는 파일이 없을 경우, 첫 번째 CSS 파일에 추가
  if (tailwindBaseCssFiles.length === 0) {
    await addTailwindBaseToCss(files); // 추가 작업을 진행
    return files; // 추가한 파일을 반환
  }

  return tailwindBaseCssFiles; // 이미 @tailwind base가 있는 파일을 반환
}
