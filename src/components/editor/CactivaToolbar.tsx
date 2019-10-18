import { IconButton, Pane, Tooltip } from "evergreen-ui";
import _ from "lodash";
import { observer } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "./CactivaDraggable";
import { uuid } from "./utility/elements/tools";
import kinds from "./utility/kinds";
import tags from "./utility/tags";

export default observer((props: any) => {
  const { editor } = props;
  if (editor.rootSelected) return <div />;
  return (
    <div className="cactiva-toolbar">
      {_.map(toolbar, (v: any) => {
        return <Component key={uuid("toolbar")} value={v} />;
      })}
    </div>
  );
});

const Component = (props: any) => {
  const { value } = props;
  if (value.divider) {
    return (
      <Tooltip content={`-- ${value.divider} --`} position="right">
        <Pane>
          <div className="divider" />
        </Pane>
      </Tooltip>
    );
  }
  const tag = tags[value.label];
  const kind = kinds[value.label];
  if (!tag && !kind) {
    return null;
  }

  return (
    <CactivaDraggable cactiva={{ source: { id: null }, tag, kind }}>
      <div className="btn-toolbar">
        <Tooltip content={value.label} position="right">
          <IconButton icon={value.icon} height={30} />
        </Tooltip>
      </div>
    </CactivaDraggable>
  );
};

const toolbar = [
  // {
  //   icon: "search",
  //   label: "Search"
  // },
  // {
  //   divider: "primary"
  // },
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
    divider: "UI-Kitten"
  },
  {
    icon: "text-highlight",
    label: "Input"
  },
  {
    icon: "widget-header",
    label: "Select"
  },
  {
    icon: "symbol-square",
    label: "Button"
  },
  {
    icon: "th",
    label: "Datepicker"
  },
  {
    icon: "ring",
    label: "RadioGroup"
  },
  {
    icon: "tick-circle",
    label: "CheckBox"
  },
  {
    divider: "Media"
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
    divider: "Layout"
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
    divider: "Code"
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
