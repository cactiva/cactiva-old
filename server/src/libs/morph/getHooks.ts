import { SourceFile } from "ts-morph";
import * as _ from "lodash";
import { defaultExport, defaultExportShallow } from "./defaultExport";
import { parseJsx } from "./parseJsx";
export const getHooks = (sf: SourceFile) => {
  const de = defaultExportShallow(sf);
  const stmts = _.get(de, "compilerNode.statements", []);
  return stmts.map((s: any) => {
    return parseJsx(_.get(s, "declarationList.declarations.0", {}));
  });
};
