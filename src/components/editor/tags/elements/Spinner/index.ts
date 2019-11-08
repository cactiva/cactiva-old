import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import traitStyle from "@src/components/traits/templates/traitStyle";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "Spinner";
  static from = "@src/libs";
  static insertTo = "";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Spinner",
    props: {
      size: {
        kind: SyntaxKind.NumericLiteral,
        value: 20
      }
    },
    children: []
  };
  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Size",
          path: "size",
          kind: SyntaxKind.NumericLiteral,
          options: {
            styles
          }
        },
        {
          name: "Color",
          path: "color",
          kind: SyntaxKind.StringLiteral,
          mode: "color",
          options: {
            styles
          }
        }
      ]
    },
    ...traitStyle()
  ];
  static element = require("./element").default;
}
