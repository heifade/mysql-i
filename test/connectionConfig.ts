import { ConnectionOptions } from "mysql2";

export let connectionConfig: ConnectionOptions = {
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "test",
  port: 3306,
  connectTimeout: 60000,
};
