import { tree } from "@src/components/ctree/CactivaTree";
import React from "react";
import Component from "../tags/elements/Component";
import kinds, { kindNames } from "./kinds";
import { isTag } from "./tagmatcher";
import tags from "./tags";
import { toJS } from "mobx";

export const renderChildren = (
  source: any,
  editor: any,
  root?: any,
  parentInfo?: (cactiva: {
    isFirstChild: boolean;
    isLastChild: boolean;
    child: any;
    editor: any;
    key: number;
    root: any;
  }) => any
): any => {
  let id = 0;
  if (!source) return source;
  if (source.child) {
    source.children = [source.child.value];
  }
  if (!source.children) return undefined;
  const isRoot = source.name === "--root--";
  const children = source.children;

  if (isRoot) {
    editor.cactivaRefs = {};
  }

  if (!children.map) {
    return null;
  }

  const result = children.map((refChild: any, key: number) => {
    if (typeof refChild === "object" && !Array.isArray(refChild)) {
      let child = refChild;
      if (!source.child) {
        if (!source.id && !isRoot) {
          source.id = "0";
        }
        const childId = id++;
        child.id = isRoot ? `${id - 1}` : `${source.id}_${childId}`;
      } else {
        child.id = source.child.id;
      }

      const istag = isTag(child);
      const info =
        parentInfo &&
        parentInfo({
          isFirstChild: key === 0,
          isLastChild: key === children.length - 1,
          child,
          editor,
          key,
          root: isRoot ? child : root
        });

      if (istag) {
        return renderTag(child, editor, key, isRoot ? child : root, info);
      }
      return renderKind(child, editor, key, isRoot ? child : root, info);
    }

    if (Array.isArray(refChild)) {
      return refChild.map((child, key) => {
        if (child && child.kind) {
          const info =
            parentInfo &&
            parentInfo({
              isFirstChild: key === 0,
              isLastChild: key === children.length - 1,
              child,
              editor,
              key,
              root: isRoot ? child : root
            });
          return renderKind(child, editor, key, isRoot ? child : root, info);
        }
        return child;
      })
    }
    return null;
  });
  return result;
};

const renderKind = (
  source: any,
  editor: any,
  key: number,
  root: any,
  parentInfo: any
): any => {
  let kind = kinds[kindNames[source.kind]] as any;
  if (!kind) {
    kind = kinds.SyntaxKind;
  }

  const cactiva = {
    kind,
    root: root,
    source: source,
    editor,
    parentInfo
  };
  editor.cactivaRefs[source.id] = cactiva;
  const Component = kind.element;
  if (editor.selectedId === source.id) {
    editor.selected = cactiva;
  }
  if (source.kind) {
    if (source.kind === 11) {
      if (typeof source.value !== "string") {
        console.log(source);
      }
      return source.value;
    }
    return <Component {...source.props} key={key} _cactiva={cactiva} />;
  }
  return null;
};

const renderTag = (
  source: any,
  editor: any,
  key: number,
  root: any,
  parentInfo: any
): any => {
  const tag = tags[source.name] as any;
  const cactiva = {
    tag,
    root,
    source,
    editor,
    parentInfo
  };
  editor.cactivaRefs[source.id] = cactiva;
  if (editor.selectedId === source.id) {
    editor.selected = cactiva;
  }

  if (tag) {
    if (!editor.imports[tag.tagName]) {
      editor.imports[tag.tagName] = {
        from: tag.from,
        type: tag.fromType
      };
    }
    const Component = tag.element;
    return <Component {...source.props} key={key} _cactiva={cactiva} />;
  } else {
    const file = tree.list[source.name];
    if (file) {
      const path =
        "@" + file.relativePath.substring(1, file.relativePath.length - 4);
      if (!editor.imports[source.name]) {
        editor.imports[source.name] = {
          from: path,
          type: "default"
        };
      }
    }
    cactiva.tag = tags["Component"];
    return <Component.element {...source.props} key={key} _cactiva={cactiva} />;
  }
};
