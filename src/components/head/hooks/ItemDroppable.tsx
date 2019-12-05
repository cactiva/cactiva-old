import React from "react";
import { observer } from "mobx-react-lite";
import { useDrop } from "react-dnd-cjs";
import { commitHooks } from "@src/components/editor/utility/elements/tools";

export default observer(({ dropInfo, children }: any) => {
  const [{ hover }, dropRef] = useDrop({
    accept: ["element"],
    drop: (item: any) => {
      if (hover) {
        commitHooks();
        const idx = item.source.findIndex((x: any) => x === item.dragInfo);
        item.source.splice(idx, 1);
        const hoverIdx = item.source.findIndex((x: any) => x === dropInfo);
        item.source.splice(hoverIdx, 0, item.dragInfo);
      }
    },
    collect: monitor => {
      return {
        hover: monitor.isOver({ shallow: true })
      };
    }
  });
  return (
    <div ref={dropRef} className={`cactiva-drop-children`}>
      {children}
    </div>
  );
});
