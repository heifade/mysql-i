import { expect } from "chai";
import "mocha";
import { initTable } from "./DataInit";
import { PoolConnection, Connection } from "mysql";
import { ConnectionHelper, Save, Transaction, Select, SaveType } from "../src/index";
import { connectionConfig } from "./connectionConfig";

describe("Transaction", function() {
  let tableName = "tbl_test_transaction";
  let conn: Connection;

  before(async () => {
    conn = await ConnectionHelper.create(connectionConfig);
    await initTable(conn, tableName, false);
  });
  after(async () => {
    await ConnectionHelper.close(conn);
  });

  it("transaction commit must be success", async () => {
    await Transaction.begin(conn);

    let insertValue = `value${Math.random()}`;

    await Save.save(conn, {
      data: { id: 10, value: insertValue },
      table: tableName,
      saveType: SaveType.insert
    });

    await Transaction.commit(conn);

    let rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [10]
    });
    expect(rowData.value).to.equal(insertValue);
  });

  it("transaction rollback must be success", async () => {
    let insertValue = `value${Math.random()}`;
    try {
      await Transaction.begin(conn);

      await Save.save(conn, {
        data: { id: 11, value: insertValue },
        table: tableName,
        saveType: SaveType.insert
      });

      await Save.save(conn, {
        data: { id: 11, value: insertValue },
        table: tableName,
        saveType: SaveType.insert
      });

      await Transaction.commit(conn);
    } catch (err) {
      await Transaction.rollback(conn);
    }

    let rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [11]
    });
    expect(rowData).to.equal(null);
  });

  it("transaction err", async () => {
    ConnectionHelper.close(conn);

    await Transaction.begin(conn).catch(err => {
      expect(err).not.to.be.null;
    });

    await Transaction.commit(conn).catch(err => {
      expect(err).not.to.be.null;
    });

    await Transaction.rollback(conn).catch(err => {
      expect(err).not.to.be.null;
    });
  });
});
