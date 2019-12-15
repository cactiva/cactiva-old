import editor from "@src/store/editor";
import { Icon } from "evergreen-ui";
import React, { forwardRef } from "react";

export default forwardRef(
  (
    {
      hover,
      onMouseOver,
      direction,
      style,
      childStyle,
      stretch = false,
      showAdd = false,
      placement = "child"
    }: any,
    ref: any
  ) => {
    const mode = `${direction === "row" ? "width" : "height"}`;
    let bg = "transparent";
    if (hover) bg = "rgba(54, 172, 232, .4)";
    if (showAdd) bg = "rgba(54, 172, 232, .1)";

    return (
      <div
        className="cactiva-drop-marker"
        ref={ref}
        onMouseOver={onMouseOver}
        style={{
          display: 'flex',
          flexDirection: direction,
          flexBasis: '5px',
          [`min` + mode]: '5px',
          [mode]: stretch ? '100%' : '5px',
          alignSelf: 'stretch',
          flex: stretch ? 1 : undefined,
          ...style
        }}
      >
        <div
          style={{
            alignSelf: 'stretch',
            flex: 1,
            borderRadius: '3px',
            margin: placement === "child" && stretch
              ? "5px 0px"
              : stretch && direction === "row"
                ? "0px 5px"
                : "0px",
            minWidth: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '5px',
            background: bg,
            ...childStyle
          }}
        >
          {!hover && showAdd && (
            <div
              className="add-btn"
              onClickCapture={(e: any) => {
                e.stopPropagation();
                e.preventDefault();
                if (editor && editor.current) {
                  let id = editor.current.selectedId;

                  if (showAdd !== true && !!showAdd) {
                    id = showAdd;
                  }
                  editor.current.addComponentInfo = {
                    id,
                    placement,
                    status: "add"
                  };
                }
              }}
            >
              <Icon icon={"small-plus"} size={15} color={"#fff"} />
            </div>
          )}
        </div>
      </div>
    );
  }
);
