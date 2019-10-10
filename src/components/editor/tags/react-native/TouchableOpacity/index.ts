import { CactivaTag } from '@src/components/editor/utility/classes';
import styleTrait from '@src/components/traits/templates/styleTrait';
import { SyntaxKind } from '../../../utility/syntaxkinds';

const styles = {
  root: {
    flex: '1 1 100%'
  }
};

export default class extends CactivaTag {
  static tagName = 'TouchableOpacity';
  static from = 'react-native';
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: 'TouchableOpacity',
    props: {},
    children: [
      {
        kind: SyntaxKind.JsxElement,
        name: 'Text',
        props: {},
        children: [{ kind: SyntaxKind.StringLiteral, value: 'Button' }]
      }
    ]
  };
  static traits = [
    {
      name: 'attributes',
      fields: [
        {
          name: 'On Press',
          path: 'onPress',
          kind: SyntaxKind.CactivaCode,
          options: {
            styles: styles
          }
        }
      ]
    },
    ...styleTrait(['Typography'])
  ];
  static element = require('./element').default;
}
