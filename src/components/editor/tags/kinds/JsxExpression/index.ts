import { CactivaKind } from "@src/components/editor/utility/classes";

export default class extends CactivaKind {
  static kindName = "JsxExpression";
  static element = require("./element").default;
}
