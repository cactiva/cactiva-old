import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { SyntaxKind } from "../../../utility/syntaxkinds";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "TableHead";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "TableHead",
    props: {},
    children: [{
      kind: SyntaxKind.JsxElement,
      name: "TableColumn",
      props: {},
      children: [
      ]
    }]
  };
  static traits = [
    {
      name: "data",
      fields: [
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
