import * as _ from "lodash";
import { SyntaxKind } from "ts-morph";
import { kindNames } from "./kindNames";

export const getEntryPoint = (node: any): any => {
  if (node && node.compilerNode) {
    node = node.compilerNode;
  }
  if (node.kind === SyntaxKind.SyntaxList) {
    return getEntryPoint(_.get(node, "_children.0"));
  }
  if (node.kind === SyntaxKind.ExpressionStatement) {
    return getEntryPoint(_.get(node, "expression"));
  }
  if (node.kind === SyntaxKind.ParenthesizedExpression) {
    return getEntryPoint(_.get(node, "expression"));
  }
  if (node.kind === SyntaxKind.Block) {
    return getEntryPoint(_.get(node, "statements.0"));
  }
  return node;
};

export const parseJsx = (node: any, showKindName: boolean = false): any => {
  if (node.compilerNode) {
    node = node.compilerNode;
  }

  let kind = _.get(node, "kind");
  if (!kind && node && node.getKind) {
    kind = node.getKind();
  }
  const kindName = showKindName ? kindNames[kind] : kind;

  switch (kind) {
    case SyntaxKind.BinaryExpression:
      return {
        kind: kindName,
        left: parseJsx(node.left, showKindName),
        operator: showKindName
          ? kindNames[node.operatorToken.kind]
          : node.operatorToken.kind,
        right: parseJsx(node.right, showKindName)
      };
    case SyntaxKind.PrefixUnaryExpression:
      if (node.operand.kind === SyntaxKind.NumericLiteral) {
        return parseInt(node.getText());
      } else {
        return node.getText();
      }
    case SyntaxKind.ElementAccessExpression:
      return {
        kind: kindName,
        exp: parseJsx(node.expression, showKindName),
        argExp: parseJsx(node.argumentExpression, showKindName)
      };
    case SyntaxKind.ConditionalExpression:
      return {
        kind: kindName,
        trueKeyword: node.trueKeyword,
        whenTrue: parseJsx(node.whenTrue, showKindName),
        whenFalse: parseJsx(node.whenFalse, showKindName)
      };
    case SyntaxKind.CallExpression:
      return {
        kind: kindName,
        expression: node.expression.getText(),
        arguments: node.arguments.map((i: any) => parseJsx(i, showKindName))
      };
    case SyntaxKind.ReturnStatement:
    case SyntaxKind.JsxExpression:
    case SyntaxKind.AsExpression:
    case SyntaxKind.ParenthesizedExpression:
      return { kind: kindName, value: parseJsx(node.expression, showKindName) };
    case SyntaxKind.ArrowFunction:
      return (() => {
        const params = node.parameters.map((e: any) => {
          return e.getText();
        });
        const body: any = [];
        if (node.body.statements) {
          node.body.statements.map((s: any) => {
            body.push(parseJsx(s, showKindName));
          });
        } else {
          body.push(parseJsx(node.body, showKindName));
        }
        return { kind: kindName, params, body };
      })();
    case SyntaxKind.ObjectLiteralExpression:
      return (() => {
        const result: any = {};
        node.properties.forEach((p: any) => {
          const name = p.name.escapedText || p.name.text;
          result[name] = parseJsx(p.initializer, showKindName);
        });

        return { kind: kindName, value: result };
      })();
    case SyntaxKind.JsxSelfClosingElement:
      return (() => {
        const jsxElement: any = node.compilerNode ? node.compilerNode : node;
        let name = "";
        const props: any = {};

        const je = jsxElement as any;
        name = je.tagName.escapedText;
        je.attributes.properties.forEach((p: any) => {
          props[p.name.escapedText] = parseJsx(
            p.initializer.expression,
            showKindName
          );
        });

        if (props.children) {
          const children = [];
          if (Array.isArray(props.children)) {
            props.children.forEach((c: any) => children.push(c));
          } else {
            const c = props.children;
            if (c.kind === SyntaxKind.StringLiteral) {
              children.push({
                ...c,
                kind: SyntaxKind.JsxText,
                value: c.value.substr(1, c.value.length - 2)
              });
            } else {
              children.push(c);
            }
          }
          delete props.children;
          return {
            kind: SyntaxKind.JsxElement,
            name,
            props,
            children
          };
        }

        return {
          kind: kindName,
          name,
          props
        };
      })();
    case SyntaxKind.JsxFragment:
    case SyntaxKind.JsxElement:
      return (() => {
        let name = "";
        const props: any = {};

        name = _.get(node, "openingElement.tagName.escapedText");
        const properties = _.get(
          node,
          "openingElement.attributes.properties",
          []
        );
        properties.forEach((p: any) => {
          props[p.name.escapedText] = parseJsx(
            p.initializer.expression,
            showKindName
          );
        });

        const children: any = [];
        node.children.forEach((c: any) => {
          const parsedChildren = parseJsx(c, showKindName);

          if (parsedChildren !== undefined) {
            children.push(parsedChildren);
          }
        });

        if (props.children) {
          if (Array.isArray(props.children)) {
            props.children.forEach((c: any) => children.push(c));
          } else {
            children.push(props.children);
          }
          delete props.children;
        }

        return {
          kind: kindName,
          name,
          props,
          children
        };
      })();
  }

  if (node.containsOnlyTriviaWhiteSpaces) return undefined;
  if (node.getText) return { kind: kindName, value: node.getText().trim() };
  if (node.text) return { kind: kindName, value: node.text.trim() };
  if (node.escapedText)
    return { kind: kindName, value: node.escapedText.trim() };
};
