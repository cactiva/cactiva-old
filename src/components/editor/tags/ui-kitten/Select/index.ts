import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import TraitStyle from "@src/components/traits/templates/traitStyle";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "Select";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Select",
    props: {
      placeholder: {
        kind: SyntaxKind.StringLiteral,
        value: `"Select"`
      }
    },
    children: []
  };
  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Status",
          path: "status",
          kind: SyntaxKind.StringLiteral,
          mode: "select",
          options: {
            styles: styles,
            items: [
              { value: "primary", label: "Primary" },
              { value: "success", label: "Success" },
              { value: "info", label: "Info" },
              { value: "warning", label: "Warning" },
              { value: "danger", label: "Danger" }
            ]
          }
        },
        {
          name: "Data",
          path: "data",
          kind: SyntaxKind.ArrayLiteralExpression,
          options: {
            styles: styles
          }
        },
        {
          name: "Disabled",
          path: "disabled",
          kind: SyntaxKind.FalseKeyword,
          options: {
            styles: styles
          }
        },
        {
          name: "On Change",
          path: "onChange",
          kind: SyntaxKind.ArrowFunction,
          options: {
            styles: styles
          }
        }
      ]
    },
    ...TraitStyle()
  ];
  static element = require("./element").default;
}
