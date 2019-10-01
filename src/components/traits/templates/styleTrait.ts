import { ICactivaTrait } from '@src/components/editor/utility/tags';
import { SyntaxKind } from '@src/components/editor/utility/syntaxkind';

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
              // width: '100px'
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
