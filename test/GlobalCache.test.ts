import { expect } from "chai";
import "mocha";
import { GlobalCache } from "../src/global/GlobalCache";

describe("GlobalCache", function () {
  it("set and get", () => {
    GlobalCache.set("testKey1", "value1");
    expect(GlobalCache.get("testKey1")).to.equal("value1");
  });

  it("get non-existent key returns undefined", () => {
    expect(GlobalCache.get("__non_existent_key__")).to.be.undefined;
  });

  it("overwrite existing value", () => {
    GlobalCache.set("testKey2", "original");
    expect(GlobalCache.get("testKey2")).to.equal("original");

    GlobalCache.set("testKey2", "updated");
    expect(GlobalCache.get("testKey2")).to.equal("updated");
  });

  it("set null value", () => {
    GlobalCache.set("testKeyNull", null);
    expect(GlobalCache.get("testKeyNull")).to.be.null;
  });

  it("set object value", () => {
    const obj = { a: 1, b: "test" };
    GlobalCache.set("testKeyObj", obj);
    expect(GlobalCache.get("testKeyObj")).to.deep.equal(obj);
  });

  it("multiple keys are independent", () => {
    GlobalCache.set("multi1", "v1");
    GlobalCache.set("multi2", "v2");
    GlobalCache.set("multi3", "v3");

    expect(GlobalCache.get("multi1")).to.equal("v1");
    expect(GlobalCache.get("multi2")).to.equal("v2");
    expect(GlobalCache.get("multi3")).to.equal("v3");
  });
});
