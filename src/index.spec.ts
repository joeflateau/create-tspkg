import { describe, it } from "mocha";
import { expect } from "chai";
import { init } from ".";
import { exec as execCb } from "child_process";
import { promisify } from "util";

const exec = promisify(execCb);

describe("init", () => {
  it("should expand template, install deps, and run tests for new package", async function() {
    this.timeout("15s");
    await init({
      templateDir: process.cwd() + "/template",
      destDir: process.cwd() + "/test-results",
      packageJson: {
        name: "test-package",
        author: "John Smith",
        license: "ISC"
      }
    });
    await exec("npm run test", { cwd: process.cwd() + "/test-results" });
  });
});
