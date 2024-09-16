import { CosmiconfigResult } from "cosmiconfig";
import path from "path";
import { Config } from "../config/get-eslint-config";
import fs from "fs-extra";
import { loading } from "../loading";
import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  Project,
  PropertyAssignment,
  SyntaxKind,
} from "ts-morph";
import { getQuoteChar } from "../get-project-info";

export async function updateEslint(eslintConfig: Config) {
  if (!eslintConfig) {
    return; // @todo config 조건문 설정하기
  }
  const updaterSpinner = loading("update your eslint...").start();
  const { config, fileExtension, filepath, isEmpty } = eslintConfig;

  if (fileExtension === ".json") {
    config.rules = config.rules || {};
    config.rules["react/prop-types"] = "off";
    // @todo try , catch
    await fs.writeJSON(filepath, config, { spaces: 2 });
    updaterSpinner.succeed("updated @lint");

    return;
  }

  const project = new Project();

  if (Array.isArray(config)) {
    const sourceFile = project.addSourceFileAtPath(filepath);
    const arrayExpressions = sourceFile.getDescendantsOfKind(
      SyntaxKind.ArrayLiteralExpression
    );

    await updateArrayEslint(arrayExpressions);

    await sourceFile.save();
    updaterSpinner.succeed("updated @lint");
    return;
  }

  const sourceFile = project.addSourceFileAtPath(filepath);
  // object
}

async function updateArrayEslint(arrayExpressions: ArrayLiteralExpression[]) {
  // assumed empty file
  if (arrayExpressions.length === 0) return;

  let rulesPropertyFound = false;
  arrayExpressions.forEach((arrayExpress) => {
    const expressionArr = arrayExpress
      .getElements()
      .filter((el) => el.getKind() === SyntaxKind.ObjectLiteralExpression);

    const objectLiterals = expressionArr as ObjectLiteralExpression[];
    objectLiterals.forEach((objectLiteral) => {
      if (objectLiteral) {
        const rulesProperty = objectLiteral.getProperty(
          "rules"
        ) as PropertyAssignment;

        if (rulesProperty) {
          rulesPropertyFound = true;

          const rulesInitializer = rulesProperty.getInitializer();
          if (rulesInitializer) {
            const rulesObject = rulesInitializer as ObjectLiteralExpression;

            const quoteChar = getQuoteChar(rulesObject);
            // "react/prop-types" 규칙이 있는지 확인
            const targetLint = rulesObject.getProperty(
              `${quoteChar}react/prop-types${quoteChar}`
            );

            if (!targetLint) {
              rulesObject.addPropertyAssignment({
                name: `${quoteChar}react/prop-types${quoteChar}`,
                initializer: `${quoteChar}off${quoteChar}`,
              });
            }
          }
        }
      }
    });

    if (!rulesPropertyFound) {
      const firstObjectLiteral = arrayExpress
        .getElements()[0]
        .asKind(SyntaxKind.ObjectLiteralExpression);

      if (firstObjectLiteral) {
        const quoteChar = getQuoteChar(firstObjectLiteral);

        firstObjectLiteral.addPropertyAssignment({
          name: `${quoteChar}rules${quoteChar}`,
          initializer: `{ ${quoteChar}react/prop-types${quoteChar}: ${quoteChar}off${quoteChar} }`,
        });
      }
    }
  });
  return;
}
