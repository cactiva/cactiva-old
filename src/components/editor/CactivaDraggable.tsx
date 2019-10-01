import { observer } from 'mobx-react-lite';
import React from 'react';
import { useDrag } from 'react-dnd-cjs';

export default observer(({ cactiva, children }: any) => {
  const { source, tag } = cactiva;
  const { id } = source;
  const [{ isDragging }, dragRef] = useDrag({
    item: {
      type: tag.tagName,
      id
    },
    collect: monitor => {
      return {
        isDragging: monitor.isDragging()
      };
    }
  });
  return (
    <div ref={dragRef} className={`${isDragging ? 'dragging' : ''}`}>
      {children}
    </div>
  );
});
