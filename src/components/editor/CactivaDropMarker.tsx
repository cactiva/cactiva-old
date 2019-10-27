/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import React, { forwardRef, useRef, useState } from "react";
import { Icon, Popover } from "evergreen-ui";
import editor from "@src/store/editor";
import CactivaComponentChooser from "./CactivaComponentChooser";
import { insertAfterElementId, addChildInId } from "./utility/elements/tools";

export default forwardRef(
  (
    {
      hover,
      onMouseOver,
      direction,
      style,
      stretch = false,
      showAdd = false,
      placement = "child"
    }: any,
    ref: any
  ) => {
    const mode = `${direction === "row" ? "width" : "height"}`;
    const toggleRef = useRef(null as any);
    return (
      <div
        className="cactiva-drop-marker"
        ref={ref}
        onMouseOver={onMouseOver}
        css={css`
          display: flex;
          flex-direction: ${direction};
          flex-basis: 5px;
          ${"min-" + mode}: 5px;
          ${mode}: 5px;
          align-self: stretch;
          ${stretch
            ? `flex:1;
            ${mode}:100%;`
            : ``}
        `}
        style={style}
      >
        <div
          css={css`
            align-self: stretch;
            flex: 1;
            border-radius: 3px;
            margin: ${placement === "child" && stretch
              ? "5px 0px"
              : stretch && direction === "row"
                ? "0px 5px"
                : "0px"};
            min-width: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 5px;
            background: ${hover || showAdd ? "rgba(54, 172, 232, .4)" : "transparent"};
          `}
        >
          {!hover && showAdd && <Popover statelessProps={{
            style: {
              top: '50%',
              left: '50%',
              position: "fixed",
              marginLeft: '-150px',
              marginTop: '-200px',
              width: '300px',
              height: '400px'
            }
          }} content={<CactivaComponentChooser
            title={"Add Component"}
            icon={"plus"}
            onSelect={(value: any) => {
              if (toggleRef && toggleRef.current)
                toggleRef.current();

              if (editor.current) {
                let id = editor.current.selectedId;
                if (placement === "child") {
                  const cid = editor.current.selectedId.split("_")
                  cid.pop();
                  id = cid.join("_");
                }

                if (placement === "after") {
                  // insertAfterElementId(editor.current.source, id, {source: {id: null}, tag, kind})
                } else {
                  // addChildInId(editor.current.source, id,  {source: {id: null}, tag, kind});
                }
                console.log(value, id, placement);
              }
            }} />}>
            {({ toggle, getRef, isShown }: any) => {
              toggleRef.current = toggle;
              return <div className="add-btn" onClickCapture={(e) => {
                e.stopPropagation();
                e.preventDefault();
                toggle();
              }}><Icon icon={'small-plus'} size={15} color={"#fff"} />
                {isShown && <div
                  onContextMenu={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggle();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggle();
                  }}
                  style={{
                    position: "fixed",
                    top: 0,
                    cursor: "pointer",
                    left: 0,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    bottom: 0,
                    right: 0,
                    zIndex: 11
                  }}
                ></div>}
              </div>
            }}</Popover>}
        </div>
      </div>
    );
  }
);
