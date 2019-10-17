import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import {
  commitChanges,
  prepareChanges
} from "@src/components/editor/utility/elements/tools";
import { renderChildren } from "@src/components/editor/utility/renderchild";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDroppable from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { parseProps, parseValue } from "../../../utility/parser/parser";
import CactivaChildren from "@src/components/editor/CactivaChildren";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseValue(props.style);
  const tagProps = parseProps(props);
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
      onBeforeDropOver={(item: any, type: string) => {
        if (type === "after") {
          return true;
        } else {
          if (item && item.name === "JsxExpression") {
            meta.canDropOver = true;
            meta.dropOver = true;
            return true;
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
      canDropOver={meta.canDropOver}
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
          className="cactiva-element"
        >
          <div
            className={`uik-field uik-button active ${_.get(
              tagProps,
              "status",
              "primary"
            )} ${_.get(tagProps, "size", "medium")} ${_.get(
              tagProps,
              "appearance",
              "filled"
            )} ${tagProps.disabled === "true" ? "disabled" : ""}`}
          >
            <div className={`uik-text`}>
              {meta.canDropOver ? (
                <CactivaDropMarker
                  hover={meta.dropOver}
                  stretch={true}
                  style={{ margin: "0px 5px" }}
                />
              ) : (
                <CactivaChildren
                  cactiva={cactiva}
                  parentInfo={() => ({
                    canDropAfter: false
                  })}
                />
              )}
            </div>
          </div>
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDroppable>
  );
});
