import { observer } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseProps, parseStyle } from "../../../utility/parser/parser";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseStyle(props.style);
  const tagProps = parseProps(props);
  return (
    <CactivaDropChild cactiva={cactiva} canDropOver={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={style}>
          <div className="rn-text-input" style={style}>
            {tagProps.defaultValue ? (
              tagProps.defaultValue
            ) : (
              <div className="placeholder">{tagProps.placeholder}</div>
            )}
          </div>
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
