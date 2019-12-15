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
  static insertTo = "";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Select",
    props: {
      placeholder: {
        kind: SyntaxKind.StringLiteral,
        value: `"Select"`
      },
      items: {
        kind: SyntaxKind.ArrayLiteralExpression,
        value: [
          {
            kind: SyntaxKind.ObjectLiteralExpression,
            value: {
              text: {
                kind: SyntaxKind.StringLiteral,
                value: `"option"`
              },
              value: {
                kind: SyntaxKind.StringLiteral,
                value: `"option"`
              }
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
          name: "Items",
          path: "items",
          kind: SyntaxKind.JsxExpression,
          options: {
            styles: styles
          }
        },
        {
          name: "Text Path",
          path: "textPath",
          kind: SyntaxKind.JsxExpression,
          default: 'text',
          options: {
            styles: styles
          }
        },
        {
          name: "Value Path",
          path: "valuePath",
          default: 'value',
          kind: SyntaxKind.JsxExpression,
          options: {
            styles: styles
          }
        },
        {
          name: "Placeholder",
          path: "placeholder",
          kind: SyntaxKind.StringLiteral,
          default: "TextInput",
          options: {
            styles: styles
          }
        },
        {
          name: "Value",
          path: "value",
          kind: SyntaxKind.JsxExpression,
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
          name: "Editable",
          path: "editable",
          kind: SyntaxKind.TrueKeyword,
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
