import { Icon, SearchInput } from "evergreen-ui";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { fuzzyMatch } from "../ctree/CactivaTree";
import { uuid } from "./utility/elements/tools";

export default observer(({ title, icon, onSelect, items = [], disableCustomItems = [] }: any) => {
  const meta = useObservable({
    filter: "",
    toolbar: toolbar
  });
  useEffect(() => {
    if (items.length > 0) meta.toolbar = items;
  }, [items]);
  return (
    <div
      className="choose-component"
      style={{ flex: 1 }}
      onContextMenuCapture={(e: any) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onClick={(e: any) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {title && (
        <div className="title">
          {icon && <Icon icon={icon} size={12} />}
          {title}
        </div>
      )}
      <SearchInput
        className="search"
        placeholder="Search"
        width="100%"
        height={25}
        onChange={(e: any) => {
          meta.filter = e.target.value;
        }}
        spellCheck={false}
      />
      <div className="list">
        <div className="components">
          <div>
            {meta.toolbar
              .filter((item: any) => {
                if (meta.filter.length > 0)
                  return fuzzyMatch(
                    meta.filter.toLowerCase(),
                    item.label.toLowerCase()
                  );
                return true;
              })
              .map((item: any) => {
                return (
                  <div
                    onClick={() => {
                      if (onSelect) onSelect(item.label);
                    }}
                    key={uuid("component-choose")}
                    className="item"
                  >
                    <Icon icon={item.icon} size={14} color={"#999"} />{" "}
                    {item.label}
                  </div>
                );
              })}
          </div>
        </div>
        <div className="custom">
          <div
            className="item"
            onClick={() => {
              if (onSelect) onSelect("custom-component");
            }}
          >
            <Icon icon={"code"} size={14} color={"#999"} /> Component
          </div>
          <div
            className="item"
            onClick={() => {
              if (onSelect) onSelect("expr");
            }}
          >
            <Icon icon={"code-block"} size={14} color={"#999"} /> Expression
          </div>
          <div
            className="item"
            onClick={() => {
              if (onSelect) onSelect("if");
            }}
          >
            <Icon icon={"code-block"} size={14} color={"#999"} /> If
          </div>
          <div
            className="item"
            onClick={() => {
              if (onSelect) onSelect("if-else");
            }}
          >
            <Icon icon={"code-block"} size={14} color={"#999"} /> If Else
          </div>
          <div
            className="item"
            onClick={() => {
              if (onSelect) onSelect("switch");
            }}
          >
            <Icon icon={"code-block"} size={14} color={"#999"} /> Switch
          </div>
          <div
            className="item"
            onClick={() => {
              if (onSelect) onSelect("map");
            }}
          >
            <Icon icon={"code-block"} size={14} color={"#999"} /> Map
          </div>
          {disableCustomItems.indexOf('generate') < 0 &&
            <>
              <div style={{ borderTop: '1px solid #ccc' }} />
              <div
                className="item"
                onClick={() => {
                  if (onSelect) onSelect("generate-crud");
                }}
              ><Icon icon={"form"} size={14} color={"#999"} /> Generate CRUD</div>
            </>
          }
        </div>
      </div>
    </div>
  );
});

export const toolbar = [
  {
    icon: "page-layout",
    label: "View"
  },
  {
    icon: "font",
    label: "Text"
  },
  {
    icon: "text-highlight",
    label: "Input"
  },
  {
    icon: "symbol-square",
    label: "Button"
  },
  {
    icon: "widget-header",
    label: "Select"
  },
  {
    icon: "calendar",
    label: "DatePicker"
  },
  {
    icon: "time",
    label: "TimePicker"
  },
  {
    icon: "tick",
    label: "Checkbox"
  },
  {
    icon: "record",
    label: "Radio"
  },
  {
    icon: "ring",
    label: "RadioGroup"
  },
  {
    icon: "tick-circle",
    label: "CheckboxGroup"
  },
  {
    icon: "camera",
    label: "Camera"
  },
  {
    icon: "map-marker",
    label: "Location"
  },
  {
    icon: "new-text-box",
    label: "Field"
  },
  {
    icon: "form",
    label: "Form"
  },
  {
    icon: "list-detail-view",
    label: "FlatList"
  },
  {
    icon: "layers",
    label: "Carousel"
  },
  {
    icon: "star",
    label: "Icon"
  },
  {
    icon: "media",
    label: "Image"
  },
  {
    icon: "style",
    label: "ImageBackground"
  },
  {
    icon: "segmented-control",
    label: "Header"
  },
  {
    icon: "grid",
    label: "SimpleTable"
  },
  {
    icon: "drag-handle-horizontal",
    label: "SimpleTableColumn"
  },
  {
    icon: "circle",
    label: "Spinner"
  }
];
