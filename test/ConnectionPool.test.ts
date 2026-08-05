import { expect } from "chai";
import "mocha";
import { ConnectionPool } from "../src/index";
import { connectionConfig } from "./connectionConfig";

describe("ConnectionPool", function() {
  it("init", async () => {
    await ConnectionPool.init(connectionConfig);
    await ConnectionPool.init(connectionConfig);

    let conn = await ConnectionPool.getConnection();

    await ConnectionPool.closeConnection(conn);
    await ConnectionPool.closeConnection(conn);
    await ConnectionPool.closeConnection(null);


    await ConnectionPool.closePool();
    await ConnectionPool.closePool();

    let o = Object.assign({}, connectionConfig);
    o.user = "";

    await ConnectionPool.init(o);

    try {
      conn = await ConnectionPool.getConnection();
    } catch {}

    await ConnectionPool.closePool();

    await ConnectionPool.closePool();
  });

  it("getConnection without init should throw error", async () => {
    // Ensure pool is closed / not initialized
    await ConnectionPool.closePool();

    await ConnectionPool.getConnection()
      .then(() => {
        expect(true).to.be.false;
      })
      .catch(err => {
        expect(err.message).to.contain("has not been initialized");
      });
  });
});
