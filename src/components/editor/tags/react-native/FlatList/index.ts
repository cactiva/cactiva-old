import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import traitStyle from "@src/components/traits/templates/traitStyle";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};
export default class extends CactivaTag {
  static tagName = "FlatList";
  static from = "react-native";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "FlatList",
    props: {},
    children: []
  };

  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Data",
          path: "data",
          kind: SyntaxKind.ArrayLiteralExpression,
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
