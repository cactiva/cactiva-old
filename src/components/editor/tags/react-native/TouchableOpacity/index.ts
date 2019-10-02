import {CactivaTag} from '@src/components/editor/utility/tags';
import styleTrait from '@src/components/traits/templates/styleTrait';
import {SyntaxKind} from '../../../utility/syntaxkind';

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = 'TouchableOpacity';
  static from = 'react-native';
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
    ...styleTrait
  ];
  static element = require('./element').default;
}
