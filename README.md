# mysql-i

[![NPM version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][npm-url]
[![Build Status](https://travis-ci.org/heifade/mysql-i.svg?branch=master)](https://travis-ci.org/heifade/mysql-i)
[![Coverage Status](https://coveralls.io/repos/github/heifade/mysql-i/badge.svg?branch=master)](https://coveralls.io/github/heifade/mysql-i?branch=master)

[npm-image]: https://img.shields.io/npm/v/mysql-i.svg?style=flat-square
[npm-url]: https://npmjs.org/package/mysql-i
[downloads-image]: https://img.shields.io/npm/dm/mysql-i.svg

基于 [mysql2](https://github.com/sidorares/node-mysql2) 封装的 Promise 风格 MySQL 工具库。

## 主要特性

- **Promise / async-await** — 告别回调，代码更清晰
- **多数据库支持** — 自由切换目标数据库
- **完整 CRUD** — 插入、更新、删除、替换、查询、分页
- **事务封装** — 手动事务与内置事务方法
- **连接池** — 互斥锁保护的初始化 / 关闭流程
- **存储过程** — 支持 IN / OUT 参数
- **Schema 缓存** — 自动读取 `information_schema` 并缓存
- **自动填充** — 自动写入 `createDate`、`updateDate`、`createBy`、`updateBy`
- **TypeScript** — 完整类型定义

## 安装

```bash
npm install mysql-i
```

## 快速开始

```ts
import { ConnectionHelper, Exec, Insert, Select } from "mysql-i";

const conn = await ConnectionHelper.create({
  host: "127.0.0.1",
  user: "root",
  password: "your_password",
  database: "test",
  port: 3306,
});

await Exec.exec(conn, `
  create table if not exists tbl_user (
    id int not null auto_increment primary key,
    name varchar(50) not null,
    email varchar(100)
  )
`);

await Insert.insert(conn, {
  data: { name: "Alice", email: "alice@example.com" },
  table: "tbl_user",
});

const users = await Select.select(conn, {
  sql: `select * from tbl_user where name = ?`,
  where: ["Alice"],
});
console.log(users);

await ConnectionHelper.close(conn);
```

## 连接

### ConnectionHelper — 单连接

```ts
import { ConnectionHelper } from "mysql-i";

// 创建连接
const conn = await ConnectionHelper.create({
  host: "127.0.0.1",
  user: "root",
  password: "your_password",
  database: "test",
  port: 3306,
});

// 关闭连接（conn 为 null/undefined 时不报错）
await ConnectionHelper.close(conn);
```

### ConnectionPool — 连接池

```ts
import { ConnectionPool } from "mysql-i";

// 初始化连接池（重复调用安全，旧池会自动关闭）
await ConnectionPool.init({
  host: "127.0.0.1",
  user: "root",
  password: "your_password",
  database: "test",
  connectionLimit: 10,
});

// 从池中获取连接
const conn = await ConnectionPool.getConnection();
try {
  // ... 使用 conn 进行操作
} finally {
  // 释放连接回池（conn 为 null/已关闭时不报错）
  await ConnectionPool.closeConnection(conn);
}

// 关闭连接池
await ConnectionPool.closePool();
```

## CRUD

### Insert — 插入

```ts
import { Insert } from "mysql-i";

const { insertId } = await Insert.insert(conn, {
  data: { name: "Bob", email: "bob@example.com" },
  table: "tbl_user",
});
// 相当于: insert into `test`.`tbl_user` set name='Bob', email='bob@example.com'
```

> 字段过滤：`data` 中不在表结构内的字段会自动忽略。

### Update — 更新

```ts
import { Update } from "mysql-i";

// 按主键更新
await Update.update(conn, {
  data: { id: 1, name: "Alice2" },  // id 是主键，不出现在 SET 中
  table: "tbl_user",
});
// 相当于: update `test`.`tbl_user` set name='Alice2' where id=1

// 按条件更新（可更新主键）
await Update.updateByWhere(conn, {
  data: { name: "Alice3" },
  where: { id: 1 },
  table: "tbl_user",
});
```

> ⚠️ `update()` 当仅传入主键字段或无匹配字段时会抛出 `"no fields to update"` 错误。
> ⚠️ `updateByWhere()` 当条件无法匹配到任何实际列时会抛出 `"no valid where conditions"` 错误。

### Delete — 删除

```ts
import { Delete } from "mysql-i";

// 按主键删除
await Delete.delete(conn, {
  data: { id: 1 },
  table: "tbl_user",
});

// 按条件删除
await Delete.deleteByWhere(conn, {
  where: { name: "Alice" },
  table: "tbl_user",
});
```

> ⚠️ `deleteByWhere()` 传入空条件 `{}` 或 `null` 会抛出错误，防止意外全表删除。

### Replace — 替换

```ts
import { Replace } from "mysql-i";

// 主键存在则更新，不存在则插入
await Replace.replace(conn, {
  data: { id: 1, name: "Alice_Replaced" },
  table: "tbl_user",
});
```

### Save — 统一保存入口

```ts
import { Save, SaveType } from "mysql-i";

// 单条保存
await Save.save(conn, {
  data: { id: 1, name: "Alice" },
  table: "tbl_user",
  saveType: SaveType.insert, // 1=insert, 2=update, 3=delete, 4=replace
});

// 并发批量保存
await Save.saves(conn, [
  { data: { name: "A" }, table: "tbl_user", saveType: SaveType.insert },
  { data: { name: "B" }, table: "tbl_user", saveType: SaveType.insert },
]);

// 顺序批量保存
await Save.savesSeq(conn, list);

// 并发批量 + 事务
await Save.savesWithTran(conn, list);

// 顺序批量 + 事务
await Save.savesSeqWithTran(conn, list);
```

> `saves` / `savesSeq` 也支持传入 `pars: { saveDate, saveBy }` 统一指定自动填充值。

## 查询

### Select — 基础查询

```ts
import { Select } from "mysql-i";

// 查询多行
const rows = await Select.select(conn, {
  sql: `select * from tbl_user where id > ?`,
  where: [0],
});

// 查询第一行（无结果返回 null）
const row = await Select.selectTop1(conn, {
  sql: `select * from tbl_user where id = ?`,
  where: [1],
});

// 查询多行（并发）
const [rows1, rows2] = await Select.selects(conn, [
  { sql: `select * from tbl_user where id = ?`, where: [1] },
  { sql: `select * from tbl_user where id = ?`, where: [2] },
]);
```

### 聚合与单值

```ts
// 计数
const count = await Select.selectCount(conn, {
  sql: `select * from tbl_user where id > ?`,
  where: [0],
});

// 第一行第一列的值（无结果返回 null）
const name = await Select.selectOneValue(conn, {
  sql: `select name from tbl_user where id = ?`,
  where: [1],
});

// 获取 UUID
const guid = await Select.selectGUID(conn);
```

### 分页查询

```ts
const result = await Select.selectSplitPage(conn, {
  sql: `select * from tbl_user`,
  pageSize: 10,  // 每页行数（必须为正整数）
  index: 1,      // 当前页（从 1 开始；<=0 视为 1）
});

console.log(result.count); // 总行数
console.log(result.list);  // 当前页数据
```

## 事务

```ts
import { Transaction, Save, SaveType } from "mysql-i";

try {
  await Transaction.begin(conn);

  await Save.save(conn, {
    data: { name: "Alice" },
    table: "tbl_user",
    saveType: SaveType.insert,
  });
  await Save.save(conn, {
    data: { name: "Bob" },
    table: "tbl_user",
    saveType: SaveType.insert,
  });

  await Transaction.commit(conn);
} catch (err) {
  await Transaction.rollback(conn);
  throw err;
}
```

## 执行原生 SQL

```ts
import { Exec } from "mysql-i";

// 单条
await Exec.exec(conn, `drop table if exists tbl_tmp`);

// 并发多条
await Exec.execs(conn, [
  `create table tbl_tmp (id int)`,
  `create table tbl_tmp2 (id int)`,
]);

// 顺序多条
await Exec.execsSeq(conn, [
  `insert into tbl_tmp values (1)`,
  `insert into tbl_tmp values (2)`,
]);

// 顺序多条 + 事务
await Exec.execsSeqWithTran(conn, [
  `insert into tbl_tmp values (3)`,
  `insert into tbl_tmp values (4)`,
]);
```

## 存储过程

```ts
import { Procedure } from "mysql-i";

// 假设已创建存储过程:
// create procedure p_add_user(in pName varchar(50), in pEmail varchar(100), out pId int)
//   begin
//     insert into tbl_user(name, email) values(pName, pEmail);
//     set pId = last_insert_id();
//   end

const result = await Procedure.exec(conn, {
  procedure: "p_add_user",
  data: { pName: "Alice", pEmail: "alice@example.com", pId: 0 },
});

// 有 OUT 参数时返回 { results, outValues }
console.log(result.outValues.pId); // 新插入行的 id
```

> 仅 IN 参数的存储过程直接返回查询结果；含 OUT 参数时返回 `{ results, outValues }` 对象。

## 自动填充

当表中存在以下列时，`Insert` / `Update` / `Replace` 会自动填充对应值：

| 列名 | 触发时机 | 默认值 | 可被 `saveDate` / `saveBy` 覆盖 |
|---|---|---|---|
| `createDate` | INSERT | `new Date()` | ✅ |
| `updateDate` | INSERT / UPDATE | `new Date()` | ✅ |
| `createBy` | INSERT | 不填充 | ✅（`saveBy`） |
| `updateBy` | UPDATE | 不填充 | ✅（`saveBy`） |

```ts
await Insert.insert(conn, {
  data: { name: "Alice" },
  table: "tbl_user",
  saveDate: "2026-01-01 00:00:00", // 覆盖 createDate / updateDate
  saveBy: "admin",                 // 覆盖 createBy / updateBy
});
```

> 如果 `data` 中已显式提供了 `createDate` / `updateDate` / `createBy` / `updateBy` 的值，则不会自动覆盖。

## Schema 缓存

首次对某个数据库执行 CRUD 操作时，`mysql-i` 会自动查询 `information_schema` 获取表结构、主键、存储过程等元信息并缓存。后续调用直接命中缓存。

```ts
import { Schema } from "mysql-i";

// 清空缓存（在 DDL 修改表结构后调用）
Schema.clear("test");
```

## 指定数据库

所有 CRUD 方法都支持 `database` 参数，跨库操作无需切换连接：

```ts
await Insert.insert(conn, {
  data: { name: "Alice" },
  database: "other_db", // 不传则使用连接配置中的 database
  table: "tbl_user",
});
```

## API 总览

| 模块 | 方法 | 说明 |
|---|---|---|
| **ConnectionHelper** | `create(config)` | 创建数据库连接 |
| | `close(conn?)` | 关闭连接 |
| **ConnectionPool** | `init(config)` | 初始化连接池 |
| | `getConnection()` | 获取池中连接 |
| | `closeConnection(conn?)` | 释放连接回池 |
| | `closePool()` | 关闭连接池 |
| **Insert** | `insert(conn, pars)` | 插入一条数据 |
| **Update** | `update(conn, pars)` | 按主键更新 |
| | `updateByWhere(conn, pars)` | 按条件更新 |
| **Delete** | `delete(conn, pars)` | 按主键删除 |
| | `deleteByWhere(conn, pars)` | 按条件删除 |
| **Replace** | `replace(conn, pars)` | 按主键替换 |
| **Save** | `save(conn, pars)` | 单条保存 |
| | `saves(conn, list, pars?)` | 并发批量 |
| | `savesSeq(conn, list, pars?)` | 顺序批量 |
| | `savesWithTran(conn, list, pars?)` | 并发批量 + 事务 |
| | `savesSeqWithTran(conn, list, pars?)` | 顺序批量 + 事务 |
| **Select** | `select(conn, param)` | 查询多行 |
| | `selects(conn, params)` | 并发查询 |
| | `selectTop1(conn, param)` | 查询第一行 |
| | `selectOneValue(conn, param)` | 查询第一行第一列 |
| | `selectCount(conn, param)` | 计数 |
| | `selectSplitPage(conn, param)` | 分页查询 |
| | `selectGUID(conn)` | 获取 UUID |
| **Exec** | `exec(conn, sql)` | 执行单条 SQL |
| | `execs(conn, sqls)` | 并发执行 |
| | `execsSeq(conn, sqls)` | 顺序执行 |
| | `execsSeqWithTran(conn, sqls)` | 顺序执行 + 事务 |
| **Transaction** | `begin(conn)` | 开启事务 |
| | `commit(conn)` | 提交事务 |
| | `rollback(conn)` | 回滚事务 |
| **Procedure** | `exec(conn, pars)` | 执行存储过程 |
| **Schema** | `getSchema(conn, db)` | 获取 Schema 缓存 |
| | `clear(db)` | 清空 Schema 缓存 |

## 许可证

MIT
