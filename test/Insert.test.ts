import { expect } from "chai";
import "mocha";
import { initTable } from "./DataInit";
import { PoolConnection, Connection } from "mysql";
import { ConnectionHelper, Insert, Select } from "../src/index";
import { connectionConfig } from "./connectionConfig";

describe("Insert", function() {
  let tableName = "tbl_test_insert";
  let conn: Connection;

  before(async () => {
    conn = await ConnectionHelper.create(connectionConfig);
    await initTable(conn, tableName, true);
  });
  after(async () => {
    await ConnectionHelper.close(conn);
  });

  it("insert must be success", async () => {
    let insertValue = `value${Math.random()}`;

    let result = await Insert.insert(conn, {
      data: { value: insertValue },
      table: tableName
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [result.insertId]
    });

    expect(rowData != null).to.be.true;
    expect(rowData.value).to.equal(insertValue);
  });

  it("when pars.data is null", async () => {
    await Insert.insert(conn, {
      data: null,
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.message).to.equal("pars.data can not be null or empty!");
      });
  });

  it("when pars.table is null", async () => {
    let insertValue = `value${Math.random()}`;

    await Insert.insert(conn, {
      data: { value: insertValue },
      table: null
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.message).to.equal("pars.table can not be null or empty!");
      });
  });

  it("when table is not exists", async () => {
    let insertValue = `value${Math.random()}`;

    let tableName = `tbl_not_exists`;

    await Insert.insert(conn, {
      data: { value: insertValue },
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.message).to.equal(`Table '${tableName}' is not exists!`);
      });
  });

  it("when error", async () => {
    let insertValue = `value${Math.random()}`;

    await Insert.insert(conn, {
      data: {
        id: 1,
        value: insertValue,
        value2: "aaa"
      }, // Duplicate entry '1' for key 'PRIMARY'
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.code).to.be.equal("ER_DUP_ENTRY");
      });
  });
});
