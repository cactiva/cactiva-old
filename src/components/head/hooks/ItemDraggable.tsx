import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useDrag } from "react-dnd-cjs";

export default observer(({ dragInfo, source, children }: any) => {
  const [{ isDragging }, dragRef] = useDrag({
    item: {
      type: "element",
      dragInfo,
      source
    },
    collect: monitor => {
      return {
        isDragging: monitor.isDragging()
      };
    }
  });

  return (
    <div ref={dragRef} className={`${isDragging ? "dragging" : ""}`}>
      {children}
    </div>
  );
});
