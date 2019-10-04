import { CactivaTag } from '@src/components/editor/utility/tags';
import { SyntaxKind } from '@src/components/editor/utility/kinds';

export default class extends CactivaTag {
  static tagName = 'FlatList';
  static from = 'react-native';
  static traits = [];
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: 'FlatList',
    props: {},
    children: []
  };
  static element = require('./element').default;
}
