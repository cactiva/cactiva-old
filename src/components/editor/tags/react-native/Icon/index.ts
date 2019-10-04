import { CactivaTag } from '@src/components/editor/utility/tags';
import { SyntaxKind } from '@src/components/editor/utility/kinds';

export default class extends CactivaTag {
  static tagName = 'Icon';
  static from = '@src/libs';
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: 'Icon',
    props: {style:{}},
    children: []
  };
  static traits = [];
  static element = require('./element').default;
}
