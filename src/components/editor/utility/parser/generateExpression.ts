import _ from "lodash";
import { SyntaxKind } from "../syntaxkinds";

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
export const generateExpressionArray = (node: any): any[] => {
  if (!node) return [""];

  const kind = node.kind;

  switch (kind) {
    case SyntaxKind.NumericLiteral:
    case SyntaxKind.StringLiteral:
      return [`${node.value}`];
    case SyntaxKind.CallExpression:
    case SyntaxKind.PropertyAccessExpression:
      return [node.value];
    case SyntaxKind.ObjectLiteralExpression:
      return (() => {
        const result = [] as any;
        const keys = _.keys(node.value);
        keys.map((key, idx) => {
          const isFirstKey = idx === 0;
          const child = generateExpressionArray(node.value[key]);
          result.push(`${!isFirstKey ? "," : ""}${key}:`);
          child.map(v => result.push(child));
        });
        return [`{`, ...result, `}`];
      })();
    case SyntaxKind.AsExpression:
      return [...generateExpressionArray(node.value), ` as any`];
    case SyntaxKind.ConditionalExpression:
      return [
        node.trueKeyword,
        "?",
        ...generateExpressionArray(node.whenTrue),
        ":",
        ...generateExpressionArray(node.whenFalse)
      ];
    case SyntaxKind.JsxFragment:
      return [`</>`, ...node.children, `</>`];
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
