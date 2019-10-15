import * as _ from "lodash";
import { SyntaxKind } from "../syntaxkinds";
import { toJS } from "mobx";

export const generateSource = (node: any): string => {
  if (!node) return "";

  const kind = node.kind;

  switch (kind) {
    case SyntaxKind.StringLiteral:
    case SyntaxKind.NumericLiteral:
      return `${node.value}`;
    case SyntaxKind.CallExpression:
    case SyntaxKind.PropertyAccessExpression:
      return node.value;
    case SyntaxKind.ObjectLiteralExpression:
      return `{
  ${_.map(node.value, (e, key) => {
    return `${key}: ${generateSource(e)}`;
  }).join(`,\n\t`)}
}`;

    case SyntaxKind.AsExpression:
      return `${generateSource(node.value)} as any`;
    case SyntaxKind.JsxExpression:
      return `{${generateSource(node.value)}}`;
    case SyntaxKind.ElementAccessExpression:
      return `${generateSource(node.exp)}[${generateSource(node.argExp)}]`;
    case SyntaxKind.ParenthesizedExpression:
      return `(${generateSource(node.value)})`;
    case SyntaxKind.BinaryExpression:
      return (() => {
        let operator = "=";
        switch (node.operator) {
          case SyntaxKind.EqualsToken:
            operator = "=";
            break;
        }

        return `${generateSource(node.left)} ${operator} ${generateSource(
          node.right
        )}`;
      })();
    case SyntaxKind.ReturnStatement:
      return `return ${generateSource(node.value)}`;
    case SyntaxKind.ArrowFunction:
      return (() => {
        return `(${node.params.join(",")}) => { 
${node.body.map((e: any) => generateSource(e)).join("\n")} 
}`;
      })();
    case SyntaxKind.JsxFragment:
      return (() => {
        return `<>${(node.children || [])
          .map((e: any) => {
            return generateSource(e);
          })
          .join("")}</>`;
      })();
    case SyntaxKind.JsxElement:
      return (() => {
        return `<${node.name} ${_.map(node.props, (e, name) => {
          return `${name}={${generateSource(e)}}`;
        }).join(" ")}>${(node.children || [])
          .map((e: any) => {
            const res = generateSource(e);
            return res;
          })
          .join("")}</${node.name}>`;
      })();
    case SyntaxKind.JsxSelfClosingElement:
      return (() => {
        return `<${node.name} ${_.map(node.props, (e, name) => {
          return `${name}={${generateSource(e)}}`;
        }).join("")}/>`;
      })();
  }

  if (typeof node === "object" && node.value) return node.value;
  return node;
};
