import { expect } from "chai";
import "mocha";
import { initTable } from "./DataInit";
import { PoolConnection, Connection } from "mysql2/promise";
import { ConnectionHelper, Insert, Select } from "../src/index";
import { getToday } from "./utils";
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

  it("insert must be success with createDate is null or updateDate is null", async () => {
    let insertValue = `value${Math.random()}`;

    let result = await Insert.insert(conn, {
      data: { value: insertValue },
      table: tableName
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select value, DATE_FORMAT(createDate,'%Y-%m-%d') as createDate, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate from ${tableName} where id=?`,
      where: [result.insertId]
    });

    expect(rowData != null).to.be.true;
    expect(rowData.value).to.equal(insertValue);
    expect(rowData.createDate).to.equal(getToday());
    expect(rowData.updateDate).to.equal(getToday());
  });

  it("insert must be success with pars.saveDate is not null", async () => {
    let insertValue = `value${Math.random()}`;

    let result = await Insert.insert(conn, {
      data: { value: insertValue },
      table: tableName,
      saveDate: '2026-01-01 12:12:00',
      saveBy: 'djd'
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select value, DATE_FORMAT(createDate,'%Y-%m-%d') as createDate, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate, createBy, updateBy from ${tableName} where id=?`,
      where: [result.insertId]
    });

    expect(rowData != null).to.be.true;
    expect(rowData.value).to.equal(insertValue);
    expect(rowData.createDate).to.equal('2026-01-01');
    expect(rowData.updateDate).to.equal('2026-01-01');
    expect(rowData.createBy).to.equal('djd');
    expect(rowData.updateBy).to.equal('djd');
  });

  it("insert must be success with pars.saveDate is not null and createDate is not null and updateDate is not null", async () => {
    let insertValue = `value${Math.random()}`;

    let result = await Insert.insert(conn, {
      data: { value: insertValue, createDate: '2026-05-05 10:12:13', updateDate: '2026-05-06 10:12:13', createBy: 'abc', updateBy: 'tyu' },
      table: tableName,
      saveDate: '2026-01-01 12:12:00',
      saveBy: 'djd'
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select value, DATE_FORMAT(createDate,'%Y-%m-%d') as createDate, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate, createBy, updateBy from ${tableName} where id=?`,
      where: [result.insertId]
    });

    expect(rowData != null).to.be.true;
    expect(rowData.value).to.equal(insertValue);
    expect(rowData.createDate).to.equal('2026-05-05');
    expect(rowData.updateDate).to.equal('2026-05-06');
    expect(rowData.createBy).to.equal('abc');
    expect(rowData.updateBy).to.equal('tyu');
  });

  it("insert must be success with createDate is not null or updateDate is not null", async () => {
    let insertValue = `value${Math.random()}`;

    let result = await Insert.insert(conn, {
      data: { value: insertValue, createDate: '2026-01-01 12:12:00', updateDate: '2026-01-03 16:16:00' },
      table: tableName
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select value, DATE_FORMAT(createDate,'%Y-%m-%d') as createDate, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate from ${tableName} where id=?`,
      where: [result.insertId]
    });

    expect(rowData != null).to.be.true;
    expect(rowData.value).to.equal(insertValue);
    expect(rowData.createDate).to.equal('2026-01-01');
    expect(rowData.updateDate).to.equal('2026-01-03');
  });

  it("when pars.data is null", async () => {
    await Insert.insert(conn, {
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

    await Insert.insert(conn, {
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
