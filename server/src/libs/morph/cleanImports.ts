import * as _ from "lodash";
import { SourceFile } from "ts-morph";
export const cleanImports = (sf: SourceFile, imports: any[]) => {
  const imprts = sf.getImportDeclarations();
  _.map(imprts, (i: any) => {
    i.remove();
  });
};
