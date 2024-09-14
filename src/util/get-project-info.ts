import path from "path";
import { loadConfig } from "tsconfig-paths";
import fs from "fs-extra";
import fg from "fast-glob";
import { getPackageManager } from "./get-package-manager";
import { Framework, FRAMEWORKS } from "./frameworks";
import { JsonValue } from "type-fest";
import { ObjectLiteralExpression, Project, SyntaxKind } from "ts-morph";
import { logger } from "./logger";
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
}
export async function isTypeScriptProject(cwd: string) {
  // vite는 tsconfig가 3개임
  const files = await fg.glob("tsconfig.*", {
    cwd,
    deep: 1,
    ignore: PROJECT_SHARED_IGNORE,
  });

  return files.length > 0;
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
  const configFiles = await fg(["tailwind.config.*"], {
    cwd,
    deep: 1,
    ignore: PROJECT_SHARED_IGNORE,
  });

  if (configFiles.length > 0) {
    return path.resolve(cwd, configFiles[0]);
  }

  return null;
}
// _getQuoteChar: 객체에서 사용하는 쿼트 형식을 확인하는 함수
export function _getQuoteChar(configObject: ObjectLiteralExpression): string {
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
  if (!filePath) return logger.error("not find filepath");

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
  const quoteChar = _getQuoteChar(configObject);

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
}
// @tailwind base 추가 작업 유틸리티
export async function addTailwindBaseToCss(filePaths: string[]) {
  // 패턴에 맞는 global.css 또는 index.css를 우선적으로 찾음
  const globalCssPath = filePaths.find((file) => file.includes("global.css"));
  const indexCssPath = filePaths.find((file) => file.includes("index.css"));

  // global.css가 있으면 해당 파일에 추가, 없으면 index.css에 추가
  const fileToAddBase = globalCssPath || indexCssPath || filePaths[0];
  const cssContent = await fs.readFile(fileToAddBase, "utf8");

  // 파일에 '@tailwind base'가 없을 경우 추가
  if (!cssContent.includes("@tailwind base")) {
    const updatedContent = `@tailwind base;\n${cssContent}`;
    await fs.writeFile(fileToAddBase, updatedContent, "utf8");
    console.log(`Added '@tailwind base' to ${fileToAddBase}`);
  }
}
export async function getTailwindCssFile(cwd: string) {
  const files = await fg.glob("**/*.css", {
    cwd,
    deep: 5,
    ignore: PROJECT_SHARED_IGNORE,
  });

  if (!files.length) {
    throw Error("not Find Css FILE");
  }

  const tailwindBaseCssFiles: string[] = [];
  /**
   * @explain
   * index.css , global.css, app.css 에 @tailwindBase붙여도 무관
   * tailwind.config.* content 설정 해줘야지 굴러감
   */
  for (const file of files) {
    const contents = await fs.readFile(path.resolve(cwd, file), "utf8");
    if (contents.includes("@tailwind base")) {
      tailwindBaseCssFiles.push(file);
    }
  }
  if (tailwindBaseCssFiles.length === 0) {
    if (files.length > 0) {
      await addTailwindBaseToCss(files); // 업으면 추가해주기
      tailwindBaseCssFiles.push(...files);
    }
  }
  return null;
}
