import { SyntaxKind } from '@src/components/editor/utility/syntaxkinds';
import { CactivaTag } from '@src/components/editor/utility/classes';
import styleTrait from '@src/components/traits/templates/styleTrait';

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
          mode: 'image'
        }
      ]
    },
    ...styleTrait(['Typography'])
  ];
  static element = require('./element').default;
}
