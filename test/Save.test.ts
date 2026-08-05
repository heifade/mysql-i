import { expect } from "chai";
import "mocha";
import { initTable } from "./DataInit";
import { PoolConnection, Connection } from "mysql2/promise";
import { ConnectionHelper, Save, Select, SaveType } from "../src/index";
import { connectionConfig } from "./connectionConfig";
import { getToday } from "./utils";

describe("Save", function () {
  let tableName = "tbl_test_save";
  let conn: Connection;

  before(async () => {
    conn = await ConnectionHelper.create(connectionConfig);
    await initTable(conn, tableName, false);
  });
  after(async () => {
    await ConnectionHelper.close(conn);
  });

  it("save must be success", async () => {
    let insertValue = `value${Math.random()}`;

    await Save.save(conn, {
      data: { id: 10, value: insertValue },
      table: tableName,
      saveType: SaveType.insert
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select value, DATE_FORMAT(createDate,'%Y-%m-%d') as createDate, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate from ${tableName} where id=?`,
      where: [10]
    });
    expect(rowData.value).to.equal(insertValue);
    expect(rowData.createDate).to.equal(getToday());
    expect(rowData.updateDate).to.equal(getToday());



    await Save.save(conn, {
      data: { id: 1900, value: insertValue },
      table: tableName,
      saveType: SaveType.insert,
      saveDate: '2026-01-02 12:13:14',
      saveBy: "test_user"
    });

    rowData = await Select.selectTop1(conn, {
      sql: `select value, DATE_FORMAT(createDate,'%Y-%m-%d') as createDate, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate, createBy, updateBy from ${tableName} where id=?`,
      where: [1900]
    });
    expect(rowData.value).to.equal(insertValue);
    expect(rowData.createDate).to.equal('2026-01-02');
    expect(rowData.updateDate).to.equal('2026-01-02');
    expect(rowData.createBy).to.equal('test_user');
    expect(rowData.updateBy).to.equal('test_user');




    insertValue = `value${Math.random()}_new1`;
    await Save.save(conn, {
      data: { id: 10, value: insertValue },
      table: tableName,
      saveType: SaveType.update
    });

    rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [10]
    });
    expect(rowData.value).to.equal(insertValue);

    await Save.save(conn, {
      data: { id: 9, value: insertValue },
      table: tableName,
      saveType: SaveType.delete
    });

    rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [9]
    });
    expect(rowData).to.be.null;

    insertValue = `value${Math.random()}_new3`;
    await Save.save(conn, {
      data: { id: 8, value: insertValue },
      table: tableName,
      saveType: SaveType.replace
    });

    rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [8]
    });
    expect(rowData.value).to.equal(insertValue);
  });

  it("saves must be success", async () => {
    let insertValue = `value${Math.random()}`;
    await Save.saves(conn, [
      {
        data: { id: 11, value: insertValue },
        table: tableName,
        saveType: SaveType.insert
      },
      {
        data: { id: 111, value: insertValue },
        table: tableName,
        saveType: SaveType.insert
      },
      {
        data: { id: 112, value: insertValue },
        table: tableName,
        saveType: SaveType.insert
      }
    ], {
      saveBy: 'djd1',
      saveDate: '2026-05-08 12:11:00'
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select value, createBy, updateBy, DATE_FORMAT(createDate,'%Y-%m-%d') as createDate, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate from ${tableName} where id=?`,
      where: [11]
    });
    expect(rowData.value).to.equal(insertValue);
    expect(rowData.createBy).to.equal('djd1');
    expect(rowData.createDate).to.equal('2026-05-08');
    expect(rowData.updateBy).to.equal('djd1');
    expect(rowData.updateDate).to.equal('2026-05-08');

    insertValue = `value${Math.random()}_new1`;
    await Save.saves(conn, [
      {
        data: { id: 11, value: insertValue },
        table: tableName,
        saveType: SaveType.update
      }
    ], {
      saveBy: 'djda3',
      saveDate: '2026-05-18 12:11:00'
    });

    rowData = await Select.selectTop1(conn, {
      sql: `select value, DATE_FORMAT(createDate,'%Y-%m-%d') as createDate, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate, updateBy from ${tableName} where id=?`,
      where: [11]
    });
    expect(rowData.value).to.equal(insertValue);
    expect(rowData.updateBy).to.equal('djda3');
    expect(rowData.createDate).to.equal('2026-05-08');
    expect(rowData.updateDate).to.equal('2026-05-18');

    await Save.saves(conn, [
      {
        data: { id: 7, value: insertValue },
        table: tableName,
        saveType: SaveType.delete
      }
    ]);

    rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [7]
    });
    expect(rowData).to.be.null;

    insertValue = `value${Math.random()}_new3`;
    await Save.saves(conn, [
      {
        data: { id: 6, value: insertValue },
        table: tableName,
        saveType: SaveType.replace
      }
    ]);

    rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [6]
    });
    expect(rowData.value).to.equal(insertValue);

    // 插入重复键时报错
    insertValue = `value${Math.random()}_new3`;
    await Save.saves(conn, [
      {
        data: { id: 6, value: insertValue },
        table: tableName,
        saveType: SaveType.insert
      }
    ])
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.code).to.equal(`ER_DUP_ENTRY`);
      });
  });

  it("savesSeq must be success", async () => {
    let insertValue = `value${Math.random()}`;

    await Save.savesSeq(conn, [
      {
        data: { id: 12, value: insertValue },
        table: tableName,
        saveType: SaveType.insert
      }]);

    await Save.savesSeq(conn, [
      {
        data: { id: 12, value: insertValue },
        table: tableName,
        saveType: SaveType.update
      },
      {
        data: { id: 121, value: insertValue },
        table: tableName,
        saveType: SaveType.insert
      },
      {
        data: { id: 122, value: insertValue },
        table: tableName,
        saveType: SaveType.insert
      }
    ], {
      saveBy: 'djd3',
      saveDate: '2026-09-08 12:11:00'
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select value, DATE_FORMAT(createDate,'%Y-%m-%d') as createDate, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate, updateBy from ${tableName} where id=?`,
      where: [12]
    });
    expect(rowData.value).to.equal(insertValue);
    expect(rowData.createDate).to.equal(getToday());
    expect(rowData.updateDate).to.equal('2026-09-08');
    expect(rowData.updateBy).to.equal('djd3');


    insertValue = `value${Math.random()}_new1`;
    await Save.savesSeq(conn, [
      {
        data: { id: 12, value: insertValue },
        table: tableName,
        saveType: SaveType.update
      }
    ]);

    rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [12]
    });
    expect(rowData.value).to.equal(insertValue);

    await Save.savesSeq(conn, [
      {
        data: { id: 5, value: insertValue },
        table: tableName,
        saveType: SaveType.delete
      }
    ]);

    rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [5]
    });
    expect(rowData).to.be.null;

    insertValue = `value${Math.random()}_new3`;
    await Save.savesSeq(conn, [
      {
        data: { id: 4, value: insertValue },
        table: tableName,
        saveType: SaveType.replace
      }
    ]);

    rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [4]
    });
    expect(rowData.value).to.equal(insertValue);
  });

  it("savesSeq err", async () => {
    let insertValue = `value${Math.random()}`;

    try {
      await Save.savesSeq(conn, [
        {
          data: { id: 200, value: insertValue },
          table: tableName,
          saveType: SaveType.insert
        },
        {
          data: { id: 200, value: insertValue },
          table: tableName,
          saveType: SaveType.insert
        }
      ]);
    } catch (err: any) {
      expect(err.code).to.equal(`ER_DUP_ENTRY`);
    }

    let rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [200]
    });
    expect(rowData.value).to.equal(insertValue);
  });

  it("savesWithTran must be success", async () => {
    let insertValue = `value${Math.random()}`;

    await Save.savesWithTran(conn, [
      {
        data: { id: 300, value: insertValue },
        table: tableName,
        saveType: SaveType.insert
      },
      {
        data: { id: 301, value: insertValue },
        table: tableName,
        saveType: SaveType.insert
      }
    ], {
      saveBy: 'djd3-u',
      saveDate: '2026-12-07 12:11:00'
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select value, DATE_FORMAT(createDate,'%Y-%m-%d') as createDate, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate, updateBy from ${tableName} where id=?`,
      where: [300]
    });
    expect(rowData != null && rowData.value === insertValue).to.be.true;
    expect(rowData != null && rowData.updateBy === 'djd3-u').to.be.true;
    expect(rowData != null && rowData.createDate === '2026-12-07').to.be.true;

    rowData = await Select.selectTop1(conn, {
      sql: `select value, DATE_FORMAT(createDate,'%Y-%m-%d') as createDate, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate, updateBy from ${tableName} where id=?`,
      where: [301]
    });


    expect(rowData != null && rowData.value === insertValue).to.be.true;
    expect(rowData != null && rowData.updateBy === 'djd3-u').to.be.true;
    expect(rowData != null && rowData.createDate === '2026-12-07').to.be.true;
  });

  it("savesWithTran err", async () => {
    let insertValue = `value${Math.random()}`;

    try {
      await Save.savesWithTran(conn, [
        {
          data: { id: 302, value: insertValue },
          table: tableName,
          saveType: SaveType.insert
        },
        {
          data: { id: 302, value: insertValue },
          table: tableName,
          saveType: SaveType.insert
        }
      ]);
      expect(true).to.be.false; // 进到这里就有问题
    } catch (err: any) {
      expect(err.code).to.be.equal("ER_DUP_ENTRY");
    }

    let rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [302]
    });
    expect(rowData).to.be.null;
  });

  it("savesSeqWithTran must be success", async () => {
    let insertValue = `value${Math.random()}`;

    try {
      await Save.savesSeqWithTran(conn, [
        {
          data: { id: 400, value: insertValue },
          table: tableName,
          saveType: SaveType.insert
        },
        {
          data: { id: 401, value: insertValue },
          table: tableName,
          saveType: SaveType.insert
        }
      ]);
    } catch (err: any) {
      expect(err.code).to.equal(`ER_DUP_ENTRY`);
    }

    let rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [400]
    });
    expect(rowData.value).to.equal(insertValue);

    rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [401]
    });
    expect(rowData.value).to.equal(insertValue);
  });

  it("savesSeqWithTran err", async () => {
    let insertValue = `value${Math.random()}`;

    try {
      await Save.savesSeqWithTran(conn, [
        {
          data: { id: 402, value: insertValue },
          table: tableName,
          saveType: SaveType.insert
        },
        {
          data: { id: 402, value: insertValue },
          table: tableName,
          saveType: SaveType.insert
        }
      ]);
      expect(true).to.be.false; // 进到这里就有问题
    } catch (err: any) {
      expect(err.code).to.be.equal("ER_DUP_ENTRY");
    }

    let rowData = await Select.selectTop1(conn, {
      sql: `select value from ${tableName} where id=?`,
      where: [402]
    });
    expect(rowData).to.be.null;
  });
});
