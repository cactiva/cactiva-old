import {CactivaTag} from '@src/components/editor/utility/tags';
import styleTrait from '@src/components/traits/templates/styleTrait';
import {SyntaxKind} from "@src/components/editor/utility/kinds";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = 'ScrollView';
  static from = 'react-native';
  static traits = [
    {
      name: 'attributes',
      fields: [
        {
          name: 'Horizontal',
          path: 'horizontal',
          kind: SyntaxKind.FalseKeyword,
          options: {
            styles: styles
          }
        },
        {
          name: 'On Scroll',
          path: 'onScroll',
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
