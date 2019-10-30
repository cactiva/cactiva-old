import _ from "lodash";
import { SyntaxKind } from "../syntaxkinds";
import { toJS } from "mobx";

export const generateExpression = (node: any): any[] => {
  const rawResult = generateExpressionArray(node);
  const result = [""] as any;
  rawResult.map(r => {
    if (typeof r === "string") {
      if (typeof result[result.length - 1] === "string") {
        result[result.length - 1] = result[result.length - 1] + r;
        return;
      }
    }

    if (Array.isArray(r)) {
      r.map(rr => {
        result.push(rr);
      });
      return;
    }

    result.push(r);
  });

  return result;
};

export const getToken = (op: number) => {
  switch (op) {
    case SyntaxKind.EqualsToken:
      return "=";
    case SyntaxKind.EqualsEqualsToken:
      return "==";
    case SyntaxKind.EqualsEqualsEqualsToken:
      return "===";
    case SyntaxKind.BarToken:
      return "|";
    case SyntaxKind.BarBarToken:
      return "||";
    case SyntaxKind.AmpersandAmpersandToken:
      return "&&";
  }
  return null;
};

export const generateExpressionArray = (node: any): any[] => {
  if (!node) return [""];

  const kind = node.kind;

  switch (kind) {
    case SyntaxKind.BinaryExpression:
      if (getToken(node.operator) === "&&") {
        return ["if (", node.left, ") then ", node.right];
      }
      return [node.left, " " + getToken(node.operator) + " ", node.right];
    case SyntaxKind.NumericLiteral:
    case SyntaxKind.StringLiteral:
      return [`${node.value}`];
    case SyntaxKind.CallExpression:
      const args: any[] = node.arguments.map((i: any) => {
        return generateExpressionArray(i);
      });
      return [node.expression, `(`, ...args, `)`];
    case SyntaxKind.PropertyAccessExpression:
      return [node.value];
    case SyntaxKind.ObjectLiteralExpression:
      return (() => {
        const result = [] as any;
        const keys = _.keys(node.value);
        keys.map((key, idx) => {
          if (key.indexOf("_spread_") === 0) {
            result.push(`...`);
            result.push(generateExpressionArray(node.value[key]));
          } else {
            const isFirstKey = idx === 0;
            const child = generateExpressionArray(node.value[key]);
            result.push(`${!isFirstKey ? "," : ""}${key}:`);
            child.map(v => result.push(child));
          }
        });
        return [`{`, ...result, `}`];
      })();
    case SyntaxKind.AsExpression:
      return [...generateExpressionArray(node.value), ` as any`];
    case SyntaxKind.ConditionalExpression:
      return [
        "if (",
        ...generateExpressionArray(node.condition),
        ") then ",
        ...generateExpressionArray(node.whenTrue),
        " else ",
        ...generateExpressionArray(node.whenFalse),
        ""
      ];
    case SyntaxKind.JsxFragment:
      return [`<>`, ...node.children, `</>`];
    case SyntaxKind.JsxExpression:
      return [`{`, ...generateExpressionArray(node.value), `}`];
    case SyntaxKind.ElementAccessExpression:
      return [
        ...generateExpressionArray(node.exp),
        `[`,
        ...generateExpressionArray(node.argExp),
        `]`
      ];
    case SyntaxKind.ParenthesizedExpression:
      return [`(`, ...generateExpressionArray(node.value), `)`];
    case SyntaxKind.ReturnStatement:
      return [`return `, ...generateExpressionArray(node.value)];
    case SyntaxKind.ArrowFunction:
      return (() => {
        const result = [];
        result.push(`(${node.params.join(",")}) => {`);
        node.body.map((e: any) => {
          const childs = generateExpressionArray(e);
          childs.map(c => {
            result.push(c);
          });
        });
        result.push(`})`);
        return result;
      })();
  }

  if (typeof node === "object" && node.value) return [node.value];
  return [node];
};
