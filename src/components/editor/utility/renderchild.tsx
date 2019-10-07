import React from "react";
import kinds, { kindNames, SyntaxKind } from "./kinds";
import { isTag } from "./tagmatcher";
import tags from "./tags";

export const renderChildren = (
  source: any,
  editor: any,
  root?: any,
  parentInfo?: (cactiva: {
    isLastChild: boolean;
    child: any;
    editor: any;
    key: number;
    root: any;
  }) => any
): any => {
  let id = 0;
  if (!source) return source;
  if (!source.children) return undefined;
  const isRoot = source.name === "--root--";
  const children = source.children;

  if (isRoot) {
    editor.cactivaRefs = {};
  }

  const result = children.map((refChild: any, key: number) => {
    if (typeof refChild === "object") {
      if (!source.id && !isRoot) {
        source.id = "0";
      }
      let child = refChild;
      const childId = id++;
      const istag = isTag(child);

      child.id = isRoot ? `${id - 1}` : `${source.id}_${childId}`;

      const info =
        parentInfo &&
        parentInfo({
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
  if (tag) {
    const cactiva = {
      tag,
      root: root,
      source: source,
      editor,
      parentInfo
    };
    editor.cactivaRefs[source.id] = cactiva;
    const Component = tag.element;
    if (editor.selectedId === source.id) {
      editor.selected = cactiva;
    }

    return <Component {...source.props} key={key} _cactiva={cactiva} />;
  }
  return null;
};
