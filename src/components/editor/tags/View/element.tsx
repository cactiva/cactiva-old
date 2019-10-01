import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../CactivaDraggable';
import CactivaDroppable from '../../CactivaDroppable';
import CactivaSelectable from '../../CactivaSelectable';
import { parseProps } from '../../utility/parser';
import { renderChildren } from '../../utility/renderchild';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const tagProps = parseProps(props);
  const meta = useObservable({ dropOver: false });
  return (
    <CactivaDraggable cactiva={cactiva}>
      <CactivaDroppable
        cactiva={cactiva}
        onDropOver={(value: boolean) => (meta.dropOver = value)}
      >
        <CactivaSelectable cactiva={cactiva}>
          <div {...tagProps}>
            <div
              className={`cactiva-drop-after ${meta.dropOver ? 'hover' : ''}`}
            />
            {renderChildren(cactiva.source, cactiva.editor, cactiva.root)}
          </div>
        </CactivaSelectable>
      </CactivaDroppable>
    </CactivaDraggable>
  );
});
