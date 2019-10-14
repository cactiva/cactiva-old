import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import traitStyle from "@src/components/traits/templates/traitStyle";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "Button";
  static from = "react-native-ui-kitten";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Button",
    props: {},
    children: [{ kind: SyntaxKind.StringLiteral, value: "Button" }]
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
          name: "Appearance",
          path: "appearance",
          kind: SyntaxKind.StringLiteral,
          default: "filled",
          mode: "select",
          options: {
            styles: styles,
            items: [
              { value: "filled", label: "Filled" },
              { value: "outline", label: "Outline" },
              { value: "ghost", label: "Ghost" }
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
          name: "On Press",
          path: "onPress",
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
