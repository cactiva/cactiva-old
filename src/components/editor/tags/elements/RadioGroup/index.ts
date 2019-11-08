import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { SyntaxKind } from "../../../utility/syntaxkinds";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "RadioGroup";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "RadioGroup",
    props: {
      fieldType: { kind: SyntaxKind.StringLiteral, value: `"radio-group"` }
    },
    children: []
  };
  static traits = [
    {
      name: "attributes",
      fields: [
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
          name: "onChange",
          path: "onChange",
          kind: SyntaxKind.ArrowFunction,
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
