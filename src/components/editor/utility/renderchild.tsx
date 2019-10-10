import React from "react";
import Component from "../tags/react-native/Component";
import kinds, { kindNames } from "./kinds";
import { SyntaxKind } from "./syntaxkinds";
import { isTag } from "./tagmatcher";
import tags from "./tags";

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

  const result = children.map((refChild: any, key: number) => {
    if (typeof refChild === "object") {
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
    return refChild;
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
  switch (source.kind) {
    case SyntaxKind.StringLiteral:
      return source.value.substr(1, source.value.length - 2);
    case SyntaxKind.JsxText:
    case SyntaxKind.NumericLiteral:
      return source.value;
    case SyntaxKind.TrueKeyword:
      return "true";
    case SyntaxKind.FalseKeyword:
      return "false";
  }

  const kind = kinds[kindNames[source.kind]] as any;
  if (kind) {
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
    const Component = tag.element;
    return <Component {...source.props} key={key} _cactiva={cactiva} />;
  } else {
    cactiva.tag = tags["Component"];
    return <Component.element {...source.props} key={key} _cactiva={cactiva} />;
  }
};
