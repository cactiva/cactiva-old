import React from "react";
import { observer, useObservable } from "mobx-react-lite";
import { SearchInput, Icon, Text } from "evergreen-ui";
import { uuid } from "./utility/elements/tools";
import { fuzzyMatch } from "../ctree/CactivaTree";

export default observer(({ title, icon, onSelect }: any) => {
    const meta = useObservable({
        filter: ""
    });
    return <div className="choose-component" style={{ flex: 1 }} onContextMenuCapture={(e) => {
        e.stopPropagation();
        e.preventDefault();
    }} onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
    }}>
        {title && <div className="title">{icon && <Icon icon={icon} size={12} />}{title}</div>}
        <SearchInput
            className="search"
            placeholder="Search"
            width="100%"
            height={25}
            onChange={(e) => {
                meta.filter = (e.target.value);
            }}
            spellCheck={false}
        />
        <div className="list">
            <div className="components">
                <div>
                    {toolbar.filter((item) => {
                        if (meta.filter.length > 0)
                            return fuzzyMatch(meta.filter.toLowerCase(), item.label.toLowerCase())
                        return true;
                    }).map(item => {
                        return <div onClick={() => {
                            if (onSelect)
                                onSelect(item.label.toLowerCase());
                        }} key={uuid("component-choose")} className="item">
                            <Icon icon={item.icon} size={14} color={"#999"} /> {item.label}
                        </div>;
                    })}
                </div>
            </div>
            <div className="custom">
                <div className="item"
                    onClick={() => {
                        if (onSelect)
                            onSelect("custom");
                    }}>
                    <Icon icon={"code"} size={14} color={"#999"} /> Custom
                </div>
                <div className="item"
                    onClick={() => {
                        if (onSelect)
                            onSelect("if");
                    }}>
                    <Icon icon={"code-block"} size={14} color={"#999"} /> If
                </div>
                <div className="item"
                    onClick={() => {
                        if (onSelect)
                            onSelect("if-else");
                    }}>
                    <Icon icon={"code-block"} size={14} color={"#999"} /> If Else
                </div>
                <div className="item"
                    onClick={() => {
                        if (onSelect)
                            onSelect("map");
                    }}>
                    <Icon icon={"code-block"} size={14} color={"#999"} /> Map
                </div>
            </div>
        </div>
    </div>
});


const toolbar = [
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
        icon: "page-layout",
        label: "View"
    },
    {
        icon: "control",
        label: "ScrollView"
    }
];
