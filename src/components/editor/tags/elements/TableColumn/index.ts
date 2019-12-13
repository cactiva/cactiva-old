import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { SyntaxKind } from "../../../utility/syntaxkinds";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "TableColumn";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "TableColumn",
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
