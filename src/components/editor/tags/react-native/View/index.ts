import { CactivaTag } from '@src/components/editor/utility/classes';
import styleTrait from '@src/components/traits/templates/styleTrait';
import { SyntaxKind } from '../../../utility/syntaxkinds';

export default class extends CactivaTag {
  static tagName = 'View';
  static from = 'react-native';
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: 'View',
    props: {},
    children: []
  };
  static traits = [
    {
      name: 'attributes',
      fields: []
    },
    ...styleTrait(['Typography'])
  ];
  static element = require('./element').default;
}
