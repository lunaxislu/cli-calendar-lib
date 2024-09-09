#!/usr/bin/env node
import { Command } from "commander";
import { getPackageInfo } from "./util/get-package-info";
import { init } from "./cli/init";
import { add } from "./cli/add";

async function main() {
  const packageInfo = getPackageInfo();
  const program = new Command()
    .name("cli-calendar")
    .description("add components and dependencies to your project")
    .version(
      packageInfo.version || "1.0.0",
      "-v, --version",
      "display the version number",
    );

  program.addCommand(init).addCommand(add);
  program.parse();
}

main();
