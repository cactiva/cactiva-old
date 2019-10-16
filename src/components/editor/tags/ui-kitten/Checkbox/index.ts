import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import traitStyle from "@src/components/traits/templates/traitStyle";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "CheckBox";
  static from = "react-native-ui-kitten";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "CheckBox",
    props: {},
    children: [{ kind: SyntaxKind.StringLiteral, value: "CheckBox" }]
  };
  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Status",
          path: "status",
          kind: SyntaxKind.StringLiteral,
          default: "basic",
          mode: "select",
          options: {
            styles: styles,
            items: [
              { value: "primary", label: "Primary" },
              { value: "success", label: "Success" },
              { value: "info", label: "Info" },
              { value: "warning", label: "Warning" },
              { value: "danger", label: "Danger" },
              { value: "basic", label: "Basic" }
            ]
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
