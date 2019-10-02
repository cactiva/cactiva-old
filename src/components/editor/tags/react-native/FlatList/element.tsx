import { renderChildren } from '@src/components/editor/utility/renderchild';
import { SyntaxKind } from '@src/components/editor/utility/kinds';
import { isTag } from '@src/components/editor/utility/tagmatcher';
import { toJS } from 'mobx';
import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDroppable from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = {};
  const meta = useObservable({ dropOver: false });
  console.log(props.renderItem);
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
              children: props.renderItem.body
            },
            cactiva.editor,
            cactiva.root
          )}
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDroppable>
  );
});
