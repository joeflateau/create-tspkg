#!/usr/bin/env node

import { copyFromTemplateFiles } from "var-sub";
import { move, createFile } from "fs-extra";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import { prompt } from "inquirer";
import { parse as parsePath } from "path";

const exec = promisify(execCb);

export async function init({
  templateDir,
  destDir,
  options
}: {
  templateDir: string;
  destDir: string;
  options: {
    name: string;
    author: string;
    license: string;
    createGithubRepo: boolean;
  };
}) {
  const {
    name: PACKAGE_NAME,
    author: PACKAGE_AUTHOR,
    license: PACKAGE_LICENSE
  } = options;

  await copyFromTemplateFiles(templateDir, "./**/*", destDir, {
    PACKAGE_NAME,
    PACKAGE_AUTHOR,
    PACKAGE_LICENSE
  });

  for (const tempName of [".gitignore", "package.json"]) {
    await move(destDir + `/--${tempName}`, destDir + `/${tempName}`, {
      overwrite: true
    });
  }

  await exec("npm i", { cwd: destDir });

  await exec("git init", { cwd: destDir });

  if (options.createGithubRepo) {
    await exec(`hub create ${PACKAGE_NAME}`, { cwd: destDir });
  }
}

if (require.main === module) {
  (async function() {
    const options = await prompt([
      {
        type: "input",
        name: "name",
        message: "Package name:",
        default: parsePath(process.cwd()).base
      },
      {
        type: "input",
        name: "author",
        message: "Package author name:",
        default: process.env.USER
      },
      {
        type: "input",
        name: "license",
        message: "Package license:",
        default: "ISC"
      },
      {
        type: "confirm",
        name: "createGithubRepo",
        default: false,
        message: "Create a GitHub repo for this?"
      }
    ]);
    init({
      templateDir: __dirname + "/../template",
      destDir: process.cwd(),
      options
    });
  })();
}
