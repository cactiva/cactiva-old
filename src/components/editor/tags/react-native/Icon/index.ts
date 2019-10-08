import { SyntaxKind } from '@src/components/editor/utility/syntaxkinds';
import { CactivaTag } from "@src/components/editor/utility/classes";

export default class extends CactivaTag {
  static tagName = 'Icon';
  static from = '@src/libs';
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: 'Icon',
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
  static traits = [];
  static element = require('./element').default;
}
