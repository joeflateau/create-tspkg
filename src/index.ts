#!/usr/bin/env node

import { copyFromTemplateFiles } from "var-sub";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import { prompt } from "inquirer";
import { parse as parsePath } from "path";

const exec = promisify(execCb);

export async function init({
  templateDir,
  destDir,
  options: {
    packageName,
    description,
    author,
    license,
    makeCli,
    createGithubRepo
  }
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
    {
      mapper: ({ path, contents }) => {
        path = path.split("--").join("");

        if (makeCli) {
          contents = mapMatch(path, contents, {
            "./src/index.ts": contents =>
              [
                `#!/usr/bin/env node`,
                contents,
                `if (require.main === module) { console.log(helloWorld()); }`
              ].join("\n\n"),
            "./package.json": editJson(packageJsonContents => ({
              ...packageJsonContents,
              bin: {
                [packageName]: "./dist/index.js"
              }
            }))
          });
        }

        return {
          path,
          contents
        };
      }
    }
  );

  await exec("npm i", { cwd: destDir });

  await exec("git init", { cwd: destDir });

  if (createGithubRepo) {
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
    await init({
      templateDir: __dirname + "/../template",
      destDir: process.cwd(),
      options
    });
  })().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

function mapMatch(
  path: string,
  contents: string,
  modify: Record<string, (contents: string) => string>
) {
  if (path in modify) {
    contents = modify[path](contents);
  }
  return contents;
}

function editJson(editorFn: (obj: any) => void) {
  return function(value: string) {
    const obj = JSON.parse(value);
    const newObj = editorFn(obj);
    return JSON.stringify(newObj, null, 2);
  };
}
