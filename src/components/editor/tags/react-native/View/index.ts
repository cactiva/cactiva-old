import { CactivaTag } from '@src/components/editor/utility/tags';
import styleTrait from '@src/components/traits/templates/styleTrait';
import { SyntaxKind } from '../../../utility/kinds';

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
    ...styleTrait
  ];
  static element = require('./element').default;
}
