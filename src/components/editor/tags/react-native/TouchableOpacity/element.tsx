import CactivaChildren from "@src/components/editor/CactivaChildren";
import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseStyle } from "../../../utility/parser/parser";
import { getParentId } from "@src/components/editor/utility/elements/tools";
import { showAddInParent } from "@src/components/editor/CactivaEditor";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseStyle(props.style, cactiva);
  const meta = useObservable({ dropOver: false });
  const direction = _.get(style, "flexDirection", "column");
  const hasNoChildren = _.get(cactiva.source, "children.length", 0) === 0;
  const parentInfo = (c: any) => ({
    ...cactiva.parentInfo,
    isFirstChild: c.isFirstChild,
    isLastChild: c.isLastChild,
    afterDirection: direction,
    style
  });
  return (
    <CactivaDropChild
      cactiva={cactiva}
      onDropOver={(value: boolean) => (meta.dropOver = value)}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={style}>
          <CactivaDropMarker
            hover={meta.dropOver}
            showAdd={showAddInParent(cactiva)}
            direction={direction}
            stretch={hasNoChildren}
          />
          <CactivaChildren cactiva={cactiva} parentInfo={parentInfo} />
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
