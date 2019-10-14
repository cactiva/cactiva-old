import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import TraitStyle from "@src/components/traits/templates/traitStyle";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "TextInput";
  static from = "react-native";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "TextInput",
    props: {
      placeholder: {
        kind: SyntaxKind.StringLiteral,
        value: `"TextInput"`
      }
    },
    children: []
  };
  static traits = [
    {
      name: "attributes",
      fields: [
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
          name: "Default Value",
          path: "defaultValue",
          kind: SyntaxKind.StringLiteral,
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
          name: "Auto Capitalize",
          path: "autoCapitalize",
          kind: SyntaxKind.StringLiteral,
          default: "sentences",
          mode: "select",
          options: {
            styles: styles,
            items: [
              { value: "none", label: "None" },
              { value: "characters", label: "Characters" },
              { value: "words", label: "Words" },
              { value: "sentences", label: "Sentences" }
            ]
          }
        },
        {
          name: "Max Length",
          path: "maxLength",
          kind: SyntaxKind.NumericLiteral,
          options: {
            styles: styles
          }
        },
        {
          name: "Multiline",
          path: "multiline",
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
          name: "Editable",
          path: "editable",
          kind: SyntaxKind.TrueKeyword,
          options: {
            styles: styles
          }
        },
        {
          name: "Auto Correct",
          path: "autoCorrect",
          kind: SyntaxKind.FalseKeyword,
          options: {
            styles: styles
          }
        },
        {
          name: "Keyboard Type",
          path: "keyboardType",
          kind: SyntaxKind.StringLiteral,
          default: "default",
          mode: "select",
          options: {
            styles: styles,
            items: [
              { value: "default", label: "Default" },
              { value: "number-pad", label: "Number-pad" },
              { value: "decimal-pad", label: "Decimal-pad" },
              { value: "numeric", label: "Numeric" },
              { value: "email-address", label: "Email-address" },
              { value: "phone-pad", label: "Phone-pad" }
            ]
          }
        },
        {
          name: "Return Key Type",
          path: "returnKeyType",
          kind: SyntaxKind.StringLiteral,
          mode: "select",
          options: {
            styles: styles,
            items: [
              { value: "done", label: "Done" },
              { value: "go", label: "Go" },
              { value: "next", label: "Next" },
              { value: "search", label: "Search" },
              { value: "send", label: "Send" }
            ]
          }
        },
        {
          name: "Placeholder Text Color",
          path: "placeholderTextColor",
          kind: SyntaxKind.StringLiteral,
          mode: "color",
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
