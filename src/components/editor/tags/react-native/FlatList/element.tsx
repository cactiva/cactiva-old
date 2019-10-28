import CactivaChildren from "@src/components/editor/CactivaChildren";
import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import { showAddInParent } from "@src/components/editor/CactivaEditor";
import { parseStyle } from "@src/components/editor/utility/parser/parser";
import { Text } from "evergreen-ui";
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
  const direction = _.get(style, "flexDirection", "column");
  const body: any = _.get(cactiva.source, "props.renderItem.body", []);
  const hasNoChildren = body.length === 0;

  return (
    <CactivaDropChild
      cactiva={cactiva}
      onDropOver={(value: boolean) => (meta.dropOver = value)}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={style}>
          <Text size={300}>renderItem:</Text>
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
