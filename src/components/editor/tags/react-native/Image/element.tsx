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
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";

export default observer((props: any) => {
  const meta = useObservable({
    edited: false,
    source: ""
  });
  const cactiva = props._cactiva;
  const tagProps = parseProps(props);
  const sourceImg = tagProps.source || "";
  const quotedImg =
    sourceImg &&
    sourceImg.match(/\(([^)]+)\)/)[1].replace("@src/assets/images/", "");
  tagProps.src = !!tagProps.source
    ? baseUrl + "/assets/" + quotedImg.substr(1, quotedImg.length - 2)
    : "images/sample.jpg";
  useEffect(() => {
    meta.source = tagProps.source;
  }, [tagProps.source]);
  const onChangeImage = (v: any) => {
    prepareChanges(cactiva.editor);
    if (!props.source) {
      cactiva.source.props.source = {
        kind: SyntaxKind.CallExpression,
        value: v
      };
    } else {
      props.source.value = v;
    }
    commitChanges(cactiva.editor);
  };
  const onDoubleClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    meta.edited = true;
  };
  const onError = (e: any) => {
    e.target.onerror = null;
    e.target.src = "images/sample.jpg";
  };
  return (
    <>
      <CactivaDropChild cactiva={cactiva} canDropOver={false}>
        <CactivaDraggable cactiva={cactiva}>
          <CactivaSelectable cactiva={cactiva} onDoubleClick={onDoubleClick}>
            <img
              style={tagProps.style}
              src={tagProps.src}
              className={`${tagProps.source ? "" : "img-sample"}`}
              onError={onError}
            />
          </CactivaSelectable>
        </CactivaDraggable>
      </CactivaDropChild>
      <ImageBrowse
        value={meta.source}
        onChange={onChangeImage}
        onDismiss={(e: any) => (meta.edited = e)}
        isShown={meta.edited}
      />
    </>
  );
});
