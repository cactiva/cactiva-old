import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { SyntaxKind } from "../../../utility/syntaxkinds";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "Table";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Table",
    props: {},
    children: [
      {
        kind: SyntaxKind.JsxElement,
        name: "TableHead",
        props: {},
        children: [{
          kind: SyntaxKind.JsxElement,
          name: "TableColumn",
          props: {},
          children: [
          ]
        }]
      },
      {
        kind: SyntaxKind.JsxElement,
        name: "TableRow",
        props: {},
        children: [
          {
            kind: SyntaxKind.JsxElement,
            name: "TableColumn",
            props: {},
            children: [
            ]
          }
        ]
      }]
  };
  static traits = [
    {
      name: "data",
      fields: [
        {
          name: "Data",
          path: "data",
          kind: SyntaxKind.JsxExpression,
        },
        {
          name: "Column Mode",
          path: "columnMode",
          kind: SyntaxKind.StringLiteral,
          mode: "select",
          default: 'auto',
          options: {
            styles: styles,
            items: [
              { value: "auto", label: "Auto Generate" },
              { value: "manual", label: "Manual Column" },
            ]
          }
        }
      ]
    },
    ...traitStyle(["Typography"])
  ];
  static element = require("./element").default;
}
