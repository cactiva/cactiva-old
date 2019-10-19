import CactivaChildren from "@src/components/editor/CactivaChildren";
import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import { baseUrl } from "@src/store/editor";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseProps } from "../../../utility/parser/parser";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const tagProps = parseProps(props);
  const meta = useObservable({
    dropOver: false,
    edited: false,
    source: ""
  });
  const sourceImg = tagProps.source || "";
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
            style={{ ...tagProps.style, backgroundImage }}
          >
            <CactivaDropMarker
              hover={meta.dropOver}
              direction={_.get(tagProps.style, "flexDirection", "column")}
            />
            <CactivaChildren cactiva={cactiva} />
          </CactivaSelectable>
        </CactivaDraggable>
      </CactivaDropChild>
    </>
  );
});
