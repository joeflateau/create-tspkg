import { describe, it } from "mocha";
import { init } from ".";
import { directory } from "tempy";
import { exec as execCb } from "child_process";
import { promisify } from "util";

const exec = promisify(execCb);

describe("init", () => {
  it("should initialize a new package", async function() {
    this.timeout("30s");
    const resultDir = directory();
    console.log("test dir: " + resultDir);
    await init({
      templateDir: process.cwd() + "/template",
      destDir: resultDir,
      options: {
        packageName: "test-package",
        description: "Test package is a test package",
        author: "John Smith",
        license: "ISC",
        createGithubRepo: false,
        makeCli: false
      }
    });

    await exec("npm run test", { cwd: resultDir });
  });

  it("should initialize a new cli package", async function() {
    this.timeout("30s");
    const resultDir = directory();
    console.log("test dir: " + resultDir);
    await init({
      templateDir: process.cwd() + "/template",
      destDir: resultDir,
      options: {
        packageName: "test-package",
        description: "Test package is a test package",
        author: "John Smith",
        license: "ISC",
        createGithubRepo: false,
        makeCli: true
      }
    });

    await exec("npm run test", { cwd: resultDir });
  });
});
