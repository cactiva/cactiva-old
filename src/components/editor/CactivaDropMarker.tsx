/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import React, { forwardRef } from "react";
import { Icon } from "evergreen-ui";

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
          {showAdd && <div className="add-btn" onClick={(e) => {
            e.nativeEvent.stopPropagation();
            e.nativeEvent.preventDefault();
          }}><Icon icon={'small-plus'} size={15} color={"#fff"} /></div>}</div>
      </div>
    );
  }
);
