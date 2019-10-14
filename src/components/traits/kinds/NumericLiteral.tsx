import { Icon } from "evergreen-ui";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { ICactivaTraitFieldProps } from "../CactivaTraitField";
import _ from "lodash";
import "./NumericLiteral.scss";
import { toJS } from "mobx";

export default observer((trait: ICactivaTraitFieldProps) => {
  const meta = useObservable({
    value: trait.value,
    clicked: false,
    moving: false,
    direction: "vertical",
    directionCount: 0,
    y: -1,
    x: -1,
    cx: 0,
    cy: 0,
    startValue: parseInt(trait.value) || 0
  });
  const minValue = _.get(trait, "options.minValue", undefined);
  const maxValue = _.get(trait, "options.maxValue", undefined);
  useEffect(() => {
    meta.value = trait.value || trait.default;
  }, [trait.value]);
  return (
    <>
      <div
        className={`trait-numeric-literal ${_.get(
          trait,
          "options.className"
        )} ${meta.clicked ? "clicked" : ""}`}
        style={{ ...trait.style, flexDirection: "row" }}
      >
        <input
          className={`cactiva-trait-input ${meta.clicked ? "focus" : ""}`}
          type="text"
          value={meta.value || ""}
          placeholder={_.get(trait, "options.fields.name")}
          onKeyDown={e => {
            if (e.which === 13) (e.target as any).blur();
          }}
          onChange={e => {
            meta.value = e.target.value.replace(/[^0-9\-]/gi, "");
          }}
          onFocus={e => {
            e.target.select();
          }}
          onBlur={e => {
            const val = parseInt(meta.value);
            if (!isNaN(val)) {
              trait.update(val);
            }
          }}
        />
        <div
          className="arrow"
          style={{
            flexDirection: meta.direction === "vertical" ? "column" : "row",
            width: meta.direction === "vertical" ? 12 : 20
          }}
          onMouseDown={() => {
            meta.clicked = true;
          }}
        >
          <div className="arrow-btn">
            <Icon
              icon={meta.direction === "vertical" ? "caret-up" : "caret-left"}
              size={meta.direction === "vertical" ? 8 : 9}
            />
          </div>
          <div
            style={
              meta.direction === "vertical"
                ? {
                    borderBottom: "1px solid #ececeb"
                  }
                : {
                    borderRight: "1px solid #ececeb"
                  }
            }
          />
          <div className="arrow-btn">
            <Icon
              icon={
                meta.direction === "vertical" ? "caret-down" : "caret-right"
              }
              size={meta.direction === "vertical" ? 8 : 9}
            />
          </div>
        </div>
      </div>

      {meta.clicked && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            cursor: meta.direction === "vertical" ? "ns-resize" : "ew-resize",
            right: 0,
            zIndex: 22
          }}
          onMouseUpCapture={e => {
            meta.clicked = false;
            meta.startValue = meta.value;
            meta.direction = "vertical";
            const val = parseInt(meta.value);
            if (!isNaN(val)) {
              trait.update(val);
            }
            e.stopPropagation();
          }}
          onMouseMove={e => {
            if (!meta.moving) {
              meta.moving = true;
              meta.y = e.nativeEvent.screenY;
              meta.x = e.nativeEvent.screenX;
            }

            if (meta.clicked) {
              const dy = e.nativeEvent.screenY - meta.y;
              const dx = e.nativeEvent.screenX - meta.x;
              let v = meta.startValue + dy + dx;
              const cdx = meta.cx - e.nativeEvent.clientX;
              const cdy = meta.cy - e.nativeEvent.clientY;
              const newDirection =
                Math.abs(cdx) > Math.abs(cdy) ? "horizontal" : "vertical";

              if (newDirection !== meta.direction) {
                meta.directionCount++;
              } else {
                meta.directionCount = 0;
              }

              if (meta.directionCount > 3) {
                meta.direction = newDirection;
                meta.directionCount = 0;
              }

              meta.cx = e.nativeEvent.clientX;
              meta.cy = e.nativeEvent.clientY;
              if (minValue !== undefined && v < minValue) {
                v = minValue;
              } else if (maxValue !== undefined && v > maxValue) {
                v = maxValue;
              }
              meta.value = v;
            }
          }}
        />
      )}
    </>
  );
});
