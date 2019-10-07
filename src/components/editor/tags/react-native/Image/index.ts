import { CactivaTag } from '@src/components/editor/utility/tags';
import { SyntaxKind } from '@src/components/editor/utility/kinds';
import styleTrait from '@src/components/traits/templates/styleTrait';
const styles = {
  root: {
    flex: '1 1 100%'
  }
};

export default class extends CactivaTag {
  static tagName = 'Image';
  static from = 'react-native';
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: 'Image',
    props: {},
    children: []
  };
  static traits = [
    {
      name: 'attributes',
      fields: [
        {
          name: 'Source',
          path: 'source',
          kind: SyntaxKind.CactivaCode,
          mode: 'image',
          options: {
            styles: styles
          }
        }
      ]
    },
    {
      name: 'style',
      kind: SyntaxKind.ObjectLiteralExpression,
      default: {},
      fields: [
        {
          name: 'width',
          path: 'style.value.width',
          kind: SyntaxKind.NumericLiteral,
          value: 250
        }
      ]
    }
  ];
  static element = require('./element').default;
}
