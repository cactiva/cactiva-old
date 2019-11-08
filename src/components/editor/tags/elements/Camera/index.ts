import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import TraitStyle from "@src/components/traits/templates/traitStyle";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "Camera";
  static from = "@src/libs";
  static insertTo = "";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Camera",
    props: {
      fieldType: {
        kind: SyntaxKind.StringLiteral,
        value: `"camera"`
      }
    },
    children: []
  };
  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Value",
          path: "value",
          kind: SyntaxKind.JsxExpression,
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
