import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { useDrop } from 'react-dnd-cjs';
import { isParentOf } from './utility/elements/tools';
import { allTags } from './utility/tags';

export default observer(({ children, tag }: any) => {
  return (
    <>
      <div className={`_cactiva-drop-children `}>{children}</div>
      <div className={`_cactiva-drop-after `} />
    </>
  );
});

const canDrop = (rootCactiva: any, dragId: number, dropId: number) => {
  const isDragParentOfDrop = isParentOf(rootCactiva, dragId, dropId);
  if (isDragParentOfDrop || dragId == dropId) {
    return false;
  }
  return true;
};

const useCactivaDrop = (
  accept: string[],
  _cactiva: any,
  name: string,
  drop: any
) => {
  return useDrop({
    accept,
    drop,
    collect: monitor => {
      return {
        [name + 'DragItem']: monitor.getItem(),
        [name + 'Over']: monitor.isOver({ shallow: true })
      };
    }
  });
};
