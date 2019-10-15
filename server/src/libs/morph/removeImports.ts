import { SourceFile } from "ts-morph";
import * as _ from "lodash";
export const removeImports = (sf: SourceFile) => {
  const imprts = sf.getImportDeclarations();
  _.map(imprts, (i: any) => {
    i.remove();
  });
};
