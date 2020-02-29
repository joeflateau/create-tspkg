#!/usr/bin/env node

import { copyFromTemplateFiles } from "var-sub";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import { prompt } from "inquirer";

const exec = promisify(execCb);

export async function init({
  templateDir,
  destDir,
  packageJson
}: {
  templateDir: string;
  destDir: string;
  packageJson: { name: string; author: string; license: string };
}) {
  const {
    name: PACKAGE_NAME,
    author: PACKAGE_AUTHOR,
    license: PACKAGE_LICENSE
  } = packageJson;

  await copyFromTemplateFiles(templateDir, "./**/*", destDir, {
    PACKAGE_NAME,
    PACKAGE_AUTHOR,
    PACKAGE_LICENSE
  });

  await exec("npm i", { cwd: destDir });
}

if (require.main === module) {
  (async function() {
    const packageJson = await prompt([
      {
        type: "input",
        name: "name",
        message: "Package name"
      },
      {
        type: "input",
        name: "author",
        message: "Package author"
      },
      {
        type: "input",
        name: "license",
        message: "Package license",
        default: "ISC"
      }
    ]);
    init({
      templateDir: __dirname + "/../template",
      destDir: process.cwd(),
      packageJson
    });
  })();
}
