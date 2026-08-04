import { Connection } from "mysql2/promise";
import { Schema } from "./schema/Schema";
import { Utils } from "./util/Utils";

/**
 * 存储过程
 *
 * @export
 * @class Procedure
 */
export class Procedure {
  /**
   * 执行一个存储过程
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {{
   *       data?: {};
   *       database?: string;
   *       procedure: string;
   *     }} pars
   * @returns Promise对象
   * @memberof Procedure
   */
  public static async exec(
    conn: Connection,
    pars: {
      data?: {};
      database?: string;
      procedure: string;
    }
  ) {
    let database = (pars.database || conn.config.database)!;

    let procedure = pars.procedure;
    if (!procedure) {
      return Promise.reject(
        new Error(`pars.procedure can not be null or empty!`)
      );
    }
    let data = pars.data;

    const schemaModel = await Schema.getSchema(conn, database);

    let procedureSchemaModel = schemaModel!.getProcedureSchemaModel(
      procedure
    );
    if (!procedureSchemaModel) {
      return Promise.reject(new Error(`Procedure '${procedure}' is not exists!`));
    }

    let procedureName = Utils.getDbObjectName(database, procedure);

    let parList = new Array();
    let parSQL = "";

    if (data) {
      Reflect.ownKeys(data).map((key, index) => {
        let par = procedureSchemaModel.pars.filter(
          par => par.name === key.toString()
        )[0];

        if (par) {
          if (par.parameterMode === "out") {
            parSQL += `@${par.name},`;
          } else {
            parSQL += "?,";
            parList.push(Reflect.get(data, par.name));
          }
        }
      });
      parSQL = parSQL.replace(/\,$/, "");
    }

    let sql = `call ${procedureName}(${parSQL})`;

    const [results] = await conn.query(sql, parList);
    return results;
  }
}
