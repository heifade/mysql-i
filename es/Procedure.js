"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = require("./schema/Schema");
const Utils_1 = require("./util/Utils");
class Procedure {
    static exec(conn, pars) {
        let database = pars.database || conn.config.database;
        let procedure = pars.procedure;
        if (!procedure) {
            return Promise.reject(new Error(`pars.procedure can not be null or empty!`));
        }
        let data = pars.data;
        return new Promise((resolve, reject) => {
            Schema_1.Schema.getSchema(conn, database).then(schemaModel => {
                let procedureSchemaModel = schemaModel.getProcedureSchemaModel(procedure);
                if (!procedureSchemaModel) {
                    reject(new Error(`procedure '${procedure}' is not exists!`));
                    return;
                }
                let procedureName = Utils_1.Utils.getDbObjectName(database, procedure);
                let parList = new Array();
                let parSQL = "";
                if (data) {
                    data.keys().map((key, index) => {
                        let par = procedureSchemaModel.pars.filter(par => par.name === key.toString())[0];
                        if (par) {
                            if (par.parameterMode === "out") {
                                parSQL += `@${par.name},`;
                            }
                            else {
                                parSQL += "?,";
                                parList.push(data.get(par.name));
                            }
                        }
                    });
                    parSQL = parSQL.replace(/\,$/, "");
                }
                let sql = `call ${procedureName}(${parSQL})`;
                conn.query(sql, parList, (err, results, fields) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(results);
                    }
                });
            });
        });
    }
}
exports.Procedure = Procedure;
//# sourceMappingURL=Procedure.js.map