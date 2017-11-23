"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const SaveType_1 = require("./model/SaveType");
const Insert_1 = require("./Insert");
const Update_1 = require("./Update");
const Delete_1 = require("./Delete");
const Replace_1 = require("./Replace");
class Save {
    static save(conn, pars) {
        switch (pars.saveType) {
            case SaveType_1.SaveType.insert: {
                return Insert_1.Insert.insert(conn, {
                    data: pars.data,
                    database: pars.database,
                    table: pars.table
                });
            }
            case SaveType_1.SaveType.update: {
                return Update_1.Update.update(conn, {
                    data: pars.data,
                    database: pars.database,
                    table: pars.table
                });
            }
            case SaveType_1.SaveType.delete: {
                return Delete_1.Delete.delete(conn, {
                    where: pars.data,
                    database: pars.database,
                    table: pars.table
                });
            }
            case SaveType_1.SaveType.replace: {
                return Replace_1.Replace.replace(conn, {
                    data: pars.data,
                    database: pars.database,
                    table: pars.table
                });
            }
        }
    }
    static saves(conn, list) {
        return new Promise((resolve, reject) => {
            let promiseList = new Array();
            list.map(h => {
                promiseList.push(Save.save(conn, {
                    data: h.data,
                    database: h.database,
                    table: h.table,
                    saveType: h.saveType
                }));
            });
            Promise.all(promiseList)
                .then(result => {
                resolve(result);
            })
                .catch(err => {
                reject(err);
            });
        });
    }
    static savesSeq(conn, list) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let item of list) {
                yield Save.save(conn, item);
            }
        });
    }
}
exports.Save = Save;
//# sourceMappingURL=Save.js.map