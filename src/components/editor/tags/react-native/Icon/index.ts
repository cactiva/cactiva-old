import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import { CactivaTag } from "@src/components/editor/utility/classes";
import traitStyle from "@src/components/traits/templates/traitStyle";
import { IconMaps } from "@src/components/traits/kinds/components/IconMaps";
import _ from "lodash";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = "Icon";
  static from = "@src/libs";
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: "Icon",
    props: {
      source: {
        kind: SyntaxKind.StringLiteral,
        value: "'Entypo'"
      },
      name: {
        kind: SyntaxKind.StringLiteral,
        value: "'home'"
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
          kind: SyntaxKind.StringLiteral,
          mode: "select",
          default: "Entypo",
          options: {
            items: _.map(Object.keys(IconMaps()), v => {
              return { value: v, label: v };
            }),
            styles
          }
        },
        {
          name: "Name",
          path: "name",
          kind: SyntaxKind.StringLiteral,
          mode: "icon",
          options: {
            styles
          }
        },
        {
          name: "Size",
          path: "size",
          kind: SyntaxKind.NumericLiteral,
          options: {
            styles
          }
        },
        {
          name: "Color",
          path: "color",
          kind: SyntaxKind.StringLiteral,
          mode: "color",
          options: {
            styles
          }
        }
      ]
    },
    ...traitStyle(["Typography"])
  ];
  static element = require("./element").default;
}
