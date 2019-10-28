import CactivaChildren from "@src/components/editor/CactivaChildren";
import { uuid } from "@src/components/editor/utility/elements/tools";
import { generateExpressionArray } from "@src/components/editor/utility/parser/generateExpression";
import { observer } from "mobx-react-lite";
import React from "react";

export default observer((props: any): any => {
  const cactiva = props._cactiva;
  const exps = generateExpressionArray(cactiva.source);
  const parentInfo = (c: any) => ({
    isLastChild: c.isLastChild,
    canDropAfter: false,
    id: cactiva.source.id
  });
  return exps.map((value) => {
    return <Expression key={uuid("syntaxkindel")} value={value} cactiva={cactiva} parentInfo={parentInfo} />;
  })
});

const Expression = ({ value, cactiva, parentInfo }: any) => {
  if (typeof value === "string") {
    return <span style={{ fontFamily: 'Consolas, "Courier New", monospace', fontSize: '12px' }}>{value}</span>;
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