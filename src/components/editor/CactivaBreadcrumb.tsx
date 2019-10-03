import _ from 'lodash';
import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { findElementById, getIds } from './utility/elements/tools';
import { kindNames } from './utility/kinds';

export default observer(({ source, editor }: any) => {
  const meta = useObservable({
    nav: []
  });
  useEffect(() => {
    meta.nav = generatePath(editor, source);
  }, [editor.selectedId]);
  return (
    <div className="cactiva-breadcrumb">
      {_.map(meta.nav, (v, i) => {
        return (
          <div key={i} className="breadcrumb-tag">
            <span>{v}</span>
          </div>
        );
      })}
    </div>
  );
});

const generatePath = (editor: any, source: any) => {
  const nav: any = [];
  const selectedId = getIds(editor.selectedId);
  const currentId = [...selectedId];
  for (let id in selectedId) {
    const el = findElementById(source, currentId);
    if (!!el.name) nav.push(el.name);
    else nav.push(kindNames[el.kind]);
    currentId.pop();
  }
  return nav.reverse();
};
