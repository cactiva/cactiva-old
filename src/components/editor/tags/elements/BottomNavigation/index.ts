import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { SyntaxKind } from "../../../utility/syntaxkinds";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "View";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "View",
    props: {},
    children: []
  };
  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Type",
          path: "viewType",
          kind: SyntaxKind.StringLiteral,
          mode: "select",
          default: "View",
          options: {
            styles: styles,
            items: [
              { value: "View", label: "View" },
              { value: "SafeAreaView", label: "Safe Area View" },
              { value: "AnimatedView", label: "Animated View" }
            ]
          }
        }
      ]
    },
    ...traitStyle(["Typography"])
  ];
  static element = require("./element").default;
}
