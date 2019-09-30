import React from 'react';
import { findTag } from './tagmatcher';
import tags from './tags';
import { toJS } from 'mobx';

export const renderChildren = (source: any, editor: any): any => {
  if (!source) return source;
  if (!source.children) return undefined;
  const children = source.children;
  if (!source.id) {
    source.id = '0';
  }
  let id = 0;

  return children
    .map((child: any, key: number) => {
      const childRoot = findTag(child);
      if (!childRoot) {
        return null;
      }
      childRoot.id = `${source.id}_${id++}`;

      const tag = tags[childRoot.name] as any;
      if (tag) {
        const Component = tag.element;
        return (
          <Component
            {...childRoot.props}
            key={key}
            _cactiva={{ tag, source: childRoot, editor }}
          />
        );
      }
      return null;
    })
    .filter((item: any) => !!item);
};
