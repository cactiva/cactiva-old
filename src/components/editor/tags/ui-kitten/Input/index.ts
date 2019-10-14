import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import TraitStyle from "@src/components/traits/templates/traitStyle";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "Input";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Input",
    props: {
      placeholder: {
        kind: SyntaxKind.StringLiteral,
        value: `"Input"`
      }
    },
    children: []
  };
  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Label",
          path: "label",
          kind: SyntaxKind.StringLiteral,
          options: {
            styles: styles
          }
        },
        {
          name: "Placeholder",
          path: "placeholder",
          kind: SyntaxKind.StringLiteral,
          default: "Input",
          options: {
            styles: styles
          }
        },
        {
          name: "Value",
          path: "value",
          kind: SyntaxKind.CactivaCode,
          options: {
            styles: styles
          }
        },
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
          name: "Size",
          path: "size",
          kind: SyntaxKind.StringLiteral,
          default: "medium",
          mode: "select",
          options: {
            styles: styles,
            items: [
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" }
            ]
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
          name: "Auto Focus",
          path: "autoFocus",
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
        },
        {
          name: "On Blur",
          path: "onBlur",
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
