import { renderChildren } from "@src/components/editor/utility/renderchild";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDroppable from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseValue } from "../../../utility/parser/parser";
import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import _ from "lodash";
import { toJS } from "mobx";
import {
  prepareChanges,
  commitChanges
} from "@src/components/editor/utility/elements/tools";
import CactivaChildren from "@src/components/editor/CactivaChildren";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseValue(props.style);
  const meta = useObservable({
    dropOver: false,
    canDropOver: true
  });
  const children = cactiva.source.children;
  const clength = (children && children.length) || 0;
  useEffect(() => {
    meta.canDropOver = clength === 0;
  }, [clength, meta.dropOver]);
  return (
    <CactivaDroppable
      cactiva={cactiva}
      modifyDropOver={(d: any) => {
        const item = d.childItem;
        d.meta.canDropOver = false;
        meta.canDropOver = false;
        if (item) {
          if (item.name === "JsxExpression") {
            meta.canDropOver = true;
            d.meta.canDropOver = true;
            meta.dropOver = true;
          }
        }
      }}
      onDropped={(item: any, type: string) => {
        if (type === "child") {
          const child = children.filter(
            (e: any) => e.kind === SyntaxKind.JsxExpression
          );
          if (child.length > 0) cactiva.source.children = child;
          meta.dropOver = false;
          meta.canDropOver = false;
        }
      }}
      onDropOver={(value: boolean) => {
        meta.dropOver = value;
      }}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable
          cactiva={cactiva}
          onDoubleClick={(e: any) => {
            e.preventDefault();
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
          }}
          style={{ flexDirection: "row", ...style, lineHeight: "auto" }}
          className="cactiva-element rn-text"
        >
          {meta.canDropOver && (
            <CactivaDropMarker
              hover={meta.dropOver}
              stretch={true}
              style={{ margin: "0px 5px" }}
            />
          )}

          <CactivaChildren
            cactiva={cactiva}
            parentInfo={(c: any) => ({
              canDropAfter: false
            })}
          />
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDroppable>
  );
});
