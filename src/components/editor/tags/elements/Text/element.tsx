import CactivaChildren from "@src/components/editor/CactivaChildren";
import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import {
  commitChanges,
  prepareChanges
} from "@src/components/editor/utility/elements/tools";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDroppable from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseStyle } from "../../../utility/parser/parser";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseStyle(cactiva.source.props.style, cactiva);
  const meta = useObservable({
    dropOver: false,
    canDropOver: true
  });
  const children = cactiva.source.children;
  const clength = (children && children.length) || 0;
  const onDoubleClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const hasJsxExpression =
      _.get(children, "0.kind") === SyntaxKind.JsxExpression;

    if (!hasJsxExpression) {
      let text = prompt("Text:", _.get(children, "0.value"));
      if (text !== null) {
        prepareChanges(cactiva.editor);
        children[0] = {
          kind: SyntaxKind.JsxText,
          value: text
        };
        commitChanges(cactiva.editor);
      }
    }
  };
  const onDropOver = (value: boolean) => {
    meta.dropOver = value;
  };
  useEffect(() => {
    meta.canDropOver = clength === 0;
  }, [clength, meta.dropOver]);

  return (
    <CactivaDroppable cactiva={cactiva} onDropOver={onDropOver}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable
          cactiva={cactiva}
          onDoubleClick={onDoubleClick}
          style={{ ...style, flexDirection: "row", lineHeight: "auto" }}
          className="cactiva-element rn-text"
        >
          {meta.canDropOver && (
            <CactivaDropMarker
              hover={meta.dropOver}
              stretch={true}
              style={{ margin: "0px 5px" }}
            />
          )}

          <div className="text-element">
            <CactivaChildren
              cactiva={cactiva}
              parentInfo={(c: any) => ({
                canDropAfter: false
              })}
            />
          </div>
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDroppable>
  );
});
