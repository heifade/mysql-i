import { expect } from "chai";
import "mocha";
import { ConnectionHelper } from "../src/index";
import { connectionConfig } from "./connectionConfig";

describe("ConnectionHelper", function() {
  it("create close", async () => {
    let conn = await ConnectionHelper.create(connectionConfig);
    await ConnectionHelper.close(conn);

    let o = Object.assign({}, connectionConfig);
    o.user = "";
    ConnectionHelper.create(o).catch(err => {
      expect(err).not.to.be.null;
    });

    await ConnectionHelper.close(conn);
    await ConnectionHelper.close(null);
  });
});
