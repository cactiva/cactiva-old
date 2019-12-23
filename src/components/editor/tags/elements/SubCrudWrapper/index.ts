import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { SyntaxKind } from "../../../utility/syntaxkinds";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "SubCrudWrapper";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "SubCrudWrapper",
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
          name: "Foreign Key",
          path: "foreignKey",
          kind: SyntaxKind.StringLiteral,
          options: {
            styles: styles
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
