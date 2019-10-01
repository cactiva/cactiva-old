import _ from 'lodash';
import { SyntaxKind } from './syntaxkind';

export const parseKind = (node: any): any => {
  if (!node) return node;
  const kind = node.kind;
  switch (kind) {
    case SyntaxKind.NumericLiteral:
      return parseInt(node.value);
    case SyntaxKind.StringLiteral:
      return `${JSON.parse(node.value)}`;
    case SyntaxKind.CallExpression:
      return node.value;
    case SyntaxKind.PropertyAccessExpression:
      return undefined;
    case SyntaxKind.ObjectLiteralExpression:
      return (() => {
        const result: any = {};
        _.map(node.value, (e, key) => {
          result[key] = parseKind(e);
        });
        return result;
      })();
    case SyntaxKind.ArrowFunction:
      return new Function(
        ...node.params,
        Object.values(parseProps(node.body)).join('')
      );
  }

  if (typeof node === 'object' && node.value) return node.value;
  return node;
};

export const parseProps = (node: any): any => {
  if (!node) return node;
  if (typeof node === 'object') {
    let newNode: any = {};
    _.map(node, (e, key) => {
      if (!e.kind) return;
      newNode[key] = parseKind(e);
    });
    return newNode;
  }
  return node;
};

export const generateValueByKind = (kind: number, value: any): any => {
  switch (kind) {
    case SyntaxKind.NumericLiteral:
      if (typeof value !== 'number') {
        try {
          const tryValue = parseInt(value);
          if (typeof value !== 'number') return undefined;
          return {
            kind,
            value: tryValue
          };
        } catch (e) {
          return undefined;
        }
      }
      return {
        kind,
        value
      };
  }

  return {
    kind,
    value
  };
};
