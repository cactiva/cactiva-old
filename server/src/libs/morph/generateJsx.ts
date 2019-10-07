import { SyntaxKind } from 'ts-morph';
import * as _ from 'lodash';

export const generateJsx = (node: any): string => {
  if (!node) return '';

  const kind = node.kind;

  switch (kind) {
    case SyntaxKind.NumericLiteral:
    case SyntaxKind.StringLiteral:
      return `${node.value}`;
    case SyntaxKind.CallExpression:
    case SyntaxKind.PropertyAccessExpression:
      return node.value;
    case SyntaxKind.ObjectLiteralExpression:
      return `{
  ${_.map(node.value, (e, key) => {
  return `${key}: ${generateJsx(e)}`;
  }).join(`,\n\t`)}
}`;

    case SyntaxKind.AsExpression:
      return `${generateJsx(node.value)} as any`;
    case SyntaxKind.JsxExpression:
      return `{${generateJsx(node.value)}}`;
    case SyntaxKind.ElementAccessExpression:
      return `${generateJsx(node.exp)}[${generateJsx(node.argExp)}]`;
    case SyntaxKind.ParenthesizedExpression:
      return `(${generateJsx(node.value)})`;
    case SyntaxKind.ReturnStatement:
      return `return ${generateJsx(node.value)}`;
    case SyntaxKind.ArrowFunction:
      return (() => {
        return `(${node.params.join(',')}) => { 
${node.body.map((e: any) => generateJsx(e)).join('\n')} 
}`;
      })();
    case SyntaxKind.JsxElement:
      return (() => {
        return `<${node.name} ${_.map(node.props, (e, name) => {
          return `${name}={${generateJsx(e)}}`;
        }).join(' ')}>${node.children
          .map((e: any) => {
            return generateJsx(e);
          })
          .join(' ')}</${node.name}>`;
      })();
    case SyntaxKind.JsxSelfClosingElement:
      return (() => {
        return `<${node.name} ${_.map(node.props, (e, name) => {
          return `${name}={${generateJsx(e)}}`;
        }).join(' ')}/>`;
      })();
  }

  if (typeof node === 'object' && node.value) return node.value;
  return node;
};
