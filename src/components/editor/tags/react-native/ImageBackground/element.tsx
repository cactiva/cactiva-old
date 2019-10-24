import CactivaChildren from "@src/components/editor/CactivaChildren";
import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import { baseUrl } from "@src/store/editor";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseStyle, parseProps } from "../../../utility/parser/parser";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseStyle(props.style, cactiva);
  const meta = useObservable({
    dropOver: false,
    edited: false,
    source: "",
    bg: ""
  });

  const tagProps = parseProps(props);

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
              hover={meta.dropOver}
              direction={_.get(style, "flexDirection", "column")}
            />
            <CactivaChildren cactiva={cactiva} />
          </CactivaSelectable>
        </CactivaDraggable>
      </CactivaDropChild>
    </>
  );
});
