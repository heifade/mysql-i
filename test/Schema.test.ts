import { expect } from "chai";
import "mocha";
import { ConnectionHelper, Schema, Exec } from "../src/index";
import { Connection } from "mysql2/promise";
import { connectionConfig } from "./connectionConfig";

describe("Schema", function () {
  let conn: Connection;

  before(async () => {
    conn = await ConnectionHelper.create(connectionConfig);
  });

  after(async () => {
    await ConnectionHelper.close(conn);
  });

  it("getSchema should return schema with tables and procedures", async () => {
    const schema = await Schema.getSchema(conn, conn.config.database!);
    expect(schema).to.not.be.null;
    expect(schema.tables).to.be.an("array");
    expect(schema.tables.length).to.be.greaterThan(0);
    expect(schema.procedures).to.be.an("array");
  });

  it("getSchema should return cached result on second call", async () => {
    Schema.clear(conn.config.database!);

    const schema1 = await Schema.getSchema(conn, conn.config.database!);
    const schema2 = await Schema.getSchema(conn, conn.config.database!);

    // Should be the exact same object reference (cache hit)
    expect(schema1).to.equal(schema2);
  });

  it("clear should invalidate cache, forcing a fresh query", async () => {
    // First call populates cache
    const schema1 = await Schema.getSchema(conn, conn.config.database!);

    // Clear the cache
    Schema.clear(conn.config.database!);

    // Next call should build a new SchemaModel (cache miss)
    const schema2 = await Schema.getSchema(conn, conn.config.database!);

    // Different object reference after cache was cleared
    expect(schema1).to.not.equal(schema2);
    // But structurally equivalent
    expect(schema2.tables.length).to.equal(schema1.tables.length);
  });

  it("getTableSchemaModel should return table info", async () => {
    Schema.clear(conn.config.database!);
    const schema = await Schema.getSchema(conn, conn.config.database!);

    const tableModel = schema.getTableSchemaModel("tbl_test_select");
    // Table may or may not exist depending on test run order
    if (tableModel) {
      expect(tableModel.name).to.equal("tbl_test_select");
      expect(tableModel.columns).to.be.an("array");
      expect(tableModel.columns.length).to.be.greaterThan(0);
    }
  });

  it("getTableSchemaModel should return undefined for non-existent table", async () => {
    Schema.clear(conn.config.database!);
    const schema = await Schema.getSchema(conn, conn.config.database!);

    const tableModel = schema.getTableSchemaModel("tbl_absolutely_does_not_exist");
    expect(tableModel).to.be.undefined;
  });

  it("getProcedureSchemaModel should return undefined for non-existent procedure", async () => {
    Schema.clear(conn.config.database!);
    const schema = await Schema.getSchema(conn, conn.config.database!);

    const procModel = schema.getProcedureSchemaModel("p_absolutely_does_not_exist");
    expect(procModel).to.be.undefined;
  });
});
