import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { SyntaxKind } from "../../../utility/syntaxkinds";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "SimpleTable";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "SimpleTable",
    props: {},
    children: []
  };
  static traits = [
    {
      name: "data",
      fields: [
        {
          name: "Data",
          path: "data",
          kind: SyntaxKind.JsxExpression,
        }
      ]
    },
    ...traitStyle() 
  ];
  static element = require("./element").default;
}
