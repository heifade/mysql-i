import { expect } from "chai";
import "mocha";
import { initTable } from "./DataInit";
import { PoolConnection, Connection } from "mysql";
import { ConnectionHelper, Update, Select } from "../src/index";
import { connectionConfig } from "./connectionConfig";

describe("Update", function() {
  let tableName = "tbl_test_update";
  let conn: Connection;
  before(async () => {
    conn = await ConnectionHelper.create(connectionConfig);
    await initTable(conn, tableName, false);
  });
  after(async () => {
    await ConnectionHelper.close(conn);
  });

  it("update must be success", async () => {
    let newValue = `value${Math.random()}` + "_newValue1";

    let result = await Update.update(conn, {
      data: { id: 1, value: newValue, vv: null },
      table: tableName
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select * from ${tableName} where id=?`,
      where: [1]
    });

    expect(Reflect.get(rowData, "value")).to.equal(newValue);

    newValue = `value${Math.random()}` + "_newValue2";

    result = await Update.updateByWhere(conn, {
      data: { value: newValue },
      table: tableName,
      where: { id: 2 }
    });

    rowData = await Select.selectTop1(conn, {
      sql: `select * from ${tableName} where id=?`,
      where: [2]
    });

    expect(Reflect.get(rowData, "value")).to.equal(newValue);

    newValue = `value${Math.random()}` + "_newValue3";

    await Update.update(conn, {
      data: { value: newValue },
      table: tableName
    });

    rowData = await Select.selectTop1(conn, {
      sql: `select * from ${tableName}`
    });

    expect(Reflect.get(rowData, "value")).to.equal(newValue);
  });

  it("when pars.data is null of update", async () => {
    await Update.update(conn, {
      data: null,
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal("pars.data can not be null or empty!");
      });
  });

  it("when pars.data is null of updateByWhere", async () => {
    await Update.updateByWhere(conn, {
      data: null,
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal("pars.data can not be null or empty!");
      });
  });

  it("when pars.table is null of update", async () => {
    let insertValue = `value${Math.random()}`;

    await Update.update(conn, {
      data: { value: insertValue },
      table: null
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal("pars.table can not be null or empty!");
      });
  });

  it("when pars.table is null of updateByWhere", async () => {
    let insertValue = `value${Math.random()}`;

    await Update.updateByWhere(conn, {
      data: { value: insertValue },
      table: null
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal("pars.table can not be null or empty!");
      });
  });

  it("when table is not exists of update", async () => {
    let insertValue = `value${Math.random()}`;

    let tableName = `tbl_not_exists`;

    await Update.update(conn, {
      data: { value: insertValue },
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal(`Table '${tableName}' is not exists!`);
      });
  });

  it("when table is not exists of updateByWhere", async () => {
    let insertValue = `value${Math.random()}`;

    let tableName = `tbl_not_exists`;

    await Update.updateByWhere(conn, {
      data: { value: insertValue },
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        let errMsg = Reflect.get(err, "message");
        expect(errMsg).to.equal(`Table '${tableName}' is not exists!`);
      });
  });

  it("update as data with no primary key", async () => {
    let insertValue = `value${Math.random()}_update5`;

    await Update.update(conn, {
      data: {
        value: insertValue
      },
      table: tableName
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select * from ${tableName}`
    });

    expect(Reflect.get(rowData, "value")).to.equal(insertValue);
  });

  it("when error of update", async () => {
    await Update.update(conn, {
      data: {
        id: 1,
        
        value: null
      },
      table: tableName
    })
      // .then(() => {
      //   expect(true).to.be.false; // 进到这里就有问题
      // })
      .catch(err => {
        let errCode = Reflect.get(err, "code");
        expect(errCode).to.be.equal("ER_BAD_NULL_ERROR");
      });
  });

  it("when error of updateByWhere", async () => {
    let insertValue = `123456789012345678901234567890123456789012345678901234567890`;

    await Update.updateByWhere(conn, {
      data: {
        // id: 2,
        id2: 2
      },
      table: tableName,
      where: { id: 2 }
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        let errCode = Reflect.get(err, "code");
        expect(errCode).to.be.equal("ER_PARSE_ERROR");
      });
  });
});
