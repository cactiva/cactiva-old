import { Menu, Popover, Text } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import { default as ceditor } from "@src/store/editor";
import { getParentId, addChildInId, removeElementById, prepareChanges, commitChanges } from "./utility/elements/tools";
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
      menuVisible: false,
      coord: { top: 0, left: 0 }
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
      meta.coord.top = e.pageY;
      meta.coord.left = e.pageX;
    }
    const toggleRef = useRef(null as any);
    const ref = useRef(null as any);
    return (
      <Popover
        statelessProps={{
          style: {
            top: meta.coord.top,
            left: meta.coord.left
          }
        }}
        content={
          <div className="ctree-menu" onClick={(e: any) => { e.stopPropagation(); }}>
            <Menu>
              <Menu.Item icon="add-to-folder" onSelect={() => {
                toggleRef.current();
              }}>
                Wrap In...
              </Menu.Item>
              {source.id.indexOf("_") > 0 && <>
                <Menu.Divider />
                <Menu.Item icon="select" onSelect={() => {
                  toggleRef.current();
                  if (ceditor.current) {
                    ceditor.current.selectedId = getParentId(source.id);
                  }
                }}>
                  Select Parent
</Menu.Item>
                <Menu.Item icon="arrow-up" onSelect={() => {
                  toggleRef.current();
                  if (ceditor.current) {
                    prepareChanges(ceditor.current);
                    const pid = getParentId(getParentId(source.id));
                    const el = removeElementById(ceditor.current.source, source.id);
                    addChildInId(ceditor.current.source, pid, el);
                    commitChanges(ceditor.current);
                  }
                }}>Move To Parent</Menu.Item>

              </>}
              <Menu.Divider />
              <Menu.Item icon="cut" onSelect={() => {
                toggleRef.current();
                editor.selectedId = source.id;
                ceditor.cut();
              }}>
                Cut (Ctrl+X)
              </Menu.Item>
              <Menu.Item icon="duplicate" onSelect={() => {
                toggleRef.current();
                editor.selectedId = source.id;
                ceditor.copy();
              }}>
                Copy (Ctrl+C)
              </Menu.Item>
              <Menu.Item icon="clipboard" onSelect={() => {
                toggleRef.current();
                editor.selectedId = source.id;
                ceditor.paste();
              }}>
                Paste (Ctrl+V)
              </Menu.Item>
            </Menu>
          </div>
        }
      >
        {({ toggle, getRef, isShown }: any) => {
          toggleRef.current = toggle;
          getRef(ref.current);
          return (<div className={`cactiva-selectable ${classes.selected ? 'selected' : ''}`}>
            <div
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
            </div>
          </div>)
        }}
      </Popover>
    );
  }
);
