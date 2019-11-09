import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { SyntaxKind } from "../../../utility/syntaxkinds";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "Header";
  static from = "@src/libs";
  static insertTo = "props.rightAction.body";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Header",
    props: {
      rightAction: {
        kind: SyntaxKind.ArrowFunction,
        params: ["{item}:any"],
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
          name: "Title",
          path: "title",
          kind: SyntaxKind.StringLiteral
        },
        {
          name: "Left Action",
          path: "leftAction",
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