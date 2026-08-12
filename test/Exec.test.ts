import { expect } from "chai";
import "mocha";
import { initTable } from "./DataInit";
import { PoolConnection, Connection } from "mysql2/promise";
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
    // 删除前有1，2，3，4，5，6，7
    await Select.selectCount(conn, {
      sql: `select * from ${tableName} where id in (?,?,?,?,?,?,?)`,
      where: [1, 2, 3, 4, 5, 6, 7]
    }).then(result => {
      expect(result).to.be.equal(7);
    });

    // 删除 1，2，3，4，5，6，7
    await Exec.exec(conn, `delete from ${tableName} where id=1`);
    await Exec.execs(conn, [`delete from ${tableName} where id=2`, `delete from ${tableName} where id=3`]);
    await Exec.execsSeq(conn, [`delete from ${tableName} where id=4`, `delete from ${tableName} where id=5`]);
    await Exec.execsSeqWithTran(conn, [`delete from ${tableName} where id=6`, `delete from ${tableName} where id=7`]);

    // 验证 数据已不存在
    await Select.selectCount(conn, {
      sql: `select * from ${tableName} where id in (?,?,?,?,?,?,?)`,
      where: [1, 2, 3, 4, 5, 6, 7]
    }).then(result => {
      expect(result).to.be.equal(0);
    });

    await Exec.execsSeq(conn, [`drop table if exists tbl1`, `drop table if exists tbl2`, `drop table if exists tbl3`]);
  });

  it("exec with error", async () => {
    await Exec.exec(conn, `delete from ${tableName} where id1=1`)
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.code).to.equal(`ER_BAD_FIELD_ERROR`);
      });

    await Exec.execs(conn, [`delete from ${tableName} where id1=1`])
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.code).to.equal(`ER_BAD_FIELD_ERROR`);
      });

    await Exec.execsSeq(conn, [`delete from ${tableName} where id1=1`, `delete from ${tableName} where id1=1`])
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.code).to.be.equal("ER_BAD_FIELD_ERROR");
      });

    await Exec.execsSeq(conn, [`drop table if exists f`, `drop table if exists f2`, `create table f(f1 varchar(100))`, `create table f2(f1 varchar1(100))`])
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.code).to.equal(`ER_PARSE_ERROR`);
      });

    // 删除前有8,9
    await Select.selectCount(conn, {
      sql: `select * from ${tableName} where id in (?,?)`,
      where: [8, 9]
    }).then(result => {
      expect(result).to.be.equal(2);
    });
    await Exec.execsSeqWithTran(conn, [`delete from ${tableName} where id in(8,9)`, `delete from ${tableName} where id1=8`])
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.code).to.be.equal("ER_BAD_FIELD_ERROR");
      });
    // 8,9仍然存在
    await Select.selectCount(conn, {
      sql: `select * from ${tableName} where id in (?,?)`,
      where: [8, 9]
    }).then(result => {
      expect(result).to.be.equal(2);
    });
  });

  it("exec with pars (parameterized query)", async () => {
    const parsTable = "tbl_test_exec_pars";
    await Exec.exec(conn, `drop table if exists ${parsTable}`);
    await Exec.exec(
      conn,
      `create table ${parsTable} (
        id int not null auto_increment primary key,
        name varchar(50) not null,
        age int
      )`
    );

    // 插入数据 - 使用参数化查询防止SQL注入
    await Exec.exec(conn, `insert into ${parsTable} (name, age) values (?, ?)`, ["Alice", 25]);
    await Exec.exec(conn, `insert into ${parsTable} (name, age) values (?, ?)`, ["Bob", 30]);
    await Exec.exec(conn, `insert into ${parsTable} (name, age) values (?, ?)`, ["Charlie", 35]);

    // 查询数据 - 验证插入成功
    const [rows] = await conn.query(`select * from ${parsTable} where name = ?`, ["Bob"]);
    expect((rows as any[]).length).to.equal(1);
    expect((rows as any[])[0].name).to.equal("Bob");
    expect((rows as any[])[0].age).to.equal(30);

    // 更新数据 - 使用参数化查询
    await Exec.exec(conn, `update ${parsTable} set age = ? where name = ?`, [31, "Bob"]);
    const [updatedRows] = await conn.query(`select * from ${parsTable} where name = ?`, ["Bob"]);
    expect((updatedRows as any[])[0].age).to.equal(31);

    // 删除数据 - 使用参数化查询
    await Exec.exec(conn, `delete from ${parsTable} where name = ?`, ["Charlie"]);
    const [afterDeleteRows] = await conn.query(`select * from ${parsTable}`);
    expect((afterDeleteRows as any[]).length).to.equal(2);

    // 多参数查询 - 验证多个参数绑定
    const [multiRows] = await conn.query(`select * from ${parsTable} where age > ? and name != ?`, [20, "Alice"]);
    expect((multiRows as any[]).length).to.equal(1);
    expect((multiRows as any[])[0].name).to.equal("Bob");

    // 测试SQL注入防护 - 恶意字符串应被安全转义
    const maliciousName = "'; DROP TABLE " + parsTable + "; --";
    await Exec.exec(conn, `insert into ${parsTable} (name, age) values (?, ?)`, [maliciousName, 99]);
    const [injectionCheck] = await conn.query(`select * from ${parsTable} where name = ?`, [maliciousName]);
    expect((injectionCheck as any[]).length).to.equal(1);

    // 表仍然存在，数据行数应为3（Alice, Bob, 恶意字符串）
    const [finalCount] = await conn.query(`select count(*) as cnt from ${parsTable}`);
    expect((finalCount as any[])[0].cnt).to.equal(3);

    await Exec.exec(conn, `drop table if exists ${parsTable}`);
  });
});
