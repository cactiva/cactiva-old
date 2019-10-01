import _ from 'lodash';
import { toJS } from 'mobx';
import { getDiff } from 'recursive-diff';

const getIds = (id: string | string[]) =>
  Array.isArray(id) ? _.clone(id) : id.split('_');

export const findElementById = (root: any, id: string | string[]): any => {
  const ids = getIds(id);
  const rid = ids.shift();

  if (ids.length === 0 && rid == root.id) return root;
  let el = root;

  for (let i in ids) {
    const cid = parseInt(ids[i]);
    if (el && el.children && el.children.length > cid && el.children[cid]) {
      el = el.children[cid];
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

export const prepareChanges = (root: any, editor: any) => {
  if (editor.selectedId) {
    editor.tempSelected = findElementById(root, editor.selectedId);
  } else {
    editor.tempSelected = undefined;
  }
  editor.history.redoStack.length = 0;
  editor.prevSource = toJS(editor.source);
};

export const commitChanges = (editor: any) => {
  if (editor.tempSelected && editor.tempSelected.id) {
    editor.selectedId = editor.tempSelected.id;
    editor.tempSelected = undefined;
  }
  editor.history.undoStack.push(
    getDiff(toJS(editor.source), editor.prevSource)
  );
};

export function fastClone(clone: any, obj: any) {
  for (var i in obj)
    clone[i] =
      typeof obj[i] == 'object'
        ? fastClone(obj[i].constructor(), obj[i])
        : obj[i];
  return clone;
}
