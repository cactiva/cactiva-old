import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import traitStyle from "@src/components/traits/templates/traitStyle";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "TimePicker";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "TimePicker",
    props: {
      type: {
        kind: SyntaxKind.StringLiteral,
        value: `"time"`
      }
    },
    children: []
  };
  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Value",
          path: "value",
          kind: SyntaxKind.JsxExpression,
          options: {
            styles: styles
          }
        }
      ]
    },
    ...traitStyle()
  ];
  static element = require("./element").default;
}
