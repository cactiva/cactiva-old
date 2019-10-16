import { CactivaKind } from "@src/components/editor/utility/classes";

export default class extends CactivaKind {
  static kindName = "ParenthesizedExpression";
  static element = require("./element").default;
}
