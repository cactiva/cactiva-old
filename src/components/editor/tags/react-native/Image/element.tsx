import ImageBrowse from "@src/components/traits/kinds/components/ImageBrowse";
import { baseUrl } from "@src/store/editor";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseProps } from "../../../utility/parser/parser";
import {
  prepareChanges,
  commitChanges
} from "@src/components/editor/utility/elements/tools";

export default observer((props: any) => {
  const meta = useObservable({
    edited: false,
    source: ""
  });
  const cactiva = props._cactiva;
  const tagProps = parseProps(props);
  const quotedImg = tagProps.source
    .match(/\(([^)]+)\)/)[1]
    .replace("@src/assets/images/", "");
  tagProps.src = !!tagProps.source
    ? baseUrl + "/assets/" + quotedImg.substr(1, quotedImg.length - 2)
    : "images/sample.jpg";
  useEffect(() => {
    meta.source = tagProps.source;
  }, [props]);
  return (
    <>
      <CactivaDropChild cactiva={cactiva} canDropOver={false}>
        <CactivaDraggable cactiva={cactiva}>
          <CactivaSelectable
            cactiva={cactiva}
            onDoubleClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
              meta.edited = true;
            }}
          >
            <img
              {...tagProps}
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = "images/sample.jpg";
              }}
            />
          </CactivaSelectable>
        </CactivaDraggable>
      </CactivaDropChild>

      <ImageBrowse
        value={meta.source}
        onChange={(v: any) => {
          prepareChanges(cactiva.editor);
          props.source.value = meta.source = v;
          commitChanges(cactiva.editor);
        }}
        onDismiss={(e: any) => (meta.edited = e)}
        isShown={meta.edited}
      />
    </>
  );
});
