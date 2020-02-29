#!/usr/bin/env node

import { readFile } from "fs-extra";
import { copyFromTemplateFiles } from "var-sub";
import { exec as execCb } from "child_process";
import { promisify } from "util";

const exec = promisify(execCb);

export async function init({
  srcDir,
  templateDir,
  destDir
}: {
  srcDir: string;
  templateDir: string;
  destDir: string;
}) {
  const packageJsonString = await readFile(srcDir + "/package.json", "utf8");
  const packageObj = JSON.parse(packageJsonString);
  const {
    name: PACKAGE_NAME,
    author: PACKAGE_AUTHOR,
    license: PACKAGE_LICENSE
  } = packageObj;

  await copyFromTemplateFiles(templateDir, "./**/*", destDir, {
    PACKAGE_NAME,
    PACKAGE_AUTHOR,
    PACKAGE_LICENSE
  });

  await exec("npm i", { cwd: destDir });
}

if (require.main === module) {
  init({
    srcDir: process.cwd(),
    templateDir: process.cwd() + "/template",
    destDir: process.cwd()
  });
}
