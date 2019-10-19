import { observer } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseProps, parseValue } from "../../../utility/parser/parser";
import { toJS } from "mobx";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseValue(props.style);
  const tagProps = parseProps(props);

  return (
    <CactivaDropChild cactiva={cactiva} canDropOver={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable
          cactiva={cactiva}
          style={style}
          className="cactiva-element"
        >
          <div className="uik-field">
            <div className="uik-input">
              {tagProps.date ? (
                tagProps.date
              ) : (
                <div className="placeholder">dd/mm/yyyy</div>
              )}
            </div>
          </div>
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
