import { describe, it } from "mocha";
import { expect } from "chai";
import { helloWorld } from ".";

describe("helloWorld", () => {
  it("should return the string 'hello world'", async () => {
    const result = helloWorld();
    expect(result).to.equal("hello world");
  });
});
