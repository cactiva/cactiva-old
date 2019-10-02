import React from 'react';
import { isTag } from './tagmatcher';
import tags from './tags';
import kinds, { kindNames } from './kinds';
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

  return children.map((child: any, key: number) => {
    const childId = id++;
    if (isTag(child)) {
      child.id = isroot ? `${id}` : `${source.id}_${childId}`;
      return renderTag(child, editor, key, isroot ? child : root);
    }
    return renderKind(child, editor, key, isroot ? child : root);
  });
};

const renderKind = (source: any, editor: any, key: number, root: any): any => {
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
