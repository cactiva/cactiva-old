import CactivaChildren from "@src/components/editor/CactivaChildren";
import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import { showAddInParent } from "@src/components/editor/CactivaEditor";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseStyle, parseProps } from "../../../utility/parser/parser";
import { Icon } from "evergreen-ui";

export default observer((props: any) => { 
  const cactiva = props._cactiva;
  const style = parseStyle(cactiva.source.props.style, cactiva);
  const tagProps = parseProps(cactiva.source.props);
  const meta = useObservable({ dropOver: false });
  const direction = _.get(style, "flexDirection", "column");
  const hasNoChildren = _.get(cactiva.source, "children.length", 0) === 0;
  const parentInfo = (c: any) => ({
    isFirstChild: c.isFirstChild,
    isLastChild: c.isLastChild,
    afterDirection: direction,
    style
  });
  const sid = cactiva.editor.selectedId.split("_");
  if (sid.length > 1) {
    sid.pop();
  }
  return (
    <CactivaDropChild
      cactiva={cactiva}
      onDropOver={(value: boolean) => (meta.dropOver = value)}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable
          cactiva={cactiva}
          style={{
            minWidth: 300,
            flexGrow: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            ...style
          }}
        >
          <div className="header">
            {tagProps.backBtn === "true" && (
              <Icon icon="arrow-left" style={{ margin: 5 }} />
            )}
            <div className="title">
              {
                tagProps.title &&
                ({
                  string: tagProps.title,
                  object: tagProps.title.kind ? (
                    <CactivaChildren
                      cactiva={{ ...cactiva, source: tagProps.title }}
                    />
                  ) : ("")
                } as any)[typeof tagProps.title]
              }
            </div>
          </div>
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
