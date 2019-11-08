import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { SyntaxKind } from "../../../utility/syntaxkinds";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "Form";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Form",
    props: {},
    children: []
  };
  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Data",
          path: "data",
          kind: SyntaxKind.JsxExpression,
          options: {
            styles: styles
          }
        },
        {
          name: "Set Value",
          path: "setValue",
          kind: SyntaxKind.ArrowFunction,
          options: {
            styles: styles
          }
        }
      ]
    },
    ...traitStyle(["Typography"])
  ];
  static element = require("./element").default;
}
