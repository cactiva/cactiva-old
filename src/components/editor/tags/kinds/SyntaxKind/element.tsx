import CactivaChildren from "@src/components/editor/CactivaChildren";
import { generateExpressionArray, getToken } from "@src/components/editor/utility/parser/generateExpression";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import _ from "lodash";
import { observer } from "mobx-react-lite";
import React from "react";
import { uuid } from "@src/components/editor/utility/elements/tools";
import { toJS } from "mobx";

export default observer((props: any): any => {
  const cactiva = props._cactiva;
  const exps = generateExpressionArray(cactiva.source);
  const parentInfo = (c: any) => ({
    isLastChild: c.isLastChild,
    id: cactiva.source.id
  });

  return exps.map((value) => {
    return <Expression key={uuid("syntaxkindel")} value={value} cactiva={cactiva} parentInfo={parentInfo} />;
  })
});

const Expression = ({ value, cactiva, parentInfo }: any) => {
  if (typeof value === "string") {
    return <span style={{ fontFamily: 'Consolas, "Courier New", monospace' }}>{value}</span>;
  } else if (typeof value === "undefined") {
    return null;
  }
  const source = {
    kind: cactiva.source.kind,
    id: cactiva.source.id,
    child: {
      id: cactiva.source.id + "_0",
      value: value
    }
  };
  return (
    <CactivaChildren
      source={source}
      cactiva={{ ...cactiva, source }}
      parentInfo={parentInfo}
    />
  );
}

const getValue = (node: any): any => {
  const kind = node.kind;
  console.log(kind);

  switch (kind) {
    case SyntaxKind.BinaryExpression:
      return [node.left, getToken(node.operator), node.right];
    case SyntaxKind.CallExpression:
      const args: any[] = node.arguments.map((i: any) => {
        return getValue(i);
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
            result.push(getValue(node.value[key]));
          } else {
            const isFirstKey = idx === 0;
            const child = getValue(node.value[key]);
            result.push(`${!isFirstKey ? "," : ""}${key}:`);
            child.map((v: any) => result.push(child));
          }
        });
        return [`{`, ...result, `}`];
      })();
    case SyntaxKind.AsExpression:
      return [...getValue(node.value), ` as any`];
    case SyntaxKind.ConditionalExpression:
      return [
        ...getValue(node.condition),
        " ? ",
        ...getValue(node.whenTrue),
        " : ",
        ...getValue(node.whenFalse)
      ];
    case SyntaxKind.JsxFragment:
      return [`</>`, ...node.children, `</>`];
    case SyntaxKind.JsxExpression:
      return [`{`, ...getValue(node.value), `}`];
    case SyntaxKind.ElementAccessExpression:
      return [
        ...getValue(node.exp),
        `[`,
        ...getValue(node.argExp),
        `]`
      ];
    case SyntaxKind.ParenthesizedExpression:
      return [`(`, ...getValue(node.value), `)`];
    case SyntaxKind.ReturnStatement:
      return [`return `, ...getValue(node.value)];
    case SyntaxKind.ArrowFunction:
      return (() => {
        const result = [];
        result.push(`(${node.params.join(",")}) => {`);
        node.body.map((e: any) => {
          const childs = getValue(e);
          childs.map((c: any) => {
            result.push(c);
          });
        });
        result.push(`})`);
        return result;
      })();
  }

  if (node.value) return [node.value];
  return [];
}