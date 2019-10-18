import { Text } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
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
    const meta = useObservable({ hover: false });
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
      meta.hover = true;
    };
    let ElementTag = () => <div />;
    if (showElementTag) {
      ElementTag = () => (
        <div
          className={`cactiva-element-tag ${classes.hover} ${classes.selected}`}
        >
          <Text size={300} color={"white"}>
            {name}
          </Text>
        </div>
      );
    }
    return (
      <div
        style={{ ...style, opacity: 1 }}
        className={` ${Object.values(classes).join(" ")} ${className}`}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onDoubleClick={onDoubleClick}
        onClick={onClick}
      >
        <ElementTag />
        {children}
      </div>
    );
  }
);
