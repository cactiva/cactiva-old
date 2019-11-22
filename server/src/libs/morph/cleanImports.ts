import { SourceFile } from "ts-morph";
import * as _ from "lodash";
export const cleanImports = (sf: SourceFile, imports: any[]) => {
  console.log(imports);
  const imprts = sf.getImportDeclarations();
  _.map(imprts, (i: any) => {
    i.remove();
  });
};
