import CactivaChildren from "@src/components/editor/CactivaChildren";
import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import { showAddInParent } from "@src/components/editor/CactivaEditor";
import { baseUrl } from "@src/store/editor";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseProps, parseStyle } from "../../../utility/parser/parser";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseStyle(cactiva.source.props.style, cactiva);
  const meta = useObservable({
    dropOver: false,
    edited: false,
    source: "",
    bg: ""
  });

  const tagProps = parseProps(cactiva.source.props);

  useEffect(() => {
    let sourceImg = "";
    if (Array.isArray(tagProps.source)) {
      tagProps.source.map((i: any) => {
        sourceImg += i;
      })
    }
    const quotedImg = sourceImg.replace("@src/assets/images/", "");

    meta.source = !!tagProps.source
      ? baseUrl + "/assets/" + quotedImg
      : "images/sample.jpg";
    meta.bg = `url(${meta.source}), url('images/sample.jpg')`;
  }, [props.source]);

  const direction = _.get(style, "flexDirection", "column");
  const hasNoChildren = _.get(cactiva.source, "children.length", 0) === 0;
  const parentInfo = (c: any) => ({
    
    isLastChild: c.isLastChild,
    afterDirection: direction
  });
  return (
    <>
      <CactivaDropChild
        cactiva={cactiva}
        onDropOver={(value: boolean) => (meta.dropOver = value)}
      >
        <CactivaDraggable cactiva={cactiva}>
          <CactivaSelectable
            cactiva={cactiva}
            style={{ ...style, backgroundImage: meta.source }}
          >
            <CactivaDropMarker
              showAdd={showAddInParent(cactiva)}
              hover={meta.dropOver}
              direction={direction}
              stretch={hasNoChildren}
            />
            <CactivaChildren cactiva={cactiva} parentInfo={parentInfo} />
          </CactivaSelectable>
        </CactivaDraggable>
      </CactivaDropChild>
    </>
  );
});
