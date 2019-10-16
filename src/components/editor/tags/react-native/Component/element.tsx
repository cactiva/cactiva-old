import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseValue } from "../../../utility/parser/parser";
import { renderChildren } from "../../../utility/renderchild";
import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import _ from "lodash";
import { Text } from "evergreen-ui";
import CactivaChildren from "@src/components/editor/CactivaChildren";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseValue(props.style);
  const meta = useObservable({ dropOver: false });
  const direction = _.get(style, "flexDirection", "column");
  const hasNoChildren = _.get(cactiva.source, "children.length", 0) === 0;
  const children = _.get(cactiva, "source.children", []);
  return (
    <CactivaDropChild
      cactiva={cactiva}
      onDropOver={(value: boolean) => (meta.dropOver = value)}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva}>
          <Text
            style={{ fontSize: "9px", color: "#000", position: "absolute" }}
          >
            {cactiva.source.name}
          </Text>
          <CactivaDropMarker
            hover={meta.dropOver}
            direction={direction}
            stretch={hasNoChildren}
            style={
              children.length > 0
                ? {
                    marginTop: 15,
                    position: "absolute",
                    height: 5,
                    left: 5,
                    right: 5
                  }
                : {}
            }
          />

          {children.length > 0 && (
            <div
              style={{
                marginTop: 20,
                display: "flex",
                flexDirection: _.get(style, "flexDirection", "column"),
                alignItems: _.get(style, "alignItems", "stretch"),
                justifyContent: _.get(style, "justifyContent", "flex-start")
              }}
            >
              <CactivaChildren
                cactiva={cactiva}
                parentInfo={(c: any) => ({
                  isLastChild: c.isLastChild,
                  afterDirection: direction
                })}
              />
            </div>
          )}
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
