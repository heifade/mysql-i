import { expect } from "chai";
import "mocha";
import { Utils } from "../src/index";

describe("Utils", function () {
  describe("escapeIdentifier", () => {
    it("should wrap identifier with backticks", () => {
      expect(Utils.escapeIdentifier("col")).to.equal("`col`");
    });

    it("should escape backticks inside identifier by doubling them", () => {
      expect(Utils.escapeIdentifier("a`b")).to.equal("`a``b`");
    });

    it("should escape multiple backticks", () => {
      expect(Utils.escapeIdentifier("a`b`c")).to.equal("`a``b``c`");
    });

    it("should handle empty string", () => {
      expect(Utils.escapeIdentifier("")).to.equal("``");
    });

    it("should handle identifier with no special characters", () => {
      expect(Utils.escapeIdentifier("simple_name")).to.equal("`simple_name`");
    });

    it("should handle identifier with spaces", () => {
      expect(Utils.escapeIdentifier("my column")).to.equal("`my column`");
    });
  });

  describe("getDbObjectName", () => {
    it("should return `database`.`object` when database is provided", () => {
      expect(Utils.getDbObjectName("mydb", "mytable")).to.equal("`mydb`.`mytable`");
    });

    it("should return `object` when database is empty string", () => {
      expect(Utils.getDbObjectName("", "mytable")).to.equal("`mytable`");
    });

    it("should escape backticks in database name", () => {
      expect(Utils.getDbObjectName("my`db", "mytable")).to.equal("`my``db`.`mytable`");
    });

    it("should escape backticks in object name", () => {
      expect(Utils.getDbObjectName("mydb", "my`table")).to.equal("`mydb`.`my``table`");
    });
  });
});
