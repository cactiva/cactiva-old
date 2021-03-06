import CactivaChildren from "@src/components/editor/CactivaChildren";
import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const meta = useObservable({ dropOver: false });
  const hasNoChildren = _.get(cactiva.source, "children.length", 0) === 0;
  return (
    <CactivaDropChild
      cactiva={cactiva}
      onDropOver={(value: boolean) => (meta.dropOver = value)}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva}>
          <div
            style={{
              padding: '0px 5px',
              margin: 0,
              borderRadius: 5,
              fontSize: 10,
              color: "#000",
              backgroundColor: "rgba(255,255,255,1)"
            }}
          >
            <CactivaDropMarker hover={meta.dropOver} stretch={hasNoChildren} />
            <CactivaChildren
              cactiva={cactiva}
              parentInfo={(c: any) => ({
                isLastChild: c.isLastChild
              })}
            />
          </div>
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
