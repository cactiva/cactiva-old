import * as _ from "lodash";
import { SyntaxKind } from "ts-morph";
import { kindNames } from "./kindNames";
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
    case SyntaxKind.ReturnStatement:
    case SyntaxKind.JsxExpression:
    case SyntaxKind.AsExpression:
    case SyntaxKind.ParenthesizedExpression:
      return { kind: kindName, value: parseJsx(node.expression, showKindName) };
    case SyntaxKind.ArrowFunction:
      return (() => {
        const params = node.parameters.map((e: any) => {
          return e.name.escapedText;
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
            children.push(props.children);
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
    case SyntaxKind.JsxElement:
      return (() => {
        let name = "";
        const props: any = {};

        name = node.openingElement.tagName.escapedText;
        node.openingElement.attributes.properties.forEach((p: any) => {
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
  if (node.getText) return { kind: kindName, value: node.getText() };
  if (node.text) return { kind: kindName, value: node.text };
  if (node.escapedText) return { kind: kindName, value: node.escapedText };
};
