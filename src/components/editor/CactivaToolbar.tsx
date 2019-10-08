import { IconButton, Tooltip } from "evergreen-ui";
import _ from "lodash";
import React from "react";
import CactivaDraggable from "./CactivaDraggable";
import tags from "./utility/tags";
import kinds from "./utility/kinds";

export default () => {
  return (
    <div className="cactiva-toolbar">
      {_.map(toolbar, (v: any, i) => {
        if (v.divider) {
          return <div key={i} className="divider" />;
        }
        const tag = tags[v.label];
        const kind = kinds[v.label];
        if (!tag && !kind) {
          return null;
        }

        return (
          <CactivaDraggable
            key={i}
            cactiva={{ source: { id: null }, tag, kind }}
          >
            <div className="btn-toolbar">
              <Tooltip content={v.label} position="right">
                <IconButton icon={v.icon} height={30} />
              </Tooltip>
            </div>
          </CactivaDraggable>
        );
      })}
    </div>
  );
};

const toolbar = [
  {
    icon: "search",
    label: "Search"
  },
  {
    divider: "primary"
  },
  {
    icon: "font",
    label: "Text"
  },
  {
    icon: "new-text-box",
    label: "TextInput"
  },
  {
    icon: "widget-button",
    label: "TouchableOpacity"
  },
  {
    icon: "merge-links",
    label: "Dropdown"
  },
  {
    icon: "list-detail-view",
    label: "FlatList"
  },
  {
    icon: "tick",
    label: "CheckBox"
  },
  {
    icon: "segmented-control",
    label: "RadioGroup"
  },
  {
    divider: "media"
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
    divider: "layout"
  },
  {
    icon: "style",
    label: "ImageBackground"
  },
  {
    icon: "page-layout",
    label: "View"
  },
  {
    icon: "control",
    label: "ScrollView"
  },
  {
    divider: "code"
  },
  {
    icon: "function",
    label: "JsxExpression"
  },
  {
    icon: "merge-columns",
    label: "IfElse"
  },
  {
    icon: "column-layout",
    label: "Switch"
  }
];
