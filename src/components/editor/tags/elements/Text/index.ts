import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import traitStyle from "@src/components/traits/templates/traitStyle";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "Text";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Text",
    props: {},
    children: [{ kind: SyntaxKind.StringLiteral, value: "Text" }]
  };
  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Text",
          path: "children.0.value",
          kind: SyntaxKind.StringLiteral
        },
        {
          name: "Ellipsize Mode",
          path: "ellipsizeMode",
          kind: SyntaxKind.StringLiteral,
          mode: "select",
          options: {
            styles: styles,
            items: [
              { value: "head", label: "Head" },
              { value: "middle", label: "Middle" },
              { value: "tail", label: "Tail" },
              { value: "chip", label: "Chip" }
            ]
          }
        }
      ]
    },
    ...traitStyle()
  ];
  static element = require("./element").default;
}
