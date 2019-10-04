import _ from 'lodash';
import { toJS, observable } from 'mobx';
import { getDiff } from 'recursive-diff';
import { isTag } from '../tagmatcher';
import tags from '../tags';
import kinds from '../kinds';

export const getIds = (id: string | string[]) =>
  Array.isArray(id) ? _.clone(id) : id.split('_');

export const findElementById = (root: any, id: string | string[]): any => {
  const ids = getIds(id);
  const rid = ids.shift();

  if (ids.length === 0 && rid == root.id) return root;
  let el = root;

  for (let i in ids) {
    if (isTag(el)) {
      const cid = parseInt(ids[i]);
      if (el && el.children && el.children.length > cid && el.children[cid]) {
        el = el.children[cid];
      }
    } else {
      if (!!el && !!el.value) {
        el = el.value;
      }
    }
  }
  if (el) {
    return el;
  }
};

export const findParentElementById = (
  root: any,
  id: string | string[]
): any => {
  const ids = getIds(id);
  ids.pop();
  const child = findElementById(root, ids);
  if (child) return child;
};

export const removeElementById = (root: any, id: string | string[]) => {
  const ids = getIds(id);
  const parent = findParentElementById(root, id);
  const index = parseInt(ids[ids.length - 1] || '-1');
  if (
    parent &&
    parent.children &&
    parent.children.length > index &&
    parent.children[index]
  ) {
    const result = parent.children[index];
    parent.children.splice(index, 1);
    return result;
  }
};

export const insertAfterElementId = (
  root: any,
  id: string | string[],
  child: any
) => {
  const ids = getIds(id);
  const parent = findParentElementById(root, id);
  const index = parseInt(ids[ids.length - 1] || '-1');
  if (parent && parent.children && parent.children[index]) {
    console.log(child, toJS(parent.children));
    parent.children.splice(index + 1, 0, child);
  }
};

export const addChildInId = (root: any, id: string | string[], child: any) => {
  const parent = findElementById(root, id);
  if (parent) {
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.unshift(child);
  }
};

export const isParentOf = (parentId: string, childId: string): boolean => {
  if (parentId === childId) return false;
  if (childId.indexOf(parentId) === 0) return true;
  return false;
};

export const prepareChanges = (editor: any) => {
  if (editor.selectedId) {
    editor.tempSelected = findElementById(editor.root, editor.selectedId);
  } else {
    editor.tempSelected = undefined;
  }
  editor.redoStack.length = 0;
  editor.prevSource = toJS(editor.source);
};

export const commitChanges = (editor: any) => {
  if (editor.tempSelected && editor.tempSelected.id) {
    editor.selectedId = editor.tempSelected.id;
    editor.tempSelected = undefined;
  }
  const diff = getDiff(toJS(editor.source), editor.prevSource);

  if (editor.undoStack.length > 2) {
    const lastStack1 = editor.undoStack[editor.undoStack.length - 1];
    const lastStack2 = editor.undoStack[editor.undoStack.length - 2];

    if (
      isUndoStackSimilar(lastStack1, diff) &&
      isUndoStackSimilar(lastStack2, diff)
    ) {
      editor.undoStack[editor.undoStack.length - 1] = diff;
      return;
    }
  }

  editor.undoStack.push(diff);
};

const isUndoStackSimilar = (compare: any, diff: any) => {
  if (compare && diff) {
    const compareKeys = Object.keys(compare);
    const diffKeys = Object.keys(diff);
    if (compareKeys.length === diffKeys.length) {
      for (let i in compareKeys) {
        const compareKey = compareKeys[i];
        const diffKey = diffKeys[i];
        const compareValue = compare[compareKey];
        const diffValue = diff[diffKey];
        if (compareValue.operation !== diffValue.operation) {
          return false;
        }
      }
      return true;
    }
  }
  return false;
};

export function createNewElement(name: string) {
  const tag = tags[name];
  const kind = kinds[name];
  if (!tag && !kind) return null;

  const type: any = tag ? tag : kind;
  return observable(_.clone(type.structure));
}
