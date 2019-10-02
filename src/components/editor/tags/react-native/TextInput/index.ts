import {CactivaTag} from '@src/components/editor/utility/tags';
import {SyntaxKind} from "@src/components/editor/utility/syntaxkind";
import styleTrait from "@src/components/traits/templates/styleTrait";

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = 'TextInput';
  static from = 'react-native';
  static traits = [
    {
      name: 'attributes',
      fields: [
        {
          name: 'Value',
          path: 'value',
          kind: SyntaxKind.CactivaCode,
          options: {
            styles: styles
          }
        },
        {
          name: 'Placeholder',
          path: 'placeholder',
          kind: SyntaxKind.StringLiteral,
          options: {
            styles: styles
          }
        },
        {
          name: 'Multiline',
          path: 'multiline',
          kind: SyntaxKind.CactivaCode,
          options: {
            styles: styles
          }
        },
        {
          name: 'Number Of Lines',
          path: 'numberOfLines',
          kind: SyntaxKind.CactivaCode,
          options: {
            styles: styles
          }
        },
        {
          name: 'Editable',
          path: 'editable',
          kind: SyntaxKind.CactivaCode,
          options: {
            styles: styles
          }
        },
        {
          name: 'On Change',
          path: 'onChange',
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
