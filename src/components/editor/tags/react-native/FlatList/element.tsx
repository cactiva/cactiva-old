import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import { renderChildren } from "@src/components/editor/utility/renderchild";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { generateExpression } from "@src/components/editor/utility/parser/generateExpression";
import { toJS } from "mobx";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = {};
  const meta = useObservable({ dropOver: false });
  const direction = _.get(style, "flexDirection", "column");
  const hasNoChildren = _.get(cactiva.source, "children.length", 0) === 0;
  const renderItem: any = _.get(cactiva.source, "props.renderItem.body[0]", {});
  return (
    <CactivaDropChild
      cactiva={cactiva}
      onDropped={(value: any) => console.log(value)}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={style}>
          <CactivaDropMarker
            hover={meta.dropOver}
            direction={direction}
            stretch={hasNoChildren}
          />
          {renderChildren(renderItem.value, cactiva.editor, cactiva.root)}
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
