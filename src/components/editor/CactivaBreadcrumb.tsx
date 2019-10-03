import _ from 'lodash';
import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { findElementById, getIds } from './utility/elements/tools';
import { kindNames } from './utility/kinds';
import CactivaDraggable from './CactivaDraggable';
import { isTag } from './utility/tagmatcher';
import { toJS } from 'mobx';
import CactivaSelectable from './CactivaSelectable';

export default observer(({ source, editor }: any) => {
  const meta = useObservable({
    nav: [],
    shouldUpdateNav: true
  });
  useEffect(() => {
    if (!meta.shouldUpdateNav) {
      meta.shouldUpdateNav = true;
      return;
    }
    meta.nav = generatePath(editor, source);
  }, [editor.selectedId, editor.history.undoStack]);
  return (
    <div className='cactiva-breadcrumb'>
      {_.map(meta.nav, (v: any, i) => {
        const cactiva = editor.cactivaRefs[v.source.id];
        return (
          <div
            key={i}
            className={`breadcrumb-tag ${
              editor.selectedId === v.source.id ? 'selected' : ''
            }`}
          >
            <CactivaDraggable cactiva={cactiva}>
              <CactivaSelectable
                cactiva={cactiva}
                style={{}}
                className=''
                showElementTag={false}
                onBeforeSelect={() => {
                  meta.shouldUpdateNav = false;
                }}
              >
                <span>{v.name}</span>
              </CactivaSelectable>
            </CactivaDraggable>
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
    if (!!el.name)
      nav.push({
        name: el.name,
        source: el
      });
    else
      nav.push({
        name: kindNames[el.kind],
        source: el
      });
    currentId.pop();
  }
  return nav.reverse();
};
