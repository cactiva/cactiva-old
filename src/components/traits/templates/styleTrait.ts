import { ICactivaTrait } from '@src/components/editor/utility/tags';
import { SyntaxKind } from '@src/components/editor/utility/syntaxkind';

const styleTrait: ICactivaTrait[] = [
  {
    name: 'style',
    fields: [
      {
        name: 'width',
        kind: SyntaxKind.NumericLiteral
      }
    ]
  }
];

export default styleTrait;
