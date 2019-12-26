import { Icon } from "evergreen-ui";
import { observer } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseProps } from "../../../utility/parser/parser";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const tagProps = parseProps(cactiva.source.props);
  const style = tagProps.style || {};
  return (
    <CactivaDropChild cactiva={cactiva} canDropOver={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={style}>
          <div className="input select" style={style}>
            {tagProps.defaultValue ? (
              tagProps.defaultValue
            ) : (
              <div className="placeholder">{tagProps.placeholder}</div>
            )}
            <Icon icon="chevron-down" size={14} />
          </div>
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
