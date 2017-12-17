import { Save, Exec, SaveType, Schema } from "../src/index";
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
        value varchar(50) not null,
        dateValue datetime
      )`
  );

  Schema.clear(conn.config.database);

  for (let i = 0; i < 10; i++) {
    let data = autoIncrement
      ? { value: `value${Math.random()}` }
      : { id: i, value: `value${Math.random()}` };

    await Save.save(conn, {
      data: data,
      table: tableName,
      saveType: SaveType.insert
    });
  }
};
