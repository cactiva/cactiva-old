import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useDrag } from "react-dnd-cjs";
import editor from "@src/store/editor";

export default observer(({ cactiva, dragInfo, children }: any) => {
  const { source, tag, kind } = cactiva;
  const { id } = source;
  const [{ isDragging }, dragRef] = useDrag({
    item: {
      type: "element",
      name: kind ? kind.kindName : tag.tagName,
      mode: kind ? "kind" : "tag",
      id,
      ...dragInfo
    },
    collect: monitor => {
      return {
        isDragging: monitor.isDragging()
      };
    }
  });

  useEffect(() => {
    if (isDragging && editor.current) {
      editor.current.selectedId = "";
    }
  }, [isDragging]);

  return (
    <div ref={dragRef} className={`${isDragging ? "dragging" : ""}`}>
      {children}
    </div>
  );
});
