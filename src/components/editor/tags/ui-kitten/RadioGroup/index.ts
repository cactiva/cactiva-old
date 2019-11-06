import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { SyntaxKind } from "../../../utility/syntaxkinds";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};
export default class extends CactivaTag {
  static tagName = "RadioGroup";
  static from = "react-native-ui-kitten";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "RadioGroup",
    props: {},
    children: [
      {
        kind: SyntaxKind.JsxElement,
        name: "Radio",
        props: {
          text: {
            kind: SyntaxKind.StringLiteral,
            value: `"Radio 1"`
          }
        }
      }
    ]
  };
  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Add Radio",
          path: "children",
          kind: SyntaxKind.JsxExpression,
          options: {
            styles: styles
          }
        },
        {
          name: "Selected Index",
          path: "selectedIndex",
          kind: SyntaxKind.NumericLiteral,
          options: {
            styles: styles
          }
        },
        {
          name: "On Change",
          path: "onChange",
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
