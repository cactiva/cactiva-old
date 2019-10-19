import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseValue } from "../../../utility/parser/parser";
import { renderChildren } from "../../../utility/renderchild";
import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import _ from "lodash";
import CactivaChildren from "@src/components/editor/CactivaChildren";
import { toJS } from "mobx";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseValue(props.style);
  const meta = useObservable({ dropOver: false });
  const direction = _.get(style, "flexDirection", "column");
  const hasNoChildren = _.get(cactiva.source, "children.length", 0) === 0;
  const parentInfo = (c: any) => ({
    isFirstChild: c.isFirstChild,
    isLastChild: c.isLastChild,
    afterDirection: direction,
    style
  });
  return (
    <CactivaDropChild
      cactiva={cactiva}
      onDropOver={(value: boolean) => (meta.dropOver = value)}
      canDropOver={false}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={style || {}}>
          <CactivaDropMarker
            hover={meta.dropOver}
            direction={direction}
            stretch={hasNoChildren}
          />
          <CactivaChildren cactiva={cactiva} parentInfo={parentInfo} />
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
