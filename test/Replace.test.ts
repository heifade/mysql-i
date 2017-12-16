import { expect } from "chai";
import "mocha";
import { connectionConfig } from "./connectionConfig";
import { initTable } from "./DataInit";
import { PoolConnection, Connection } from "mysql";
import { ConnectionHelper, Replace, Select } from "../src/index";

describe("Replace", function() {
  let tableName = "tbl_test_replace";
  let conn: Connection;
  before(async () => {
    conn = await ConnectionHelper.create(connectionConfig);
    await initTable(conn, tableName, false);
  });
  after(async () => {
    await ConnectionHelper.close(conn);
  });

  it("replace must be success", async () => {
    let insertValue = `value${Math.random()}`;

    let result = await Replace.replace(conn, {
      data: { id: 1, value: insertValue },
      table: tableName
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [1]
    });

    expect(rowData != null).to.be.true;
    expect(Reflect.get(rowData, "value")).to.equal(insertValue);
  });

  it("when pars.data is null", async () => {
    await Replace.replace(conn, {
      data: null,
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 一定不能进到这里
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal("pars.data can not be null or empty!");
      });
  });

  it("when pars.table is null", async () => {
    let insertValue = `value${Math.random()}`;

    await Replace.replace(conn, {
      data: { value: insertValue },
      table: null
    })
      .then(() => {
        expect(true).to.be.false; // 一定不能进到这里
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal("pars.table can not be null or empty!");
      });
  });

  it("when table is not exists", async () => {
    let insertValue = `value${Math.random()}`;

    let tableName = `tbl_not_exists`;

    await Replace.replace(conn, {
      data: { value: insertValue },
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 一定不能进到这里
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal(`table '${tableName}' is not exists!`);
      });
  });

  it("when error", async () => {
    let insertValue = `123456789012345678901234567890123456789012345678901234567890`;

    await Replace.replace(conn, {
      data: {
        id: 1,
        value: insertValue,
        value2: "aaa"
      },
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 一定不能进到这里
      })
      .catch(err => {
        expect(err).not.to.be.null;
      });
  });
});
