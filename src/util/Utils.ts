/**
 * 工具
 *
 * @export
 * @class Utils
 */
export class Utils {
  /**
   * 对 SQL 标识符（数据库名、表名、列名等）进行反引号转义，防止 SQL 注入。
   *
   * @static
   * @param {string} identifier - 需要转义的标识符
   * @returns 反引号包裹后的标识符
   * @memberof Utils
   */
  public static escapeIdentifier(identifier: string): string {
    return "`" + identifier.replace(/`/g, "``") + "`";
  }

  /**
   * 合成 数据库.对象（已做反引号转义，防止 SQL 注入）
   *
   * @static
   * @param {string} database - 数据库名称
   * @param {string} objectName - 对象名称
   * @returns 数据库.对象
   * @memberof Utils
   */
  public static getDbObjectName(database: string, objectName: string) {
    return (database ? Utils.escapeIdentifier(database) + "." : "") + Utils.escapeIdentifier(objectName);
  }
}
