import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { useDrop } from 'react-dnd-cjs';
import {
  insertAfterElementId,
  isParentOf,
  removeElementById,
  addChildInId,
  findElementById,
  captureSelected,
  restoreSelected
} from './utility/elements/tools';
import { allTags } from './utility/tags';

export default observer(({ children, root, onDropOver, id, editor }: any) => {
  const [{ afterItem, afterOver }, afterDropRef] = useCactivaDrop(
    'after',
    allTags,
    (item: any) => {
      if (afterOver && meta.canDropAfter) {
        captureSelected(root, editor);
        const child = findElementById(root, id);
        const el = removeElementById(root, afterItem.id);
        insertAfterElementId(root, child.id, el);
        restoreSelected(editor);
      }
    }
  );
  const [{ childItem, childOver }, childDropRef] = useCactivaDrop(
    'child',
    allTags,
    () => {
      if (childOver && meta.canDropChild) {
        captureSelected(root, editor);
        const child = findElementById(root, id);
        const el = removeElementById(root, childItem.id);
        addChildInId(root, child.id, el);
        restoreSelected(editor);
      }
    }
  );
  const meta = useObservable({
    canDropAfter: false,
    canDropChild: false
  });

  useEffect(() => {
    meta.canDropAfter = afterOver && canDrop(afterItem.id, id);
    meta.canDropChild = childOver && canDrop(childItem.id, id);

    if (onDropOver) {
      onDropOver(meta.canDropChild);
    }
  }, [childOver, afterOver]);

  return (
    <>
      <div ref={childDropRef} className={`cactiva-drop-children`}>
        {children}
      </div>
      <div
        ref={afterDropRef}
        onMouseOver={e => e.stopPropagation()}
        className={`cactiva-drop-after ${meta.canDropAfter && 'hover'}`}
      />
    </>
  );
});

const canDrop = (dragId: string, dropId: string) => {
  const isDragParentOfDrop = isParentOf(dragId, dropId);
  if (isDragParentOfDrop || dragId == dropId) {
    return false;
  }
  return true;
};

const useCactivaDrop = (name: string, accept: string[], drop: any) => {
  return useDrop({
    accept,
    drop,
    collect: monitor => {
      return {
        [name + 'Item']: monitor.getItem(),
        [name + 'Over']: monitor.isOver({ shallow: true })
      };
    }
  });
};
