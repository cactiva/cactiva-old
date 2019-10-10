import { SourceFile, ParenthesizedExpression } from "ts-morph";
import { defaultExport } from "./defaultExport";

export const replaceReturn = (sf: SourceFile, replaceWith: string): string => {
  const ret = defaultExport(sf) as ParenthesizedExpression;

  ret.replaceWithText(replaceWith);

  const result = sf.getText();
  sf.refreshFromFileSystemSync();
  return result;
};
