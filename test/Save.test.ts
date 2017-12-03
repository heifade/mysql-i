import { expect } from "chai";
import "mocha";
import { initTable } from "./DataInit";
import { PoolConnection, Connection } from "mysql";
import { ConnectionHelper, Save, Select, SaveType } from "../src/index";
import { connectionConfig } from "./connectionConfig";

describe("Save", function() {
  let tableName = "tbl_test_save";
  let conn: Connection;

  before(done => {
    (async function() {
      conn = await ConnectionHelper.create(connectionConfig);
      await initTable(conn, tableName, false);
    })().then(() => {
      done();
    });
  });
  after(done => {
    (async function() {
      await ConnectionHelper.close(conn);
    })().then(() => {
      done();
    });
  });

  it("save must be success", done => {
    let asyncFunc = async function() {
      let insertValue = `value${Math.random()}`;

      await Save.save(conn, {
        data: { id: 10, value: insertValue },
        table: tableName,
        saveType: SaveType.insert
      });

      let rowData = await Select.selectTop1(conn, {
        sql: `select value from ${tableName} where id=?`,
        where: [10]
      });
      expect(Reflect.get(rowData, "value")).to.equal(insertValue);

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
      expect(Reflect.get(rowData, "value")).to.equal(insertValue);

      await Save.save(conn, {
        data: { id: 9 },
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
      expect(Reflect.get(rowData, "value")).to.equal(insertValue);
    };

    asyncFunc()
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it("saves must be success", done => {
    let asyncFunc = async function() {
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
      ]);

      let rowData = await Select.selectTop1(conn, {
        sql: `select value from ${tableName} where id=?`,
        where: [11]
      });
      expect(Reflect.get(rowData, "value")).to.equal(insertValue);

      insertValue = `value${Math.random()}_new1`;
      await Save.saves(conn, [
        {
          data: { id: 11, value: insertValue },
          table: tableName,
          saveType: SaveType.update
        }
      ]);

      rowData = await Select.selectTop1(conn, {
        sql: `select value from ${tableName} where id=?`,
        where: [11]
      });
      expect(Reflect.get(rowData, "value")).to.equal(insertValue);

      await Save.saves(conn, [
        {
          data: { id: 7 },
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
      expect(Reflect.get(rowData, "value")).to.equal(insertValue);

      // 插入重复键时报错
      insertValue = `value${Math.random()}_new3`;
      await Save.saves(conn, [
        {
          data: { id: 6, value: insertValue },
          table: tableName,
          saveType: SaveType.insert
        }
      ]).catch(err => {
        let errCode = Reflect.get(err, "code");
        expect(errCode).to.equal(`ER_DUP_ENTRY`);
      });
    };

    asyncFunc()
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it("savesSeq must be success", done => {
    let asyncFunc = async function() {
      let insertValue = `value${Math.random()}`;

      await Save.savesSeq(conn, [
        {
          data: { id: 12, value: insertValue },
          table: tableName,
          saveType: SaveType.insert
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
      ]);

      let rowData = await Select.selectTop1(conn, {
        sql: `select value from ${tableName} where id=?`,
        where: [12]
      });
      expect(Reflect.get(rowData, "value")).to.equal(insertValue);

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
      expect(Reflect.get(rowData, "value")).to.equal(insertValue);

      await Save.savesSeq(conn, [
        {
          data: { id: 5 },
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
      expect(Reflect.get(rowData, "value")).to.equal(insertValue);
    };

    asyncFunc()
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it("savesSeq err", done => {
    let asyncFunc = async function() {
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
      } catch (err) {
        let errCode = Reflect.get(err, "code");
        expect(errCode).to.equal(`ER_DUP_ENTRY`);
      }

      let rowData = await Select.selectTop1(conn, {
        sql: `select value from ${tableName} where id=?`,
        where: [200]
      });
      expect(Reflect.get(rowData, "value")).to.equal(insertValue);
    };

    asyncFunc()
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it("savesWithTran must be success", done => {
    let asyncFunc = async function() {
      let insertValue = `value${Math.random()}`;

      try {
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
        ]);
      } catch (err) {
        let errCode = Reflect.get(err, "code");
        expect(errCode).to.equal(`ER_DUP_ENTRY`);
      }

      let rowData = await Select.selectTop1(conn, {
        sql: `select value from ${tableName} where id=?`,
        where: [300]
      });
      rowData = await Select.selectTop1(conn, {
        sql: `select value from ${tableName} where id=?`,
        where: [301]
      });
      expect(Reflect.get(rowData, "value")).to.equal(insertValue);
    };

    asyncFunc()
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it("savesWithTran err", done => {
    let asyncFunc = async function() {
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
      } catch (err) {
        let errCode = Reflect.get(err, "code");
        expect(errCode).to.equal(`ER_DUP_ENTRY`);
      }

      let rowData = await Select.selectTop1(conn, {
        sql: `select value from ${tableName} where id=?`,
        where: [302]
      });
      expect(rowData).to.be.null;
    };

    asyncFunc()
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it("savesSeqWithTran must be success", done => {
    let asyncFunc = async function() {
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
      } catch (err) {
        let errCode = Reflect.get(err, "code");
        expect(errCode).to.equal(`ER_DUP_ENTRY`);
      }

      let rowData = await Select.selectTop1(conn, {
        sql: `select value from ${tableName} where id=?`,
        where: [400]
      });
      expect(Reflect.get(rowData, "value")).to.equal(insertValue);

      rowData = await Select.selectTop1(conn, {
        sql: `select value from ${tableName} where id=?`,
        where: [401]
      });
      expect(Reflect.get(rowData, "value")).to.equal(insertValue);
    };

    asyncFunc()
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it("savesSeqWithTran err", done => {
    let asyncFunc = async function() {
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
      } catch (err) {
        let errCode = Reflect.get(err, "code");
        expect(errCode).to.equal(`ER_DUP_ENTRY`);
      }

      let rowData = await Select.selectTop1(conn, {
        sql: `select value from ${tableName} where id=?`,
        where: [402]
      });
      expect(rowData).to.be.null;
    };

    asyncFunc()
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });
});
