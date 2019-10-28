import _ from "lodash";
import { toJS, observable } from "mobx";
import { getDiff } from "recursive-diff";
import { isTag } from "../tagmatcher";
import tags from "../tags";
import { SyntaxKind } from "../syntaxkinds";
import kinds from "../kinds";
import editor from "@src/store/editor";

export const getIds = (id: string | string[]) =>
  Array.isArray(id) ? _.clone(id) : id.split("_");

export const getParentId = (ids: string) => {
  const sid = ids.split("_");
  if (sid.length > 0) {
    sid.pop();
  }
  return sid.join("_");
};

const recurseElementById = (
  id: string,
  root: any,
  replacement?: any,
  replacementParent?: any,
  replacementChildKey?: any
): any => {
  if (root.id === id) {
    if (replacement) {
      replacementParent[replacementChildKey] = replacement;
      return replacementParent[replacementChildKey];
    }
    return root;
  }
  if (root.value) {
    return recurseElementById(id, root.value, replacement, root, "value");
  }

  if (!root.value && !root.children) {
    const result = Object.keys(root)
      .map((c: any) => {
        if (typeof root[c] === "object") {
          const res = recurseElementById(id, root[c], replacement, root, c);
          if (res) return res;
        }
      })
      .filter((e: any) => !!e) as any;

    if (result.length > 0) return result[0];
  }

  if (Array.isArray(root.props)) {
    const result = root.props
      .map((c: any, idx: number) => {
        const res = recurseElementById(id, c, replacement, root, idx);
        if (res) return res;
      })
      .filter((e: any) => !!e);

    if (result.length > 0) return result[0];
  }

  if (Array.isArray(root.children)) {
    const result = root.children
      .map((c: any, idx: number) => {
        const res = recurseElementById(id, c, replacement, root, idx);
        if (res) return res;
      })
      .filter((e: any) => !!e);

    if (result.length > 0) return result[0];
  }
};

export const findElementById = (root: any, id: string | string[]): any => {
  const ids = getIds(id);
  const rid = ids.shift();

  if (!root) return null;

  if (ids.length === 0 && rid == root.id) return root;
  let el = root;

  let currentIds = ["0"];
  for (let i in ids) {
    currentIds.push(ids[i]);
    const cid = parseInt(ids[i]);
    let child = null;
    if (
      el &&
      el.children &&
      el.children.length &&
      el.children.length - 1 >= cid
    ) {
      child = el.children[cid];
      if (isTag(el)) {
        const tag: any = tags[el.name];
        if (tag) {
          if (tag.insertTo !== "children") {
            child = _.get(el, `${tag.insertTo}.${cid}`, false);
          }
        }
      }
    }

    if (child) {
      el = child;
    } else {
      const cids = currentIds.join("_");
      let i = 0;
      while (!!el && el.id !== cids) {
        i++;
        if (i > 1000) {
          throw new Error(`${cids} not found!`);
        }
        if (el) {
          const cids = currentIds.join("_");
          switch (el.kind) {
            case SyntaxKind.JsxExpression:
              el = recurseElementById(cids, el);
              break;
            case SyntaxKind.JsxElement:
              let res: any = null;
              Object.keys(el.props).map(key => {
                if (!res) {
                  const r = recurseElementById(cids, el.props[key]);
                  if (!!r) {
                    res = r;
                  }
                }
              });
              el = res;
              break;
            case SyntaxKind.ArrowFunction:
              el = el.body;
            default:
              el = el.value;
          }
        }
      }
    }
  }
  if (el) {
    return el;
  }
};

