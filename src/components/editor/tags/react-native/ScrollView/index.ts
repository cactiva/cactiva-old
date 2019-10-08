import { CactivaTag } from "@src/components/editor/utility/classes";
import styleTrait from '@src/components/traits/templates/styleTrait';
import { SyntaxKind } from '@src/components/editor/utility/syntaxkinds';

const styles = {
  root: {
    flex: '1 1 100%'
  }
};

export default class extends CactivaTag {
  static tagName = 'ScrollView';
  static from = 'react-native';
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: 'ScrollView',
    props: {},
    children: []
  };
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
