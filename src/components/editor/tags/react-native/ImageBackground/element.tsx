import CactivaChildren from "@src/components/editor/CactivaChildren";
import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import { baseUrl } from "@src/store/editor";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseStyle } from "../../../utility/parser/parser";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseStyle(props.style, cactiva);
  const meta = useObservable({
    dropOver: false,
    edited: false,
    source: ""
  });
  const sourceImg = props.source || "";
  const quotedImg = sourceImg
    .match(/\(([^)]+)\)/)[1]
    .replace("@src/assets/images/", "");
  const imgPath = `${baseUrl}/assets/${quotedImg.substr(
    1,
    quotedImg.length - 2
  )}`;
  const backgroundImage = `url(${imgPath}), url('images/sample.jpg')`;
  return (
    <>
      <CactivaDropChild
        cactiva={cactiva}
        onDropOver={(value: boolean) => (meta.dropOver = value)}
      >
        <CactivaDraggable cactiva={cactiva}>
          <CactivaSelectable
            cactiva={cactiva}
            style={{ ...style, backgroundImage }}
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
