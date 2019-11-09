import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "Image";
  static from = "@src/libs";
  static insertTo = "";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Image",
    props: {
      style: {
        kind: SyntaxKind.ObjectLiteralExpression,
        value: {
          height: {
            kind: SyntaxKind.NumericLiteral,
            value: 80
          },
          width: {
            kind: SyntaxKind.NumericLiteral,
            value: 80
          }
        }
      }
    },
    children: []
  };
  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Source",
          path: "source",
          kind: SyntaxKind.CallExpression,
          mode: "image",
          options: {
            styles
          }
        },
        {
          name: "Resize Mode",
          path: "resizeMode",
          kind: SyntaxKind.StringLiteral,
          mode: "select",
          options: {
            styles: styles,
            items: [
              { value: "cover", label: "Cover" },
              { value: "contain", label: "Contain" },
              { value: "stretch", label: "Stretch" },
              { value: "repeat", label: "Repeat" },
              { value: "center", label: "Center" }
            ]
          }
        },
        {
          name: "Blur Radius",
          path: "blurRadius",
          kind: SyntaxKind.NumericLiteral,
          options: {
            styles
          }
        }
      ]
    },
    ...traitStyle(["Typography"])
  ];
  static element = require("./element").default;
}
