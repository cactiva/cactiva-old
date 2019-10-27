import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useDrop } from "react-dnd-cjs";
import CactivaDropMarker from "./CactivaDropMarker";
import {
  addChildInId,
  commitChanges,
  createNewElement,
  findElementById,
  insertAfterElementId,
  isParentOf,
  prepareChanges,
  removeElementById
} from "./utility/elements/tools";

export default observer(
  ({
    cactiva,
    children,
    onDropOver,
    modifyDropOver,
    onDropped,
    canDropOver = true,
    canDropAfter = true
  }: any) => {
    const { root, tag, source, editor, parentInfo } = cactiva;
    const insertTo = (tag && tag.insertTo) || "children";
    const afterDirection = _.get(parentInfo, "afterDirection", "column");
    const isLastChild = _.get(parentInfo, "isLastChild", false);
    const isFirstChild = _.get(parentInfo, "isFirstChild", false);
    const parentJustifyContent = _.get(
      parentInfo,
      "style.justifyContent",
      "flex-start"
    );
    let isAfterStretched = isLastChild;

    if (parentJustifyContent === "space-between") {
      if (isLastChild) {
        isAfterStretched = false;
      } else {
        isAfterStretched = true;
      }
    } else if (parentJustifyContent !== "flex-start") {
      isAfterStretched = false;
    }

    const { id } = source;
    const onDroppedEvent =
      parentInfo && parentInfo.onDropped ? parentInfo.onDropped : onDropped;
    const dropAfter = () => {
      let el = null;
      const child = findElementById(root, id);
      if (child) {
        prepareChanges(editor);
        if (afterItem.id === null) {
          el = createNewElement(afterItem.name);
        } else {
          el = removeElementById(root, afterItem.id);
        }
        if (el) {
          insertAfterElementId(root, child.id, el, insertTo);
        }
        commitChanges(editor);
      }
    };
    const dropChild = () => {
      let el = null;
      const child = findElementById(root, id);
      if (child) {
        prepareChanges(editor);
        if (childItem.id === null) {
          el = createNewElement(childItem.name);
        } else {
          el = removeElementById(root, childItem.id);
        }
        if (el) {
          addChildInId(root, child.id, el, insertTo);
        }
        commitChanges(editor);
      }
    };
    const [{ afterItem, afterOver }, afterDropRef] = useCactivaDrop(
      "after",
      ["element"],
      (item: any) => {
        if (afterOver && meta.canDropAfter) {
          dropAfter();
          if (onDroppedEvent) {
            onDroppedEvent(afterItem, "after");
          }
        }
        meta.canDropAfter = false;
      }
    );
    const [{ childItem, childOver }, childDropRef] = useCactivaDrop(
      "child",
      ["element"],
      () => {
        if (canDropAfter && !canDropOver) {
          if (childOver && meta.canDropAfter) {
            dropAfter();
            if (onDroppedEvent) {
              onDroppedEvent(childItem, "child");
            }
          }
        } else {
          if (childOver && meta.canDropChild) {
            dropChild();
            if (onDroppedEvent) {
              onDroppedEvent(childItem, "child");
            }
          }
        }
      }
    );
    const meta = useObservable({
      canDropAfter: false,
      canDropChild: false,
      hideDropAfter: false
    });

    useEffect(() => {
      meta.canDropAfter =
        canDropAfter && afterOver && canDrop(afterItem.id, id);

      if (canDropOver || !canDropAfter) {
        meta.canDropChild = childOver && canDrop(childItem.id, id);
      } else if (!meta.canDropAfter) {
        meta.canDropAfter = childOver && canDrop(childItem.id, id);
      }

      const parentCanDropAfter = _.get(cactiva, "parentInfo.canDropAfter");
      if (parentCanDropAfter !== undefined && parentCanDropAfter === false) {
        meta.canDropAfter = false;
        meta.hideDropAfter = true;
      }

      const parentCanDropChild = _.get(cactiva, "parentInfo.canDropChild");
      if (parentCanDropChild !== undefined && parentCanDropChild === false) {
        meta.canDropChild = false;
      }

      if (onDropOver) {
        onDropOver(meta.canDropChild);
      }

      if (modifyDropOver) {
        modifyDropOver({
          meta,
          childItem,
          afterItem
        });
      }
    }, [childOver, afterOver, canDropAfter, canDropOver]);

    let shouldShowAdd = false;
    if (id === editor.selectedId) {
      if (id !== "0")
        shouldShowAdd = true;
    } else {
      const sid = editor.selectedId.split("_");
      if (sid[sid.length - 1] > 0) {
        sid[sid.length - 1] = sid[sid.length - 1] - 1;
        if (id === sid.join("_")) {
          shouldShowAdd = true;
        }
      }
    }


    return (
      <>
        <div ref={childDropRef} className={`cactiva-drop-children`}>
          {children}
        </div>
        {!meta.hideDropAfter && (
          <CactivaDropMarker
            ref={afterDropRef}
            onMouseOver={() => {
              if (meta.canDropAfter && !childOver && !afterOver) {
                meta.canDropAfter = false;
              }
            }}
            hover={meta.canDropAfter}
            showAdd={shouldShowAdd}
            direction={afterDirection}
            stretch={isAfterStretched}
            placement="after"
          />
        )}
      </>
    );
  }
);

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
        [name + "Item"]: monitor.getItem(),
        [name + "Over"]: monitor.isOver({ shallow: true })
      };
    }
  });
};
