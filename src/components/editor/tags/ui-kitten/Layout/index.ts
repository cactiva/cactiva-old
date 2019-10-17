import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { SyntaxKind } from "../../../utility/syntaxkinds";

export default class extends CactivaTag {
  static tagName = "Layout";
  static from = "react-native-ui-kitten";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Layout",
    props: {},
    children: []
  };
  static traits = [
    {
      name: "attributes",
      fields: []
    },
    ...traitStyle(["Typography"])
  ];
  static element = require("./element").default;
}
