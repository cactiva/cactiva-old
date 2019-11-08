import { observer } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseProps, parseStyle } from "../../../utility/parser/parser";
import { Icon } from "evergreen-ui";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const tagProps = parseProps(props);
  const style = tagProps.style || {};
  return (
    <CactivaDropChild cactiva={cactiva} canDropOver={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={style}>
          <div className="input camera" style={style}>
            <Icon icon="camera" size={14} />
          </div>
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
