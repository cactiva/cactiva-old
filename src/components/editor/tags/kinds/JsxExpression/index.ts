import { CactivaKind } from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";

export default class extends CactivaKind {
  static kindName = "JsxExpression";
  static element = require("./element").default;
  static structure = {
    kind: SyntaxKind.JsxExpression,
    value: "1 + 1"
  };
}
