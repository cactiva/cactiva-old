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
    touched: false,
    clicked: false,
    moving: false,
    direction: "vertical",
    directionCount: 0,
    y: -1,
    x: -1,
    cx: 0,
    cy: 0,
    timeout: -1 as any,
    startValue: parseInt(trait.value) || 0
  });
  const minValue = _.get(trait, "options.minValue", undefined);
  const maxValue = _.get(trait, "options.maxValue", undefined);
  const step = _.get(trait, "options.step", 1);
  const onClickedMouseMove = (e: any) => {
    if (!meta.moving) {
      meta.moving = true;
      meta.y = e.nativeEvent.screenY;
      meta.x = e.nativeEvent.screenX;
    }

    if (meta.clicked) {
      const dy = e.nativeEvent.screenY - meta.y;
      const dx = e.nativeEvent.screenX - meta.x;
      let v = meta.startValue + dy * step + dx * step;
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
      // meta.value = v;
      trait.update(v);
    }
  };
  const onClickedMouseUpCapture = (e: any) => {
    meta.clicked = false;
    meta.touched = false;
    meta.startValue = meta.value;
    meta.direction = "vertical";
    const val = parseInt(meta.value);
    if (!isNaN(val)) {
      trait.update(val);
    }
    e.stopPropagation();
  };
  const onDownMouseDownCapture = () => {
    if (!meta.value) meta.value = 0;
    meta.value = meta.value + step;
    if (minValue !== undefined && meta.value < minValue) {
      meta.value = minValue;
    } else if (maxValue !== undefined && meta.value > maxValue) {
      meta.value = maxValue;
    }
    meta.touched = true;
    clearTimeout(meta.timeout);
    meta.timeout = setTimeout(() => {
      if (meta.touched) {
        meta.clicked = true;
      }
      trait.update(meta.value);
    }, 300);
  };
  const onUpMouseDownCapture = () => {
    if (!meta.value) return;
    meta.value = meta.value - step;
    if (minValue !== undefined && meta.value < minValue) {
      meta.value = minValue;
    } else if (maxValue !== undefined && meta.value > maxValue) {
      meta.value = maxValue;
    }
    meta.touched = true;
    clearTimeout(meta.timeout);
    meta.timeout = setTimeout(() => {
      if (meta.touched) {
        meta.clicked = true;
      }
      trait.update(meta.value);
    }, 300);
  };
  const onChange = (e: any) => {
    meta.value = e.target.value.replace(/[^0-9\-]/gi, "");
  };
  const onBlur = (e: any) => {
    const val = parseInt(meta.value);
    if (!isNaN(val)) {
      trait.update(val);
    } else {
      trait.update(undefined);
    }
  };

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
          onKeyDown={(e:any) => {
            if (e.which === 13) (e.target as any).blur();
          }}
          onChange={onChange}
          onFocus={(e:any) => {
            e.target.select();
          }}
          onBlur={onBlur}
        />
        <div
          className="arrow"
          style={{
            flexDirection: meta.direction === "vertical" ? "column" : "row",
            width: meta.direction === "vertical" ? 12 : 20
          }}
        >
          <div
            className="arrow-btn"
            onMouseMove={() => {
              if (meta.touched) {
                meta.clicked = true;
              }
            }}
            onMouseUpCapture={() => {
              meta.touched = false;
            }}
            onMouseDownCapture={onUpMouseDownCapture}
          >
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
          <div
            className="arrow-btn"
            onMouseMove={() => {
              if (meta.touched) {
                meta.clicked = true;
              }
            }}
            onMouseUpCapture={() => {
              meta.touched = false;
            }}
            onMouseDownCapture={onDownMouseDownCapture}
          >
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
          onMouseUpCapture={onClickedMouseUpCapture}
          onMouseMove={onClickedMouseMove}
        />
      )}
    </>
  );
});
