#!/usr/bin/env node
import { Command } from "commander";
import { getPackageInfo } from "./util/get-package-info";
import { init } from "./cli/init";

async function main() {
  const packageInfo = getPackageInfo();
  const program = new Command()
    .name("deep-cli")
    .description("add components and dependencies to your project")
    .version(
      packageInfo.version || "1.0.0",
      "-v, --version",
      "display the version number",
    );

  program.addCommand(init);
  program.parse();
}

main();
