/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import editor from "@src/store/editor";
import { Icon } from "evergreen-ui";
import { forwardRef, useRef } from "react";

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
        {!hover && showAdd && (
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
              background: ${hover || showAdd
                ? "rgba(54, 172, 232, .4)"
                : "transparent"};
            `}
          >
            <div
              className="add-btn"
              onClickCapture={e => {
                e.stopPropagation();
                e.preventDefault();
                if (editor && editor.current) {
                  let id = editor.current.selectedId;
                  if (placement === "child") {
                    const cid = editor.current.selectedId.split("_");
                    cid.pop();
                    id = cid.join("_");
                  }
                  editor.current.addComponentInfo = {
                    id,
                    placement
                  };
                }
              }}
            >
              <Icon icon={"small-plus"} size={15} color={"#fff"} />
            </div>
          </div>
        )}
      </div>
    );
  }
);
