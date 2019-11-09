import * as _ from "lodash";
import { SyntaxKind } from "../syntaxkinds";
import { toJS } from "mobx";
import { getToken } from "./generateExpression";

export const generateSource = (
  node: any,
  options?: { isProps: boolean }
): string => {
  if (!node) return "";

  const kind = node.kind;

  switch (kind) {
    case SyntaxKind.TrueKeyword:
      return `true`;
    case SyntaxKind.FalseKeyword:
      return `false`;
    case SyntaxKind.StringLiteral:
    case SyntaxKind.NumericLiteral:
      return `${node.value}`;
    case SyntaxKind.CallExpression:
      return `${node.expression}(
    ${_.map(node.arguments, (e, key) => {
      if (typeof e === "string") return `'${e}'`;
      return generateSource(e);
    }).join(`,`)}
  )`;
    case SyntaxKind.PropertyAccessExpression:
      return node.value;
    case SyntaxKind.ArrayLiteralExpression:
      return `[
        ${_.map(node.value, (e, key) => {
          return `${generateSource(e)}`;
        }).join(`,\n\t`)}
      ]`;

    case SyntaxKind.ObjectLiteralExpression:
      return `{
  ${_.map(node.value, (e, key) => {
    if (key.indexOf("_spread_") === 0) {
      return `...${generateSource(e)}`;
    }

    return `${key}: ${generateSource(e)}`;
  }).join(`,\n\t`)}
}`;

    case SyntaxKind.AsExpression:
      return `${generateSource(node.value)} as any`;
    case SyntaxKind.JsxExpression:
      if (_.get(options, "isProps") === true) {
        return generateSource(node.value);
      }
      return `{${generateSource(node.value)}}`;
    case SyntaxKind.ElementAccessExpression:
      return `${generateSource(node.exp)}[${generateSource(node.argExp)}]`;
    case SyntaxKind.ParenthesizedExpression:
      return `(${generateSource(node.value)})`;
    case SyntaxKind.ConditionalExpression:
      return `${generateSource(node.condition)} ? ${generateSource(
        node.whenTrue
      )}: ${generateSource(node.whenFalse)}`;
    case SyntaxKind.BinaryExpression:
      return (() => {
        return `${generateSource(node.left)} ${getToken(
          node.operator
        )} ${generateSource(node.right)}`;
      })();
    case SyntaxKind.ReturnStatement:
      return `return ${generateSource(node.value)}`;
    case SyntaxKind.ArrowFunction:
      let body = node.body.map((e: any) => generateSource(e)).join("\n");
      if (_.get(node, "body.0.kind") === SyntaxKind.ParenthesizedExpression) {
        body = `return ${body}`;
      }

      const async = _.indexOf(node.modifiers, SyntaxKind.AsyncKeyword) >= 0;

      return (() => {
        return `${async ? "async " : ""}(${(node.params || []).join(",")}) => { 
${body}
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
          return `${name}={${generateSource(e, { isProps: true })}}`;
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
          return `${name}={${generateSource(e, { isProps: true })}}`;
        }).join("")}/>`;
      })();
  }

  if (typeof node === "object" && node.value) return node.value;
  return node;
};
