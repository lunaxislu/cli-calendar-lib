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
import { highlighter } from "../color";

export async function updateReactJSEslint(eslintConfig: Config) {
  if (eslintConfig.isEmpty) {
    return; // @todo config 조건문 설정하기
  }

  const { config, fileExtension, filepath } = eslintConfig;

  if (fileExtension === ".json") {
    config.rules = config.rules || {};
    config.rules["react/prop-types"] = "off";
    // @todo try , catch
    await fs.writeJSON(filepath, config, { spaces: 2 });

    return;
  }

  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filepath);

  try {
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

    await sourceFile.save();
    return;
  } catch (err) {
    return console.log(
      `${highlighter.error(
        "Something Wrong \n But That's Okay Just Edit Your Config of Eslint",
      )}`,
    );
  }
}

export async function updateNextJSEslint(eslintConfig: Config) {
  if (eslintConfig.isEmpty) {
    return; // @todo config 조건문 설정하기
  }
  const { config, fileExtension, filepath } = eslintConfig;
  try {
    if (fileExtension === ".json") {
      config.extends || [];

      // Used Set .... 역시.. 재밌군...
      const extendsSet = new Set(
        typeof config.extends === "string" ? [config.extends] : config.extends,
      );
      extendsSet.add("next/babel");
      config.extends = Array.from(extendsSet);
      // @todo try , catch
      await fs.writeJSON(filepath, config, { spaces: 2 });

      return;
    }
  } catch (err) {
    return console.log(
      `${highlighter.error(
        "Something Wrong \n But That's Okay Just Edit Your Config of Eslint",
      )}`,
    );
  }
}
