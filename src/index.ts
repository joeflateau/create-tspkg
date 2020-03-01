#!/usr/bin/env node

import { copyFromTemplateFiles } from "var-sub";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import { prompt } from "inquirer";
import { parse as parsePath } from "path";
import { readFile, writeFile, readJSON, writeJSON } from "fs-extra";

const exec = promisify(execCb);

export async function init({
  templateDir,
  destDir,
  options
}: {
  templateDir: string;
  destDir: string;
  options: {
    packageName: string;
    description: string;
    author: string;
    license: string;
    createGithubRepo: boolean;
    makeCli: boolean;
  };
}) {
  const { packageName, description, author, license, makeCli } = options;

  await copyFromTemplateFiles(
    templateDir,
    "./**/*",
    destDir,
    {
      PACKAGE_NAME: packageName,
      PACKAGE_AUTHOR: author,
      PACKAGE_LICENSE: license,
      PACKAGE_DESCRIPTION: description
    },
    { modifyDestRelativePath: path => path.split("--").join("") }
  );

  if (options.makeCli) {
    const shebang = `#!/usr/bin/env node`;
    const indexContents = await readFile(destDir + "/src/index.ts", "utf8");
    const execIfMainModule = `if (require.main === module) { console.log(helloWorld()); }`;
    const newIndexContents = [shebang, indexContents, execIfMainModule].join(
      "\n\n"
    );
    await writeFile(destDir + "/src/index.ts", newIndexContents, "utf8");
    const packageJsonContents = await readJSON(destDir + "/package.json");
    packageJsonContents["bin"] = {
      [packageName]: "./dist/index.js"
    };
    await writeJSON(destDir + "/package.json", packageJsonContents, {
      spaces: 2
    });
  }

  await exec("npm i", { cwd: destDir });

  await exec("git init", { cwd: destDir });

  if (options.createGithubRepo) {
    await exec(`hub create '${packageName}'`, { cwd: destDir });
  }
}

if (require.main === module) {
  (async function() {
    const options = await prompt([
      {
        type: "input",
        name: "packageName",
        message: "Package name:",
        default: parsePath(process.cwd()).base
      },
      {
        type: "input",
        name: "description",
        message: "Package description:"
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
        name: "makeCli",
        default: false,
        message: "Would you like this to executable as a cli?"
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
