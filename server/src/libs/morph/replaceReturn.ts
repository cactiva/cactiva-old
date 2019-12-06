import { SourceFile, ParenthesizedExpression } from "ts-morph";
import { defaultExport } from "./defaultExport";

export const replaceReturn = async (sf: SourceFile, replaceWith: string): Promise<string> => {
  const ret = defaultExport(sf) as ParenthesizedExpression;
  ret.replaceWithText(replaceWith);
  const result = sf.getText();
  return result;
};
