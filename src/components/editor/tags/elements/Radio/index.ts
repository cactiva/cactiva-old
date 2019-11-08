import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import traitStyle from "@src/components/traits/templates/traitStyle";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "Radio";
  static from = "@src/libs";
  static insertTo = "";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Radio",
    props: { text: { kind: SyntaxKind.StringLiteral, value: `"Radio"` } },
    children: []
  };
  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Text",
          path: "text",
          kind: SyntaxKind.StringLiteral,
          options: {
            styles: styles
          }
        },
        {
          name: "Mode",
          path: "mode",
          kind: SyntaxKind.StringLiteral,
          mode: "select",
          default: "default",
          options: {
            styles: styles,
            items: [
              { value: "default", label: "Default" },
              { value: "checkbox", label: "Checkbox" }
            ]
          }
        },
        {
          name: "Value",
          path: "value",
          kind: SyntaxKind.StringLiteral,
          options: {
            styles: styles
          }
        },
        {
          name: "Checked",
          path: "checked",
          kind: SyntaxKind.FalseKeyword,
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
    ...traitStyle()
  ];
  static element = require("./element").default;
}
