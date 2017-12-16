import { expect } from "chai";
import "mocha";
import { initTable } from "./DataInit";
import { PoolConnection, Connection } from "mysql";
import { ConnectionHelper, Select, Exec } from "../src/index";
import { connectionConfig } from "./connectionConfig";

describe("Exec", function() {
  let tableName = "tbl_test_exec";
  let conn: Connection;

  before(async () => {
    conn = await ConnectionHelper.create(connectionConfig);
    await initTable(conn, tableName, false);
  });

  after(async () => {
    await ConnectionHelper.close(conn);
  });

  it("exec must be success", async () => {
    // 删除前有1，2，3，4，5
    await Select.selectCount(conn, {
      sql: `select * from ${tableName} where id in (?,?,?,?,?)`,
      where: [1, 2, 3, 4, 5]
    }).then(result => {
      expect(result).to.be.equal(5);
    });


    // 删除 1，2，3，4，5
    await Exec.exec(conn, `delete from ${tableName} where id=1`);
    await Exec.execs(conn, [`delete from ${tableName} where id=2`, `delete from ${tableName} where id=3`]);
    await Exec.execsSeq(conn, [`delete from ${tableName} where id=4`, `delete from ${tableName} where id=5`]);

    // 验证 数据已不存在
    await Select.selectCount(conn, {
      sql: `select * from ${tableName} where id in (?,?,?,?,?)`,
      where: [1, 2, 3, 4, 5]
    }).then(result => {
      expect(result).to.be.equal(0);
    });

    await Exec.execsSeq(conn, [`drop table if exists tbl1`, `drop table if exists tbl2`, `drop table if exists tbl3`]);
  });

  it("exec with error", async () => {
    await Exec.exec(conn, `delete from ${tableName} where id1=1`)
      .then(() => {
        expect(true).to.be.false; // 一定不能进到这里
      })
      .catch(err => {
        expect(err).not.to.be.null;
      });

    await Exec.execs(conn, [`delete from ${tableName} where id1=1`])
      .then(() => {
        expect(true).to.be.false; // 一定不能进到这里
      })
      .catch(err => {
        expect(err).not.to.be.null;
      });

    await Exec.execsSeq(conn, [`delete from ${tableName} where id1=1`, `delete from ${tableName} where id1=1`])
      .then(() => {
        expect(true).to.be.false; // 一定不能进到这里
      })
      .catch(err => {
        expect(err).not.to.be.null;
      });

    await Exec.execsSeq(conn, [`create table f`, `create table f`])
      .then(() => {
        expect(true).to.be.false; // 一定不能进到这里
      })
      .catch(err => {
        expect(err).not.to.be.null;
      });
  });
});
