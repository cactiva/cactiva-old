import { generateExpression } from "@src/components/editor/utility/parser/generateExpression";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import { renderChildren } from "@src/components/editor/utility/renderchild";
import { Popover, Text } from "evergreen-ui";
import { toJS } from "mobx";
import { observer, useObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import MonacoEditor from "react-monaco-editor";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDroppable from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import api from "@src/libs/api";
import { findElementById, prepareChanges, commitChanges } from "@src/components/editor/utility/elements/tools";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const meta = useObservable({
    loading: false,
    source: "",
    drag: {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      sx: 0,
      sy: 0,
      dragging: false
    }
  });
  const ref = useRef(null);
  const expressions = generateExpression(cactiva.source.value);

  return (
    <>
      <div
        style={{
          position: "fixed",
          left: meta.drag.sx,
          top: meta.drag.sy,
          transform: `translate(${meta.drag.dx}px, ${meta.drag.dy}px)`,
          width: 10,
          height: 10
        }}
        ref={ref}
      ></div>
      <CactivaDroppable cactiva={cactiva} canDropOver={false}>
        <CactivaDraggable cactiva={cactiva}>
          <Popover
            onClose={async () => {
              console.log(meta.source);
              const res = await api.post("morph/jsxexp", {
                value: JSON.stringify(meta.source)
              });
              res.value.id = cactiva.source.id;
              prepareChanges(cactiva.editor);
              cactiva.source.value = res.value;
              commitChanges(cactiva.editor);
            }}
            content={
              <Text
                style={{
                  width: "650px",
                  height: "450px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  backgroundColor: "#202123",
                  color: "white",
                  position: "relative",
                  userSelect: "none"
                }}
              >
                {meta.loading ? (
                  "Loading"
                ) : (
                  <>
                    <div
                      style={{
                        padding: "10px",
                        display: "flex",
                        alignSelf: "stretch",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                      onMouseDownCapture={e => {
                        meta.drag.x = e.screenX;
                        meta.drag.y = e.screenY;
                        meta.drag.dragging = true;
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      {/* <span>No error</span>
                      <span style={{ opacity: 0.5 }}></span> */}
                    </div>
                    <MonacoEditor
                      theme="vs-dark"
                      value={meta.source}
                      onChange={value => {
                        meta.source = value;
                      }}
                      editorWillMount={monaco => {
                        cactiva.editor.setupMonaco(monaco);
                      }}
                      width="100%"
                      height="100%"
                      language="typescript"
                    />
                  </>
                )}
              </Text>
            }
          >
            {({ getRef, toggle, isShown }) => {
              if (ref.current) getRef(ref.current);
              return (
                <CactivaSelectable
                  cactiva={cactiva}
                  onDoubleClick={(e: any) => {
                    e.preventDefault();
                    e.stopPropagation();
                    meta.source = generateSource(cactiva.source.value);
                    if (meta.drag.sx === 0) meta.drag.sx = e.clientX;
                    if (meta.drag.sy === 0) meta.drag.sy = e.clientY;
                    toggle();
                  }}
                >
                  <Text
                    style={{
                      padding: 5,
                      margin: 5,
                      borderRadius: 5,
                      border: "1px solid #ccc",
                      fontSize: 10,
                      color: "#000",
                      backgroundColor: "rgba(255,255,255,1)"
                    }}
                  >
                    {expressions.map((exp: any, key: number) => {
                      if (typeof exp === "string") {
                        return exp;
                      }
                      return (
                        <div key={key} style={{ paddingLeft: 10 }}>
                          {renderChildren(
                            {
                              kind: cactiva.source.kind,
                              id: cactiva.source.id,
                              child: {
                                id: cactiva.source.id + "_" + key,
                                value: exp
                              }
                            },
                            cactiva.editor,
                            cactiva.root,
                            () => ({
                              canDropAfter: false,
                              onDropped: (item: any, type: string) => {
                                console.log(toJS(exp));
                              }
                            })
                          )}
                        </div>
                      );
                    })}
                  </Text>
                </CactivaSelectable>
              );
            }}
          </Popover>
        </CactivaDraggable>
      </CactivaDroppable>
      {meta.drag.dragging && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 101
          }}
          onMouseUpCapture={e => {
            if (meta.drag.dragging) {
              meta.drag.dragging = false;
              meta.drag.sx += meta.drag.dx;
              meta.drag.dx = 0;
              meta.drag.sy += meta.drag.dy;
              meta.drag.dy = 0;
            }
          }}
          onMouseMoveCapture={e => {
            if (meta.drag.dragging) {
              meta.drag.dx = e.screenX - meta.drag.x;
              meta.drag.dy = e.screenY - meta.drag.y;
            }
          }}
        ></div>
      )}
    </>
  );
});
