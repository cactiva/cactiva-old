import { Text, Popover, Menu } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useRef } from "react";
export default observer(
  ({
    cactiva,
    children,
    className = "cactiva-element",
    style,
    showElementTag = true,
    onBeforeSelect,
    onDoubleClick,
    ignoreClassName = [],
    onSelected
  }: any) => {
    const { editor, source } = cactiva;
    const meta = useObservable({
      hover: false,
      menuVisible: false
    });
    const classes: any = {
      hover: meta.hover ? "hover" : "",
      selected: editor.selectedId === source.id ? "selected" : "",
      horizontal: _.get(style, "flexDirection") === "row" ? "horizontal" : "",
      kind: cactiva.kind ? "kind" : ""
    };

    ignoreClassName.forEach((e: string) => {
      delete classes[e];
    });

    const name = cactiva.kind ? cactiva.kind.kindName : cactiva.tag.tagName;
    const onClick = async (e: any) => {
      e.preventDefault();
      e.stopPropagation();

      if (!(await editor.applySelectedSource())) {
        return;
      }

      if (onBeforeSelect) {
        onBeforeSelect(source.id);
      }

      editor.rootSelected = false;
      editor.selectedId = source.id;

      if (onSelected) {
        onSelected(source.id);
      }
    };
    const onMouseOut = (e: any) => {
      e.stopPropagation();
      meta.hover = false;
    };
    const onMouseOver = (e: any) => {
      e.stopPropagation();
      if (!meta.hover) meta.hover = true;
    };
    const onContextMenu = (e: any) => {
      e.stopPropagation();
      e.preventDefault();
      toggleRef.current();
      meta.menuVisible = true;
    }
    const toggleRef = useRef(null as any);
    const ref = useRef(null as any);
    return (
      <Popover
        content={
          <div className="ctree-menu" onClick={(e: any) => { e.stopPropagation(); }}>
            <Menu>
              <Menu.Item icon="new-text-box" onSelect={() => {
                toggleRef.current();
              }}>
                New Component
              </Menu.Item>
              <Menu.Item icon="folder-new" onSelect={() => {
                toggleRef.current();
              }}>
                New folder
              </Menu.Item>
            </Menu>
          </div>
        }
      >
        {({ toggle, getRef, isShown }: any) => {
          toggleRef.current = toggle;
          getRef(ref.current);
          return (<div
            ref={ref}
            style={{ ...style, opacity: 1, position: "relative" }}
            className={` ${Object.values(classes).join(" ")} ${className}`}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onDoubleClick={onDoubleClick}
            onClick={onClick}
            onContextMenu={onContextMenu}
          >
            {showElementTag && (
              <div
                className={`cactiva-element-tag ${classes.hover} ${classes.selected}`}
              >
                <Text size={300} color={"white"}>
                  {name}
                </Text>
              </div>
            )}
            {classes.selected && <div className="cactiva-el-cmenu"></div>}
            {children}
            {isShown && <div className="cactiva-el-cmenu"></div>}
            {isShown && <div
              onContextMenu={(e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleRef.current();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleRef.current();
              }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                zIndex: 11
              }}
            ></div>}
          </div>)
        }}
      </Popover>
    );
  }
);
