import CactivaChildren from "@src/components/editor/CactivaChildren";
import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import tags from "@src/components/traits/tags";
import { Text } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseStyle } from "../../../utility/parser/parser";
import editor from "@src/store/editor";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseStyle(props.style, cactiva);
  const meta = useObservable({ dropOver: false });
  const direction = _.get(style, "flexDirection", "column");
  const hasNoChildren = _.get(cactiva.source, "children.length", 0) === 0;
  const children = _.get(cactiva, "source.children", []);
  const onDoubleClick = () => {
    const editor = cactiva.editor;
    const selected = editor.selected;
    if (!tags[selected.source.name] && !!editor.imports[selected.source.name]) {
      const from = editor.imports[selected.source.name].from;
      if (from.indexOf('@') === 0) {
        editor.project.load('/' + from.substr(1) + '.tsx');
      }
    }
  };
  const parentInfo = (c: any) => ({
    ...cactiva.parentInfo,
    isLastChild: c.isLastChild,
    afterDirection: direction
  });
  return (
    <CactivaDropChild
      cactiva={cactiva}
      onDropOver={(value: boolean) => (meta.dropOver = value)}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} onDoubleClick={onDoubleClick}>
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
              <CactivaChildren cactiva={cactiva} parentInfo={parentInfo} />
            </div>
          )}
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
