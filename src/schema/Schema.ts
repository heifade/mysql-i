import { Select } from "../Select";

import {
  SchemaModel,
  TableSchemaModel,
  ColumnSchemaModel,
  ProcedureSchemaModel,
  ProcedureParSchemaModel
} from "../model/SchemaModel";
import { GlobalCache } from "../global/GlobalCache";
import { Connection } from "mysql";

class SchemaCache {
  private static globalKey = "SchemaModel";
  private static getHash() {
    let hash = GlobalCache.get(SchemaCache.globalKey);
    if (!hash) {
      hash = {};
      GlobalCache.set(SchemaCache.globalKey, hash);
    }
    return hash;
  }
  public static get(key: string) {
    return Reflect.get(SchemaCache.getHash(), key);
  }
  public static set(key: string, value: any) {
    return Reflect.set(SchemaCache.getHash(), key, value);
  }
}

export class Schema {
  public static clear(database: string) {
    SchemaCache.set(database, null);
  }

  public static getSchema(conn: Connection, database: string) {
    return new Promise<SchemaModel>((resolve, reject) => {
      let schemaModel = SchemaCache.get(database);
      if (!schemaModel) {
        schemaModel = new SchemaModel();

        SchemaCache.set(database, schemaModel);

        let sqlTables = `SELECT TABLE_NAME as tableName
          from information_schema.TABLES
          where TABLE_SCHEMA = ? `;

        let sqlColumns = `select TABLE_NAME as tableName,
          COLUMN_NAME as columnName,
          ORDINAL_POSITION as position,
          case COLUMN_KEY when 'PRI' then '1' else '0' end as primaryKey
          from information_schema.COLUMNS
          where TABLE_SCHEMA = ?
          order by tableName, position`;

        let sqlProcedures = `select SPECIFIC_NAME as procedureName
          from
          information_schema.ROUTINES
          where ROUTINE_SCHEMA = ?`;

        let sqlProcedurePars = `select PARAMETER_NAME as parameterName,
          SPECIFIC_NAME as procedureName,
          lower(PARAMETER_MODE) as parameterMode
          from information_schema.PARAMETERS
          where SPECIFIC_SCHEMA = ?
          order by ORDINAL_POSITION`;

        Select.selects(conn, [
          { sql: sqlTables, where: [database] },
          { sql: sqlColumns, where: [database] },
          { sql: sqlProcedures, where: [database] },
          { sql: sqlProcedurePars, where: [database] }
        ]).then(lists => {
          let tableList = lists[0];
          let columnList = lists[1];
          schemaModel.tables = new Array<TableSchemaModel>();
          tableList.map(table => {
            let tableModel = new TableSchemaModel();
            tableModel.name = table.get("tableName");
            tableModel.columns = [];
            schemaModel.tables.push(tableModel);

            columnList
              .filter(
                column => column.get("tableName") === table.get("tableName")
              )
              .map(column => {
                let columnModel = new ColumnSchemaModel();
                columnModel.columnName = column.get("columnName");
                columnModel.primaryKey = column.get("primaryKey") === "1";
                tableModel.columns.push(columnModel);
              });
          });

          let procedureList = lists[2];
          let procedureParsList = lists[3];
          schemaModel.procedures = new Array<ProcedureSchemaModel>();
          procedureList.map(procedure => {
            let procedureModel = new ProcedureSchemaModel();
            procedureModel.name = procedure.get("procedureName");
            procedureModel.pars = [];
            schemaModel.procedures.push(procedureModel);

            procedureParsList
              .filter(
                par =>
                  par.get("procedureName") === procedure.get("procedureName")
              )
              .map(par => {
                let parModel = new ProcedureParSchemaModel();
                parModel.name = par.get("parameterName");
                parModel.parameterMode = par.get("parameterMode");
                procedureModel.pars.push(parModel);
              });
          });

          resolve(schemaModel);
        });
      } else {
        resolve(schemaModel);
      }
    });
  }
}
