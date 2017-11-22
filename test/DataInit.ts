import { Save } from "../src/Save";
import { Exec } from "../src/Exec";
import { RowDataModel } from "../src/model/RowDataModel";
import { SaveType } from "../src/index";
import { Schema } from "../src/schema/Schema";
import { Connection } from "mysql";

export let initTable = async function(
  conn: Connection,
  tableName: string,
  autoIncrement: boolean
) {
  await Exec.exec(conn, `drop table if exists ${tableName}`);
  await Exec.exec(
    conn,
    `create table ${tableName} (
        id int not null ${autoIncrement ? "auto_increment" : ""} primary key,
        value varchar(50),
        dateValue datetime
      )`
  );

  Schema.clear(conn.config.database);

  for (let i = 0; i < 10; i++) {
    let data = autoIncrement
      ? RowDataModel.create({ value: `value${Math.random()}` })
      : RowDataModel.create({ id: i, value: `value${Math.random()}` });

    await Save.save(conn, {
      data: data,
      table: tableName,
      saveType: SaveType.insert
    });
  }
};
