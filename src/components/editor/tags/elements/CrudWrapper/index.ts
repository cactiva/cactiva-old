import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { SyntaxKind } from "../../../utility/syntaxkinds";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "CrudWrapper";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "CrudWrapper",
    props: {},
    children: []
  };
  static traits = [
    {
      name: "data",
      fields: [
        {
          name: "Data",
          path: "data",
          kind: SyntaxKind.JsxExpression,
          options: {
            styles
          }
        },
        {
          name: "On Change",
          path: "onChange",
          kind: SyntaxKind.ArrowFunction,
          options: {
            styles
          }
        },
        {
          name: "Template",
          path: "template",
          kind: SyntaxKind.CallExpression,
          options: {
            styles
          }
        },
        {
          name: "ID Key",
          path: "idKey",
          default: 'id',
          kind: SyntaxKind.StringLiteral,
          options: {
            styles: styles
          }
        },
        {
          name: "Item Per Page",
          path: "itemPerPage",
          default: 25,
          kind: SyntaxKind.NumericLiteral,
        },
      ]
    },
    ...traitStyle(["Typography"])
  ];
  static element = require("./element").default;
}
