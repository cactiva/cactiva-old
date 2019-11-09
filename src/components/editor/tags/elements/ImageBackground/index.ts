import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { CactivaTag } from "@src/components/editor/utility/classes";
const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "ImageBackground";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "ImageBackground",
    props: {
      source: {
        kind: SyntaxKind.CallExpression,
        value: `require('@src/assets/images')`
      }
    },
    children: []
  };
  static traits = [
    {
      name: "attributes",
      fields: [
        {
          name: "Source",
          path: "source",
          kind: SyntaxKind.JsxExpression,
          mode: "image",
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
