export class Utils {
  public static getDbObjectName(database: string, objectName: string) {
    return (database ? database + "." : "") + objectName;
  }
}
