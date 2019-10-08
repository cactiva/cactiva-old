import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";

export default class extends CactivaTag {
  static tagName = "Component";
  static from = "--any--";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Component",
    props: {},
    children: []
  };
  static traits = [];
  static element = require("./element").default;
}
