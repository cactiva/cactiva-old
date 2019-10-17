import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import traitStyle from "@src/components/traits/templates/traitStyle";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "TopNavigation";
  static from = "react-native-ui-kitten";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "TopNavigation",
    props: {},
    children: [{ kind: SyntaxKind.StringLiteral, value: "TopNavigation" }]
  };
  static traits = [
    {
      name: "attributes",
      fields: []
    },
    ...traitStyle()
  ];
  static element = require("./element").default;
}
