import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { SyntaxKind } from "../../../utility/syntaxkinds";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "CrudWrapper";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "CrudWrapper",
    props: {},
    children: []
  };
  static traits = [
    {
      name: "data",
      fields: [
        {
          name: "Data",
          path: "data",
          kind: SyntaxKind.JsxExpression,
        }
      ]
    },
    ...traitStyle(["Typography"])
  ];
  static element = require("./element").default;
}
