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
    const database = (pars.database || conn.config.database)!;

    const procedure = pars.procedure;
    if (!procedure) {
      return Promise.reject(
        new Error(`pars.procedure can not be null or empty!`)
      );
    }
    const data = pars.data;

    const schemaModel = await Schema.getSchema(conn, database);

    const procedureSchemaModel = schemaModel.getProcedureSchemaModel(
      procedure
    );
    if (!procedureSchemaModel) {
      return Promise.reject(new Error(`Procedure '${procedure}' is not exists!`));
    }

    const procedureName = Utils.getDbObjectName(database, procedure);

    const parList = new Array();
    let parSQL = "";
    const outParams: string[] = [];

    if (data) {
      Reflect.ownKeys(data).map((key) => {
        const k = key.toString();
        const par = procedureSchemaModel.pars.find(
          par => par.name === k
        );

        if (par) {
          if (par.parameterMode === "out") {
            const escapedName = Utils.escapeIdentifier(par.name);
            parSQL += `@${escapedName},`;
            outParams.push(`@${escapedName} AS ${escapedName}`);
          } else {
            parSQL += "?,";
            parList.push(Reflect.get(data, par.name));
          }
        }
      });
      parSQL = parSQL.replace(/\,$/, "");
    }

    const sql = `call ${procedureName}(${parSQL})`;

    const [results] = await conn.query(sql, parList);

    // 如果有 OUT 参数，查询 OUT 参数的值并合并到结果中
    if (outParams.length > 0) {
      const selectOutSQL = `SELECT ${outParams.join(", ")}`;
      const [outResults] = await conn.query(selectOutSQL);
      const outValues = (outResults as any[])[0];
      return {
        results,
        outValues
      };
    }

    return results;
  }
}
