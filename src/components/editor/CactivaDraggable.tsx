import { observer } from 'mobx-react-lite';
import React from 'react';
import { useDrag } from 'react-dnd-cjs';

export default observer(({ cactiva, children }: any) => {
  const { source, tag } = cactiva;
  const { id } = source;
  const dragHooks = useDrag({
    item: {
      type: tag.tagName,
      id
    }
  });
  return <div ref={dragHooks[1]}>{children}</div>;
});
