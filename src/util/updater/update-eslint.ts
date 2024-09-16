import { CosmiconfigResult } from "cosmiconfig";
import path from "path";

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
import { Config } from "../config/get-project-config";

export async function updateReactJSEslint(eslintConfig: Config) {
  if (!eslintConfig || eslintConfig.isEmpty) {
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
  const sourceFile = project.addSourceFileAtPath(filepath);

  const configWithRules = sourceFile
    .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression) // 모든 객체 리터럴 표현식을 가져옴
    .find((objectLiteral: ObjectLiteralExpression) => {
      const rulesProperty = objectLiteral.getProperty(`rules`);
      return rulesProperty ? objectLiteral : undefined;
    });
  if (configWithRules) {
    const rulesProperty = configWithRules.getProperty(
      "rules",
    ) as PropertyAssignment;

    const rulesObject =
      rulesProperty.getInitializer() as ObjectLiteralExpression;

    const quoteChar = getQuoteChar(rulesObject);
    const targetEsLintProperty = rulesObject.getProperty(
      `${quoteChar}react/prop-types${quoteChar}`,
    ) as PropertyAssignment;

    if (targetEsLintProperty) {
      targetEsLintProperty.setInitializer(`${quoteChar}off${quoteChar}`);
    }

    if (!targetEsLintProperty) {
      rulesObject.addPropertyAssignment({
        name: `${quoteChar}react/prop-types${quoteChar}`,
        initializer: `${quoteChar}off${quoteChar}`,
      });
    }
  }

  if (!configWithRules) {
    const objectLiterals = sourceFile.getDescendantsOfKind(
      SyntaxKind.ObjectLiteralExpression,
    )[0];

    const quoteChar = getQuoteChar(objectLiterals);
    objectLiterals.addPropertyAssignment({
      name: `${quoteChar}rules${quoteChar}`,
      initializer: `{ ${quoteChar}react/prop-types${quoteChar}: ${quoteChar}off${quoteChar} }`,
    });
  }
  updaterSpinner.succeed("update Eslint");
  await sourceFile.save();
  return;
}
