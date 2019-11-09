import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { SyntaxKind } from "../../../utility/syntaxkinds";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "Button";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Button",
    props: {},
    children: [
      {
        kind: SyntaxKind.JsxElement,
        name: "Text",
        props: {},
        children: [{ kind: SyntaxKind.StringLiteral, value: "Button" }]
      }
    ]
  };
  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Active Opacity",
          path: "activeOpacity",
          kind: SyntaxKind.NumericLiteral,
          default: 0.2,
          options: {
            styles: styles
          }
        },
        {
          name: "Shadow",
          path: "shadow",
          kind: SyntaxKind.FalseKeyword,
          options: {
            styles: styles
          }
        },
        {
          name: "On Press",
          path: "onPress",
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
