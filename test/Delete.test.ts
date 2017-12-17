import { Delete, ConnectionHelper, Select, Exec, Schema } from "../src/index";
import { expect } from "chai";
import "mocha";
import { initTable } from "./DataInit";
import { Connection } from "mysql";
import { connectionConfig } from "./connectionConfig";

describe("Delete", function() {
  let tableName = "tbl_test_delete";
  let tableNoPrimaryKey = "tbl_test_noprimarykey";
  let conn: Connection;
  before(async () => {
    conn = await ConnectionHelper.create(connectionConfig);
    await initTable(conn, tableName, false);

    await Exec.exec(conn, `drop table if exists ${tableNoPrimaryKey}`);
    await Exec.exec(
      conn,
      `create table ${tableNoPrimaryKey} (
          id int,
          value varchar(50),
          dateValue datetime
        )`
    );

    Schema.clear(conn.config.database);
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

    await Delete.deleteByWhere(conn, {
      where: { id: deleteId },
      table: tableName
    });

    count = await Select.selectCount(conn, {
      sql: `select * from ${tableName} where id=?`,
      where: [deleteId]
    });
    expect(count).to.equal(0);

    deleteId = 2;
    count = await Select.selectCount(conn, {
      sql: `select * from ${tableName} where id=?`,
      where: [deleteId]
    });
    expect(count).to.equal(1);

    await Delete.delete(conn, {
      data: { id: deleteId },
      table: tableName
    });

    count = await Select.selectCount(conn, {
      sql: `select * from ${tableName} where id=?`,
      where: [deleteId]
    });
    expect(count).to.equal(0);
  });

  it("when pars.table is null", async () => {
    await Delete.deleteByWhere(conn, {
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

    await Delete.delete(conn, {
      data: { id: 1 },
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

    await Delete.deleteByWhere(conn, {
      where: { id: 1 },
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal(`Table '${tableName}' is not exists!`);
      });

    await Delete.delete(conn, {
      data: { id: 1 },
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal(`Table '${tableName}' is not exists!`);
      });
  });

  it("when data is null", async () => {
    let insertName = `name${Math.random()}`;

    await Delete.delete(conn, {
      data: null,
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal(`pars.data can not be null or empty!`);
      });
  });

  it("when key not provided", async () => {
    let insertName = `name${Math.random()}`;

    await Delete.delete(conn, {
      data: {},
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal(`Key id is not provided!`);
      });
  });

  it("when table with no primary key", async () => {
    let insertName = `name${Math.random()}`;

    await Delete.delete(conn, {
      data: { id: 1 },
      table: tableNoPrimaryKey
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal(`Table '${tableNoPrimaryKey}' has no primary key, you can not call this function. Please try function 'deleteByWhere'!`);
      });
  });

  it("when error", async () => {
    await Delete.deleteByWhere(conn, {
      where: { id: "@#$%" },
      table: tableName
    })
      // .then(() => {
      //   expect(true).to.be.false; // 进到这里就有问题
      // })
      .catch(err => {
        let errCode = Reflect.get(err, "code");
        expect(errCode).to.be.equal("ER_TRUNCATED_WRONG_VALUE");
      });

    await Delete.delete(conn, {
      data: { id: "@#$%" },
      table: tableName
    })
      // .then(() => {
      //   expect(true).to.be.false; // 进到这里就有问题
      // })
      .catch(err => {
        let errCode = Reflect.get(err, "code");
        expect(errCode).to.be.equal("ER_TRUNCATED_WRONG_VALUE");
      });
  });
});
