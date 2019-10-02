import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDroppable from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';
import { parseKind } from '../../../utility/parser';
import { renderChildren } from '@src/components/editor/utility/renderchild';
import _ from 'lodash';
import { toJS } from 'mobx';
import { findTag } from '@src/components/editor/utility/tagmatcher';
import { SyntaxKind } from '@src/components/editor/utility/syntaxkind';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = {};
  const meta = useObservable({ dropOver: false });
  console.log(toJS(props.renderItem));
  return (
    <CactivaDroppable
      cactiva={cactiva}
      onDropOver={(value: boolean) => (meta.dropOver = value)}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={style}>
          <div
            className={`cactiva-drop-child ${meta.dropOver ? 'hover' : ''}`}
          />
          {renderChildren(
            {
              kind: SyntaxKind.JsxElement,
              name: '--root--',
              children: [findTag(props.renderItem.body[0])]
            },
            cactiva.editor,
            cactiva.root
          )}
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDroppable>
  );
});
