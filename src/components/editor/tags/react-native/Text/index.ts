import {CactivaTag} from '@src/components/editor/utility/tags';
import {SyntaxKind} from "@src/components/editor/utility/syntaxkind";
import styleTrait from "@src/components/traits/templates/styleTrait";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = 'Text';
  static from = 'react-native';
  static traits = [
    {
      name: 'attributes',
      fields: [
        {
          name: 'Disabled',
          path: 'disabled',
          kind: SyntaxKind.CactivaCode,
          options: {
            styles: styles
          }
        },
        {
          name: 'Ellipsize Mode',
          path: 'ellipsizeMode',
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
