import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from '@src/components/editor/utility/syntaxkinds';

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
