import { CactivaTag } from '@src/components/editor/utility/tags';
import { SyntaxKind } from '@src/components/editor/utility/kinds';
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
    name: 'ScrollView',
    props: {style:{}},
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
    }
  ];
  static element = require('./element').default;
}