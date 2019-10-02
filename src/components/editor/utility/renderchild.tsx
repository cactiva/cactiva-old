import React from 'react';
import kinds, { kindNames, SyntaxKind } from './kinds';
import { isTag } from './tagmatcher';
import tags from './tags';
import { toJS } from 'mobx';

export const renderChildren = (source: any, editor: any, root?: any): any => {
  if (!source) return source;
  if (!source.children) return undefined;
  const isroot = source.name === '--root--';
  const children = source.children;
  if (!source.id && !isroot) {
    source.id = '0';
  }
  let id = 0;

  const result = children.map((child: any, key: number) => {
    const childId = id++;
    child.id = isroot ? `${id}` : `${source.id}_${childId}`;
    if (isTag(child)) {
      return renderTag(child, editor, key, isroot ? child : root);
    }
    return renderKind(child, editor, key, isroot ? child : root);
  });
  return result;
};

const renderKind = (source: any, editor: any, key: number, root: any): any => {
  switch (source.kind) {
    case SyntaxKind.StringLiteral:
    case SyntaxKind.JsxText:
    case SyntaxKind.NumericLiteral:
      return source.value;
    case SyntaxKind.TrueKeyword:
      return 'true';
    case SyntaxKind.FalseKeyword:
      return 'false';
  }

  const kind = kinds[kindNames[source.kind]] as any;
  if (kind) {
    const cactiva = {
      kind,
      root: root,
      source: source,
      editor
    };
    const Component = kind.element;
    return <Component {...source.props} key={key} _cactiva={cactiva} />;
  }
  return null;
};

const renderTag = (source: any, editor: any, key: number, root: any): any => {
  const tag = tags[source.name] as any;
  if (tag) {
    const cactiva = {
      tag,
      root: root,
      source: source,
      editor
    };
    const Component = tag.element;
    if (editor.selectedId === source.id) {
      editor.selected = cactiva;
    }

    return <Component {...source.props} key={key} _cactiva={cactiva} />;
  }
  return null;
};
