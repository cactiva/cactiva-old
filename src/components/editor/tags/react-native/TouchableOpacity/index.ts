import { CactivaTag } from '@src/components/editor/utility/tags';
import styleTrait from '@src/components/traits/templates/styleTrait';
import { SyntaxKind } from '../../../utility/syntaxkind';

export default class extends CactivaTag {
  static tagName = 'TouchableOpacity';
  static from = 'react-native';
  static traits = [
    {
      name: 'attributes',
      fields: [
        {
          name: 'onPress',
          path: 'onPress',
          kind: SyntaxKind.CactivaCode,
          options: {
            styles: {
              root: {
                flex: 1
              }
            }
          }
        }
      ]
    },
    ...styleTrait
  ];
  static element = require('./element').default;
}
