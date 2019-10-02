import React from 'react';
import { findTag } from './tagmatcher';
import tags from './tags';
import { SyntaxKind } from './syntaxkind';
import { parseKind } from './parser';
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
    const childRoot = findTag(child);
    const childId = id++;
    if (!childRoot) {
      const value = parseKind(child);
      if (typeof value === 'string' || typeof value === 'number') return value;
      return JSON.stringify(child);
    }
    childRoot.id = isroot ? `${id}` : `${source.id}_${childId}`;

    const tag = tags[childRoot.name] as any;
    if (tag) {
      const cactiva = {
        tag,
        root: isroot ? childRoot : root,
        source: childRoot,
        editor
      };
      const Component = tag.element;
      if (editor.selectedId === childRoot.id) {
        editor.selected = cactiva;
      }

      return <Component {...childRoot.props} key={key} _cactiva={cactiva} />;
    }
    return null;
  });
};
