import { describe, it } from "mocha";
import { init } from ".";
import { directory } from "tempy";
import { exec as execCb } from "child_process";
import { promisify } from "util";

const exec = promisify(execCb);

describe("init", () => {
  it("should expand template, install deps, and run tests for new package", async function() {
    this.timeout("30s");
    const resultDir = directory();
    console.log("test dir: " + resultDir);
    await init({
      templateDir: process.cwd() + "/template",
      destDir: resultDir,
      options: {
        name: "test-package",
        description: "Test package is a test package",
        author: "John Smith",
        license: "ISC",
        createGithubRepo: false
      }
    });

    await exec("npm run test", { cwd: resultDir });
  });
});
