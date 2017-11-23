"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Select_1 = require("../Select");
const SchemaModel_1 = require("../model/SchemaModel");
const GlobalCache_1 = require("../global/GlobalCache");
class SchemaCache {
    static getHash() {
        let hash = GlobalCache_1.GlobalCache.get(SchemaCache.globalKey);
        if (!hash) {
            hash = {};
            GlobalCache_1.GlobalCache.set(SchemaCache.globalKey, hash);
        }
        return hash;
    }
    static get(database) {
        return Reflect.get(SchemaCache.getHash(), database);
    }
    static set(database, value) {
        return Reflect.set(SchemaCache.getHash(), database, value);
    }
}
SchemaCache.globalKey = "SchemaModel";
exports.SchemaCache = SchemaCache;
class Schema {
    static clear(database) {
        SchemaCache.set(database, null);
    }
    static getSchema(conn, database) {
        return new Promise((resolve, reject) => {
            let schemaModel = SchemaCache.get(database);
            if (!schemaModel) {
                schemaModel = new SchemaModel_1.SchemaModel();
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
                Select_1.Select.selects(conn, [
                    { sql: sqlTables, where: [database] },
                    { sql: sqlColumns, where: [database] },
                    { sql: sqlProcedures, where: [database] },
                    { sql: sqlProcedurePars, where: [database] }
                ]).then(lists => {
                    let tableList = lists[0];
                    let columnList = lists[1];
                    schemaModel.tables = new Array();
                    tableList.map(table => {
                        let tableModel = new SchemaModel_1.TableSchemaModel();
                        tableModel.name = table.get("tableName");
                        tableModel.columns = [];
                        schemaModel.tables.push(tableModel);
                        columnList
                            .filter(column => column.get("tableName") === table.get("tableName"))
                            .map(column => {
                            let columnModel = new SchemaModel_1.ColumnSchemaModel();
                            columnModel.columnName = column.get("columnName");
                            columnModel.primaryKey = column.get("primaryKey") === "1";
                            tableModel.columns.push(columnModel);
                        });
                    });
                    let procedureList = lists[2];
                    let procedureParsList = lists[3];
                    schemaModel.procedures = new Array();
                    procedureList.map(procedure => {
                        let procedureModel = new SchemaModel_1.ProcedureSchemaModel();
                        procedureModel.name = procedure.get("procedureName");
                        procedureModel.pars = [];
                        schemaModel.procedures.push(procedureModel);
                        procedureParsList
                            .filter(par => par.get("procedureName") === procedure.get("procedureName"))
                            .map(par => {
                            let parModel = new SchemaModel_1.ProcedureParSchemaModel();
                            parModel.name = par.get("parameterName");
                            parModel.parameterMode = par.get("parameterMode");
                            procedureModel.pars.push(parModel);
                        });
                    });
                    SchemaCache.set(database, schemaModel);
                    resolve(schemaModel);
                });
            }
            else {
                resolve(schemaModel);
            }
        });
    }
}
exports.Schema = Schema;
//# sourceMappingURL=Schema.js.map