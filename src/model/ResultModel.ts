import { MysqlError } from "mysql";

export class ResultModel {
  public success: boolean;
  public error: MysqlError;
}
