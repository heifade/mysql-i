import { Delete, ConnectionHelper, Select } from "../src/index";
import { expect } from "chai";
import "mocha";
import { initTable } from "./DataInit";
import { Connection } from "mysql";
import { connectionConfig } from "./connectionConfig";

describe("Delete", function() {
  let tableName = "tbl_test_delete";
  let conn: Connection;
  before(async () => {
    conn = await ConnectionHelper.create(connectionConfig);
    await initTable(conn, tableName, false);
  });
  after(async () => {
    await ConnectionHelper.close(conn);
  });

  it("delete must be success", async () => {
    let deleteId = 1;
    let count = await Select.selectCount(conn, {
      sql: `select * from ${tableName} where id=?`,
      where: [deleteId]
    });
    expect(count).to.equal(1);

    await Delete.delete(conn, {
      where: { id: 1 },
      table: tableName
    });

    count = await Select.selectCount(conn, {
      sql: `select * from ${tableName} where id=?`,
      where: [deleteId]
    });
    expect(count).to.equal(0);
  });

  it("when pars.table is null", async () => {
    await Delete.delete(conn, {
      where: { id: 1 },
      table: null
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal("pars.table can not be null or empty!");
      });
  });

  it("when table is not exists", async () => {
    let insertName = `name${Math.random()}`;

    let tableName = `tbl_not_exists`;

    await Delete.delete(conn, {
      where: { id: 1 },
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal(`table '${tableName}' is not exists!`);
      });
  });

  it("when error", async () => {
    let tableName = `tbl_not_exists`;
    await Delete.delete(conn, {
      where: { id: 0 },
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal(`table '${tableName}' is not exists!`);
      });
  });
});
