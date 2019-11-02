import _ from "lodash";
import { SyntaxKind } from "../syntaxkinds";
import { toJS } from "mobx";

export const parseStyle = (node: any, cactiva: any): any => {
  const result = parseValue(node);
  if (typeof result !== "object") {
    return null;
  }
  for (let i in result) {
    const value = result[i];
    if (typeof value === "string") {
      if (value.indexOf('color.') === 0) {
        const colorList: any = {
          'color.primary': '#007ACC'
        };
        result[i] = colorList[value];
      }
    }
  }

  return result;
}

export const parseValue = (node: any): any => {
  if (!node) return node;
  const kind = node.kind;

  switch (kind) {
    case SyntaxKind.NumericLiteral:
      return parseInt(node.value);
    case SyntaxKind.StringLiteral:
      return node.value.substring(1, node.value.length - 1);
    case SyntaxKind.Identifier:
    case SyntaxKind.PropertyAccessExpression:
      return node.value;
    case SyntaxKind.CallExpression:
      return (() => {
        const result: any = [];
        _.map(node.arguments, (e, key) => {
          result.push(parseValue(e));
        });
        return result;
      })();
    case SyntaxKind.PropertyAccessExpression:
      return undefined;
    case SyntaxKind.ObjectLiteralExpression:
      return (() => {
        const result: any = {};
        _.map(node.value, (e, key) => {
          result[key] = parseValue(e);
        });
        return result;
      })();
  }

  if (typeof node === "object" && node.value) {
    return node.value;
  }
  return node;
};

export const parseProps = (node: any): any => {
  if (!node) return node;
  if (typeof node === "object") {
    let newNode: any = {};
    _.map(node, (e, key) => {
      if (!!e && !e.kind) return;
      newNode[key] = parseValue(e);
    });
    return newNode;
  }
  return node;
};

export const generateValueByKind = (kind: number, value: any): any => {
  switch (kind) {
    case SyntaxKind.CactivaCode:
      if (typeof value !== "string") {
        value = JSON.stringify(value) || "";
      }
      break;
    case SyntaxKind.NumericLiteral:
      if (typeof value !== "number") {
        try {
          const tryValue = parseInt(value);
          if (typeof value !== "number") return undefined;
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
    case SyntaxKind.CallExpression:
      return {
        kind: kind,
        expression: value.expression,
        arguments: value.arguments
      }
    case SyntaxKind.ArrowFunction:
      return {
        kind,
        body: value.body,
        params: value.params
      };
  }

  return {
    kind,
    value
  };
};
