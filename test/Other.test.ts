import { expect } from "chai";
import "mocha";
import { PoolConnection, Connection } from "mysql";
import { initTable } from "./DataInit";
import { Schema, Utils, Exec, Where, ConnectionHelper } from "../src/index";
import { connectionConfig } from "./connectionConfig";

describe("Other", function() {
  let tableName = "tbl_test_where";
  let conn: Connection;

  before(async () => {
    conn = await ConnectionHelper.create(connectionConfig);

    await Exec.exec(conn, `drop table if exists ${tableName}`);
    await Exec.exec(
      conn,
      `create table ${tableName} (
            id1 int,
            id2 int,
            value1 varchar(100),
            value2 varchar(100),
            primary key(id1, id2)
          )`
    );

    await Schema.clear(conn.config.database);
  });
  after(async () => {
    await ConnectionHelper.close(conn);
  });

  it("Utils.getDbObjectName", async () => {
    let value = Utils.getDbObjectName("a", "b");
    expect(value).to.equal("a.b");

    value = Utils.getDbObjectName("", "b");
    expect(value).to.equal("b");
  });

  it("Where.getWhereSQL", async () => {
    await Schema.getSchema(conn, "test").then(schemaModel => {
      let tableSchemaModel = schemaModel.getTableSchemaModel(tableName);

      let { whereSQL: whereSQL1, whereList: whereList1 } = Where.getWhereSQL({ id1: 1, id2: 2 }, tableSchemaModel);

      expect(whereSQL1.trim()).to.equal("where id1 = ? and id2 = ?");
      expect(whereList1 != null && whereList1.length == 2 && whereList1[0] == 1 && whereList1[1] == 2).to.be.true;

      let { whereSQL: whereSQL2, whereList: whereList2 } = Where.getWhereSQL(null, tableSchemaModel);

      expect(whereSQL2.trim()).to.equal("");
      expect(whereList2 != null && whereList2.length == 0).to.be.true;

      let { whereSQL: whereSQL3, whereList: whereList3 } = Where.getWhereSQL({ id1: 1, id2: 2, id3: 3 }, tableSchemaModel);

      expect(whereSQL3.trim()).to.equal("where id1 = ? and id2 = ?");
      expect(whereList3 != null && whereList3.length == 2 && whereList3[0] == 1 && whereList3[1] == 2).to.be.true;
    });
  });
});
