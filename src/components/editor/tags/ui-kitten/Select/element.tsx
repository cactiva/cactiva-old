import { observer } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseProps, parseValue } from "../../../utility/parser/parser";
import { renderChildren } from "@src/components/editor/utility/renderchild";
import { toJS } from "mobx";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import { Icon } from "evergreen-ui";

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
            <div className="uik-input uik-select">
              {tagProps.defaultValue ? (
                tagProps.defaultValue
              ) : (
                <div className="placeholder">{tagProps.placeholder}</div>
              )}
              <Icon icon="chevron-up" size={20} />
            </div>
          </div>
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});