import { expect } from "chai";
import "mocha";
import { initTable } from "./DataInit";
import { PoolConnection, Connection } from "mysql";
import { ConnectionHelper, Select, Procedure, Exec, Schema } from "../src/index";
import { connectionConfig } from "./connectionConfig";

describe("Procedure", function() {
  let tableName = "tbl_test_procedure";
  let procedureName = "p_insert_procedure";
  let conn: Connection;

  before(async () => {
    conn = await ConnectionHelper.create(connectionConfig);
    await initTable(conn, tableName, false);
    await Exec.exec(conn, `drop PROCEDURE if exists ${procedureName}`);
    await Exec.exec(
      conn,
      ` CREATE PROCEDURE ${procedureName}(in pId int, in pValue varchar(50), out pOut varchar(50))
          BEGIN
            insert into tbl_test_procedure(id, value) values(pId, pValue);
            set pOut = 'OK1111';
          END
        `
    );

    await Exec.exec(conn, `drop PROCEDURE if exists ${procedureName}_no_par`);
    await Exec.exec(
      conn,
      ` CREATE PROCEDURE ${procedureName}_no_par()
          BEGIN
            insert into tbl_test_procedure(id, value) values(100, '100');
          END
        `
    );
    await Exec.exec(conn, `drop PROCEDURE if exists ${procedureName}_no_par_2`);
    await Exec.exec(
      conn,
      ` CREATE PROCEDURE ${procedureName}_no_par_2()
          BEGIN
            insert into tbl_test_procedure(id, value) values(102, '102');
          END
        `
    );
    Schema.clear(conn.config.database);
  });
  after(async () => {
    await ConnectionHelper.close(conn);
  });

  it("procedure must be success", async () => {
    let insertValue = `value${Math.random()}`;
    let result = await Procedure.exec(conn, {
      data: { pId: 11, pValue: insertValue, pOut: "" },
      procedure: procedureName
    });

    let row = await Select.selectTop1(conn, {
      sql: `select * from ${tableName} where id=?`,
      where: [11]
    });
    expect(Reflect.get(row, "value")).to.equals(insertValue);
  });

  it("when pars.procedure is null", async () => {
    await Procedure.exec(conn, {
      data: { pId: 11, pValue: "111111", pOut: "" },
      procedure: null
    }).catch(err => {
      let errMsg = Reflect.get(err, "message");
      expect(errMsg).to.equal("pars.procedure can not be null or empty!");
    });
  });

  it("when procedure is not exists", async () => {
    let insertValue = `value${Math.random()}`;

    let procedureName = `p_not_exists`;

    await Procedure.exec(conn, {
      data: { pId: 11, pValue: "111111", pOut: "" },
      procedure: procedureName
    }).catch(err => {
      let errMsg = Reflect.get(err, "message");
      expect(errMsg).to.equal(`procedure '${procedureName}' is not exists!`);
    });
  });

  it("when error", async () => {
    let insertValue = `123456789012345678901234567890123456789012345678901234567890`;

    await Procedure.exec(conn, {
      data: {
        pId: 15,
        pValue: insertValue,
        pOut: ""
      },
      procedure: procedureName
    }).catch(err => {
      let errCode = Reflect.get(err, "code");
      expect(errCode).to.equal(`ER_DATA_TOO_LONG`);
    });
  });

  it("procedure with no par should success", async () => {
    await Procedure.exec(conn, {
      procedure: `${procedureName}_no_par`
    });

    let row = await Select.selectTop1(conn, {
      sql: `select * from ${tableName} where id=?`,
      where: [100]
    });
    expect(Reflect.get(row, "value")).to.equals("100");
  });

  it("procedure with other par should success", async () => {
    await Procedure.exec(conn, {
      data: { p1: 1 },
      procedure: `${procedureName}_no_par_2`
    });

    let row = await Select.selectTop1(conn, {
      sql: `select * from ${tableName} where id=?`,
      where: [102]
    });
    expect(Reflect.get(row, "value")).to.equals("102");
  });
});
