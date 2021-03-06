import editor from "@src/store/editor";
import _ from "lodash";
import { toJS } from "mobx";
import { getDiff } from "recursive-diff";
import { promptExpression } from "../../../traits/expression/ExpressionSinglePopup";
import { promptCustomComponent } from "../../CactivaCustomComponent";
import kinds from "../kinds";
import { SyntaxKind } from "../syntaxkinds";
import { isTag } from "../tagmatcher";
import tags from "../tags";
import { generateQueryObject } from "./genQueryObject";
import { generateCrudTable, generateCrudForm, generateCrudActions, generateCrudTitle } from "./genCrud";
import api from "@src/libs/api";

export const getIds = (id: string | string[]) => {
  if (Array.isArray(id)) return _.clone(id);
  if (typeof id === "string") return id.split("_");
  throw new Error("getIds - id is not recognized");
};

export const getParentId = (ids: string) => {
  const sid = ids.split("_");
  if (sid.length > 0) {
    sid.pop();
  }
  return sid.join("_");
};

const recurseElementById = (
  id: string | string[],
  root: any,
  parent?: any
): any => {
  if (Array.isArray(id)) {
    id = id.join("_");
  }

  if (root.id === id) {
    return { el: root, parent };
  }
  if (root.value) {
    return recurseElementById(id, root.value, !!root.id ? root : parent);
  }

  if (!root.value && !root.children) {
    const result = Object.keys(root)
      .map((c: any) => {
        if (typeof root[c] === "object" && !!root[c]) {
          const res = recurseElementById(
            id,
            root[c],
            !!root.id ? root : parent
          );
          if (res) return res;
        }
      })
      .filter((e: any) => !!e) as any;

    if (result.length > 0) return result[0];
  }

  if (Array.isArray(root.props)) {
    const result = root.props
      .map((c: any, idx: number) => {
        const res = recurseElementById(id, c, !!root.id ? root : parent);
        if (res) return res;
      })
      .filter((e: any) => !!e);

    if (result.length > 0) return result[0];
  }

  if (Array.isArray(root.children)) {
    const result = root.children
      .map((c: any, idx: number) => {
        const res = recurseElementById(id, c, !!root.id ? root : parent);
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
      let cids = currentIds.join("_");
      let i = 0;
      while (!!el && el.id !== cids) {
        i++;
        if (i > 1000) {
          console.log(`${cids} not found!`);
          break;
        }
        if (el) {
          switch (el.kind) {
            case SyntaxKind.JsxExpression:
              const r = recurseElementById(cids, el);
              if (!!r) {
                el = r.el;
              }
              break;
            case SyntaxKind.JsxElement:
              let res: any = null;
              Object.keys(el.props).map(key => {
                if (!res) {
                  const r = recurseElementById(cids, el.props[key]);
                  if (!!r) {
                    res = r.el;
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
  if (id === "0" && root.id === id) {
    if (editor.current) {
      editor.current.source = value;
    }
    return value;
  }
  const anchor = findParentElementById(root, id);

  // if it is regular element
  let children = anchor.children;
  if (children && children.length > 0) {
    let foundKey = -1;
    children.map((c: any, idx: number) => {
      if (c.id === id) {
        foundKey = idx;
      }
    });

    if (foundKey >= 0) {
      children.splice(foundKey, 1, value);
      return value;
    }
  }

  const res = recurseElementById(id, anchor);
  if (res && res.parent && res.el) {
    replaceExpValue(res.parent, id, value);
  }

  return value;
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

const replaceExpValue = (
  anchor: any,
  id: string | string[],
  value: any
): any => {
  if (typeof id !== "string") {
    id = id.join("_");
  }

  switch (anchor.kind) {
    case SyntaxKind.BinaryExpression:
      anchor = replaceExpValue(anchor.right, id, value);
      break;
    case SyntaxKind.ConditionalExpression:
      anchor = replaceExpValue(anchor.whenTrue, id, value);
      // replaceExpValue(anchor.whenFalse, id, value);
      break;
    default:
      if (anchor.value) {
        if (anchor.value.id === id) {
          anchor.value = value;
        } else {
          anchor = replaceExpValue(anchor.value, id, value);
        }
      } else if (anchor.exp) {
        anchor = replaceExpValue(anchor.exp, id, value);
      }
  }
  return anchor;
};

export const removeElementById = (root: any, id: string | string[]) => {
  const ids = getIds(id);
  const parent = findParentElementById(root, id);
  const index = parseInt(ids[ids.length - 1] || "-1");
  if (parent) {
    if (
      parent.children &&
      parent.children.length > index &&
      parent.children[index]
    ) {
      const result = parent.children[index];
      parent.children.splice(index, 1);

      return result;
    } else {
      const res = recurseElementById(id, parent);
      if (res && res.parent) replaceExpValue(res.parent, id, null);
      if (res && res.el) {
        return res.el;
      }
      return null;
    }
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
  const insertTo = _.get(parentTag, "insertTo", "children");
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
    const insertTo = _.get(parentTag, "insertTo", "children");
    let children = _.get(parent, insertTo);
    if (!children) {
      _.set(parent, insertTo, []);
      children = [];
    }
    children.unshift(child);
    _.set(parent, insertTo, children);
  }
};

export const wrapInElementId = (
  root: any,
  id: string | string[],
  wrapEl: any
) => {
  const currentEl = findElementById(root, id);
  if (currentEl && wrapEl) {
    if (wrapEl.kind === SyntaxKind.JsxExpression) {
      const parentEl = findParentElementById(root, id);
      switch (wrapEl.value.kind) {
        case SyntaxKind.ElementAccessExpression:
          _.set(wrapEl, "value.exp.value.value.value.value", currentEl);
          break;
        case SyntaxKind.CallExpression:
          if (wrapEl.value.expression.indexOf(".map") >= 0) {
            _.set(wrapEl, "value.arguments.0.body.0.value.value", currentEl);
          }
          break;
        case SyntaxKind.ConditionalExpression:
          _.set(wrapEl, "value.whenTrue", currentEl);
          break;
        case SyntaxKind.BinaryExpression:
          _.set(wrapEl, "value.right", currentEl);
          break;
        default:
          _.set(wrapEl, "value", {
            kind: SyntaxKind.JsxElement,
            name: "View",
            children: [wrapEl.value, currentEl]
          });
      }

      if (parentEl.kind !== SyntaxKind.JsxElement) {
        wrapEl = wrapEl.value;
      } else {
        const parent = getSelectableParent(root, id);
        if (
          parent.kind === wrapEl.kind &&
          parent.kind === SyntaxKind.JsxExpression
        ) {
          wrapEl = wrapEl.value;
        }
      }
      replaceElementById(root, id, wrapEl);
    } else {
      const elementTag = tags[wrapEl.name];
      const insertTo = ((elementTag as any) || {}).insertTo || "children";
      _.set(wrapEl, insertTo, [currentEl]);
      replaceElementById(root, id, wrapEl);
    }
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

export const commitHooks = () => {
  const current = editor.current;
  if (current) {
    const hooks = toJS(current.hooks);
    console.log(hooks);
    current.undoStack.push(hooks);
  }
}

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

export const applyImportAndHook = async (imports: any) => {
  if (editor.current) {
    console.log(imports);
    // editor.status = "loading";
    // const res = await api.post(`project/apply-imports`, {
    //   raw: "n",
    //   value: JSON.stringify(editor.current.getSourceCode()),
    //   hooks: editor.current.hooks,
    //   imports: _.merge(editor.current.imports, imports)
    // });
    // editor.current.source = res.component;
    // editor.current.rootSource = res.file;
    // editor.current.imports = res.imports;
    // editor.current.hooks = (res.hooks || []).filter((e: any) => !!e);
    // editor.status = "ready";
  }
};

export async function createNewElement(componentName: string) {
  let name = componentName;

  if (name === "custom-component") {
    name = await promptCustomComponent();
  } else if (name === 'generate-crud') {
    const query = await generateQueryObject();
    if (!query) {
      return;
    }

    if (editor.current) {
      const res = await api.post("morph/parse-exp", {
        value: `useEffect(() => { 
  const resetCrud = () => {
    ${query.var} = {
      structure: ${JSON.stringify(query.table, null, 2)},
      auth: ${query.auth === undefined || query.auth === true ? 'true' : 'false'},
      list: [],
      form: {},
      sorting: {},
      paging: {},
      filter: {}
    }
  }
  resetCrud();
}, [])`
      });
      editor.current.hooks.push(res);
    }

    const CrudWrapper = tags['CrudWrapper'] as any;
    const struct = _.cloneDeep(CrudWrapper.structure);
    struct.props.data = {
      "kind": 271,
      "value": {
        "kind": 73,
        "value": query.var
      }
    };
    struct.children.push(generateCrudTitle(query));
    struct.children.push(generateCrudActions(query));
    struct.children.push(generateCrudTable(query));
    struct.children.push(generateCrudForm(query));
    return struct;
  } else if (name === "expr") {
    const res = await promptExpression({
      title: "Please type the expression:",
      returnExp: true,
    });
    if (!res.expression) return;
    await applyImportAndHook(res.imports);
    return {
      kind: SyntaxKind.JsxExpression,
      value: res.expression
    };
  } else if (name === "if") {
    const res = await promptExpression({
      title: "Please type the condition:",
      pre: "If (",
      post: ")",
      local: true,
      footer: "then <Component />",
      wrapExp: "([[value]] && <View><Text>When True</Text></View>)",
      returnExp: true
    });
    if (!res.expression) return;
    await applyImportAndHook(res.imports);
    return { kind: SyntaxKind.JsxExpression, value: res.expression };
  } else if (name === "if-else") {
    const res = await promptExpression({
      title: "Please type the condition:",
      pre: "If (",
      post: ")",
      local: true,
      footer: "then <Component />\nelse <AnotherComponent />",
      wrapExp:
        "([[value]] ? <View><Text>When True</Text></View> : <View><Text>When False</Text></View>)",
      returnExp: true
    });
    if (!res.expression) return;
    await applyImportAndHook(res.imports);
    return { kind: SyntaxKind.JsxExpression, value: res.expression };
  } else if (name === "switch") {
    const res = await promptExpression({
      title: "Please type the variable only:",
      pre: "switch (",
      post: `) case "value": <Component /> `,
      local: true,
      footer: `case "anotherValue": <AnotherComponent /> `,
      wrapExp:
        '({"value": <View><Text>When Match</Text></View>} as any)[[[value]]]',
      returnExp: true
    });
    if (!res.expression) return;
    await applyImportAndHook(res.imports);
    return { kind: SyntaxKind.JsxExpression, value: res.expression };
  } else if (name === "map") {
    const res = await promptExpression({
      title: "Please type the variable only:",
      pre: "(",
      local: true,
      post: ")",
      footer: ".map((item:any, key:number) => <Component />)",
      wrapExp: `
    [[value]].map((item:any, key: number) => {
          return (<View style={{flexDirection: "row"}}>Row {key}</View>)
    })
  `,
      returnExp: true
    });
    if (!res.expression) return;
    await applyImportAndHook(res.imports);
    return { kind: SyntaxKind.JsxExpression, value: res.expression };
  }

  if (!name) return null;
  if (name.indexOf("/src/") === 0) {
    const baseName = name.split("/").pop() || "";
    const componentName = baseName.substr(0, baseName.length - 4);
    const importPath = name.replace("/src", "@src");

    await applyImportAndHook({
      [componentName]: {
        from: importPath,
        type: "default"
      }
    });

    return {
      kind: SyntaxKind.JsxElement,
      name: componentName,
      props: {},
      children: []
    };
  }

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

export const getSelectableParent = (root: any, id: string | string[]) => {
  let anchor = findParentElementById(root, id);
  if (!anchor) return null;
  while (
    [
      SyntaxKind.JsxElement,
      SyntaxKind.JsxExpression,
      SyntaxKind.JsxFragment
    ].indexOf(anchor.kind) < 0 &&
    !anchor.name
  ) {
    anchor = findParentElementById(root, anchor.id);
  }
  return anchor;
};