export const replaceElementById = (
  root: any,
  id: string | string[],
  value: any
): any => {
  const ids = getIds(id);
  if (!root) return null;
  let el = root;

  if (id === "0") {
    for (let i in root) {
      delete root[i];
    }
    for (let i in value) {
      root[i] = value[i];
    }
    return root;
  }

  let currentIds = [];
  for (let i in ids) {
    const idx = parseInt(i);
    const cid = parseInt(ids[idx + 1]);
    const isBeforeLast = ids.length - 2 === idx;
    const hasChild = !!_.get(el, `children.${cid}`, false);
    currentIds.push(ids[i]);

    if (hasChild) {
      if (!isBeforeLast) {
        el = el.children[cid];
      } else {
        el.children[cid] = value;
      }
    } else {
      if (!!el && !!el.value) {
        if (el.kind === SyntaxKind.JsxExpression) {
          if (!isBeforeLast) {
            el = recurseElementById(currentIds.join("_"), el);
          } else {
            el = recurseElementById(currentIds.join("_"), el, value);
          }
        } else {
          if (!isBeforeLast) {
            el = el.value;
          } else {
            el.value = value;
          }
        }
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
  const index = parseInt(ids[ids.length - 1] || "-1");
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
  const index = parseInt(ids[ids.length - 1] || "-1");
  const parentTag = tags[parent.name];
  const insertTo = (parentTag as any).insertTo || "children";
  const children = _.get(parent, insertTo, []);
  if (children && children.length) {
    if (children.length > index && children[index]) {
      children.splice(index + 1, 0, child);
      _.set(parent, insertTo, children);
    }
  }
};

export const addChildInId = (root: any, id: string | string[], child: any) => {
  const parent = findElementById(root, id);
  if (parent) {
    const parentTag = tags[parent.name];
    const insertTo = (parentTag as any).insertTo || "children";
    let children = _.get(parent, insertTo);
    if (!children) {
      _.set(parent, insertTo, []);
      children = [];
    }
    children.unshift(child);
    _.set(parent, insertTo, children);
  }
};

export const isParentOf = (parentId: string, childId: string): boolean => {
  if (parentId === childId) return false;
  if (childId.indexOf(parentId) === 0) return true;
  return false;
};

export const prepareChanges = (editor: any) => {
  if (editor.selectedId) {
    editor.tempSelected = findElementById(editor.source, editor.selectedId);
  } else {
    editor.tempSelected = undefined;
  }
  editor.redoStack.length = 0;
  editor.prevSource = toJS(editor.source);
};

export const commitChanges = (editor: any) => {
  if (editor.tempSelected && editor.tempSelected.id) {
    if (findElementById(editor.source, editor.tempSelected.id))
      editor.selectedId = editor.tempSelected.id;
    else editor.selectedId = "";

    editor.tempSelected = undefined;
  }
  if (editor.undoStack.length > 2) {
    const diff = getDiff(toJS(editor.source), editor.prevSource);
    const lastStack1 = editor.undoStack[editor.undoStack.length - 1];
    const lastStack2 = editor.undoStack[editor.undoStack.length - 2];

    if (
      isUndoStackSimilar(lastStack1, diff) &&
      isUndoStackSimilar(lastStack2, diff)
    ) {
      editor.undoStack[editor.undoStack.length - 1] = toJS(editor.prevSource);
      return;
    }
  }
  editor.undoStack.push(editor.prevSource);
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
  if (!tag && !kind) {
    return {
      kind: SyntaxKind.JsxElement,
      name,
      props: {}
    };
  }

  const type: any = tag ? tag : kind;
  return _.clone(type.structure);
}

export function uuid(prefix: string) {
  return `${prefix}-${new Date().getTime()}${Math.floor(
    10000000 + Math.random() * 90000000
  )}`;
}

export function setProp(source: any, path: string, value: any) {
  const tpath = [];
  const tpathsplit = path.split(".");
  const tpathlength = tpathsplit.length;
  let current = source;
  for (let i in tpathsplit) {
    const t = tpathsplit[i];
    tpath.push(t);
    if (parseInt(i) < tpathlength - 2) {
      if (current[t] === undefined) {
        current[t] = {
          kind: SyntaxKind.ObjectLiteralExpression,
          value: {}
        };
      }
      if (current[t].value) {
        current = current[t].value;
      }
    }
  }
  _.set(source, path, value);
}
