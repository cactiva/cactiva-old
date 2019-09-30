import _ from 'lodash';
import { SyntaxKind } from './syntaxkind';

export const parseProp = (node: any): any => {
  if (!node) return node;
  const kind = node.kind;
  switch (kind) {
    case SyntaxKind.NumericLiteral:
    case SyntaxKind.StringLiteral:
      return `${node.value}`;
    case SyntaxKind.CallExpression:
    case SyntaxKind.PropertyAccessExpression:
      return node.value;
    case SyntaxKind.ObjectLiteralExpression:
      return (() => {
        const result: any = {};
        _.map(node.value, (e, key) => {
          result[key] = parseProp(e);
        });
        return result;
      })();
  }

  if (typeof node === 'object' && node.value) return node.value;
  return node;
};
