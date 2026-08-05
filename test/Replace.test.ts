import { expect } from "chai";
import "mocha";
import { connectionConfig } from "./connectionConfig";
import { initTable } from "./DataInit";
import { PoolConnection, Connection } from "mysql2/promise";
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
      data: { id: 1, value: insertValue, vv: 1 },
      table: tableName
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [1]
    });

    expect(rowData != null).to.be.true;
    expect(rowData.value).to.equal(insertValue);
  });

  it("when pars.data is null", async () => {
    await Replace.replace(conn, {
      data: null as any,
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

    await Replace.replace(conn, {
      data: { value: insertValue },
      table: null as any
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

    await Replace.replace(conn, {
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
    await Replace.replace(conn, {
      data: {
        // id: 1
      },
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.code).to.be.equal("ER_NO_DEFAULT_FOR_FIELD");
      });
  });

  it("replace with explicit date/by fields should use provided values", async () => {
    // Covers the "false" branches (explicit values skip auto-fill)
    let result = await Replace.replace(conn, {
      data: { id: 1, value: 'explicit', createDate: '2026-03-01 10:00:00', updateDate: '2026-03-02 10:00:00', createBy: 'user1', updateBy: 'user2' },
      table: tableName,
      saveDate: '2099-01-01 00:00:00',
      saveBy: 'shouldNotBeUsed'
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select value, DATE_FORMAT(createDate,'%Y-%m-%d') as createDate, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate, createBy, updateBy from ${tableName} where id=?`,
      where: [1]
    });
    expect(rowData.createDate).to.equal('2026-03-01');
    expect(rowData.updateDate).to.equal('2026-03-02');
    expect(rowData.createBy).to.equal('user1');
    expect(rowData.updateBy).to.equal('user2');
  });

  it("replace with saveDate and saveBy should auto-fill date/by fields", async () => {
    // Covers lines 95, 104, 113, 120: auto-fill with saveDate/saveBy when no explicit values provided
    await Replace.replace(conn, {
      data: { id: 2, value: 'autoFilled' },
      table: tableName,
      saveDate: '2026-07-07 07:00:00',
      saveBy: 'autoUser'
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select value, DATE_FORMAT(createDate,'%Y-%m-%d') as createDate, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate, createBy, updateBy from ${tableName} where id=?`,
      where: [2]
    });
    expect(rowData.createDate).to.equal('2026-07-07');
    expect(rowData.updateDate).to.equal('2026-07-07');
    expect(rowData.createBy).to.equal('autoUser');
    expect(rowData.updateBy).to.equal('autoUser');
  });
});
