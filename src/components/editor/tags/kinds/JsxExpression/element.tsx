import CactivaChildren from "@src/components/editor/CactivaChildren";
import { uuid } from "@src/components/editor/utility/elements/tools";
import { generateExpression } from "@src/components/editor/utility/parser/generateExpression";
import { Text } from "evergreen-ui";
import { observer } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDroppable from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { toJS } from "mobx";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const expressions = generateExpression(cactiva.source.value);

  return (
    <CactivaDroppable cactiva={cactiva} canDropOver={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva}>
          <Text
            style={{
              padding: 5,
              margin: 5,
              borderRadius: 5,
              fontSize: 10,
              color: "#000",
              backgroundColor: "rgba(255,255,255,1)"
            }}
          >
            {expressions.map((exp: any, i: number) => {
              return (
                <Expression
                  key={uuid("kindexpression")}
                  exp={exp}
                  cactiva={cactiva}
                  idx={i}
                />
              );
            })}
          </Text>
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDroppable>
  );
});

export const Expression = observer((props: any) => {
  const { exp, cactiva, idx } = props;
  const source = {
    kind: cactiva.source.kind,
    id: cactiva.source.id,
    child: {
      id: cactiva.source.id + "_" + idx,
      value: exp
    }
  };
  const parentInfo = () => ({
    canDropAfter: false
  });
  if (typeof exp === "string") {
    return <span style={{ fontFamily: 'Consolas, "Courier New", monospace', fontSize: '10px' }}>{exp}</span>;
  }
  return (
    <span>
      <CactivaChildren
        source={source}
        cactiva={cactiva}
        parentInfo={parentInfo}
      />
    </span>
  );
});
