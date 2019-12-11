import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { SyntaxKind } from "../../../utility/syntaxkinds";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "SimpleTableColumn";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "SimpleTableColumn",
    props: {},
    children: []
  };
  static traits = [
    {
      name: "data",
      fields: [
        {
          name: "Path",
          path: "path",
          kind: SyntaxKind.StringLiteral,
          options: {
            styles: styles
          }
        },
        {
          name: "Title",
          path: "title",
          kind: SyntaxKind.StringLiteral,
          options: {
            styles: styles
          }
        },
        {
          name: "Width",
          path: "width",
          kind: SyntaxKind.NumericLiteral,
        },
      ]
    },
    ...traitStyle()
  ];
  static element = require("./element").default;
}
