import CactivaChildren from "@src/components/editor/CactivaChildren";
import { parseStyle } from "@src/components/editor/utility/parser/parser";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseStyle(props.style, cactiva);
  const meta = useObservable({ dropOver: false });
  const body: any = _.get(cactiva.source, "props.renderItem.body", []);

  return (
    <CactivaDropChild
      cactiva={cactiva}
      onDropOver={(value: boolean) => (meta.dropOver = value)}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={style}>
          <div style={{ fontSize: "10px", marginBottom: -5 }}>
            FlatList (item, index)
          </div>
          <div style={{ marginLeft: -10 }}>
            <Expression expressions={body} cactiva={cactiva} />
          </div>
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});

const Expression = observer(({ expressions, cactiva }: any) => {
  if (!expressions.map) {
    return null;
  }

  return expressions.map((exp: any, key: number) => {
    const source = {
      kind: cactiva.source.kind,
      id: cactiva.source.id,
      child: {
        id: cactiva.source.id + "_" + key,
        value: exp
      }
    };
    const parentInfo = () => ({
      canDropAfter: false
    });
    if (typeof exp === "string") {
      return exp;
    }
    return (
      <div key={key} style={{ paddingLeft: 10 }}>
        <CactivaChildren
          source={source}
          cactiva={cactiva}
          parentInfo={parentInfo}
        />
      </div>
    );
  });
});
