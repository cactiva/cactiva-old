import { ICactivaTrait } from '@src/components/editor/utility/tags';
import { SyntaxKind } from '@src/components/editor/utility/kinds';

const styleTrait: ICactivaTrait[] = [
  {
    name: 'style',
    kind: SyntaxKind.ObjectLiteralExpression,
    default: {},
    fields: [
      {
        name: 'width',
        path: 'style.value.width',
        kind: SyntaxKind.NumericLiteral,
        options: {
          styles: {
            root: {
              flex: '0 0 50%',
              paddingRight: 0
            },
            field: {
              maxWidth: '50px'
            }
          }
        }
      },
      {
        name: 'height',
        path: 'style.value.height',
        kind: SyntaxKind.NumericLiteral,
        options: {
          styles: {
            root: {
              flex: '0 0 50%',
              paddingRight: 0
            },
            field: {
              maxWidth: '50px'
            }
          }
        }
      }
    ]
  }
];

export default styleTrait;
