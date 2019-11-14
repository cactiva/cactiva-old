import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import traitStyle from "@src/components/traits/templates/traitStyle";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};
export default class extends CactivaTag {
  static tagName = "Carousel";
  static from = "@src/libs";
  static insertTo = "props.renderItem.body";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Carousel",
    props: {
      data: {
        kind: SyntaxKind.ArrayLiteralExpression,
        value: []
      },
      renderItem: {
        kind: SyntaxKind.ArrowFunction,
        params: ["{item, index}:any"],
        body: [
          {
            kind: SyntaxKind.ParenthesizedExpression,
            value: {
              kind: SyntaxKind.JsxElement,
              name: "View",
              props: {},
              children: []
            }
          }
        ]
      }
    },
    children: []
  };
  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Data",
          path: "data",
          kind: SyntaxKind.ArrayLiteralExpression,
          options: {
            styles: styles
          }
        },
        {
          name: "Pagination",
          path: "isPagination",
          kind: SyntaxKind.FalseKeyword,
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
