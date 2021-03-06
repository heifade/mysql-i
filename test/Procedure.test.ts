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
    expect(row.value).to.equals(insertValue);
  });

  it("when pars.procedure is null", async () => {
    await Procedure.exec(conn, {
      data: { pId: 11, pValue: "111111", pOut: "" },
      procedure: null
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.message).to.equal("pars.procedure can not be null or empty!");
      });
  });

  it("when procedure is not exists", async () => {
    let insertValue = `value${Math.random()}`;

    let procedureName = `p_not_exists`;

    await Procedure.exec(conn, {
      data: { pId: 11, pValue: "111111", pOut: "" },
      procedure: procedureName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.message).to.equal(`Procedure '${procedureName}' is not exists!`);
      });
  });

  it("when error", async () => {
    await Procedure.exec(conn, {
      data: {
        // pId: 15,
        // pValue: insertValue,
        // pOut: ""
      },
      procedure: procedureName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.code).to.be.equal("ER_SP_WRONG_NO_OF_ARGS");
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
    expect(row.value).to.equals("100");
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
    expect(row.value).to.equals("102");
  });
});
