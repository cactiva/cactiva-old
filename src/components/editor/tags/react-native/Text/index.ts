import { CactivaTag } from "@src/components/editor/utility/classes";
import { SyntaxKind } from '@src/components/editor/utility/syntaxkinds';
import styleTrait from '@src/components/traits/templates/styleTrait';

const styles = {
  root: {
    flex: '1 1 100%'
  }
};

export default class extends CactivaTag {
  static tagName = 'Text';
  static from = 'react-native';
  static structure = {
    kind: SyntaxKind.JsxElement,
    name: 'Text',
    props: {},
    children: [{ kind: SyntaxKind.StringLiteral, value: 'Text' }]
  };
  static traits = [
    {
      name: 'attributes',
      fields: [
        {
          name: 'Disabled',
          path: 'disabled',
          kind: SyntaxKind.FalseKeyword,
          options: {
            styles: styles
          }
        },
        {
          name: 'Ellipsize Mode',
          path: 'ellipsizeMode',
          kind: SyntaxKind.StringLiteral,
          mode: 'select',
          options: {
            styles: styles,
            items: [
              { value: 'head', label: 'Head' },
              { value: 'middle', label: 'Middle' },
              { value: 'tail', label: 'Tail' },
              { value: 'chip', label: 'Chip' }
            ]
          }
        }
      ]
    },
    ...styleTrait
  ];
  static element = require('./element').default;
}
