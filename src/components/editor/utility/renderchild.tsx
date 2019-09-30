import React from 'react';
import { findTag } from './tagmatcher';
import tags from './tags';

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
      return null;
    }
    childRoot.id = isroot ? `${id}` : `${source.id}_${childId}`;

    const tag = tags[childRoot.name] as any;
    if (tag) {
      const Component = tag.element;
      return (
        <Component
          {...childRoot.props}
          key={key}
          _cactiva={{
            tag,
            root: isroot ? childRoot : root,
            source: childRoot,
            editor
          }}
        />
      );
    }
    return null;
  });
};
