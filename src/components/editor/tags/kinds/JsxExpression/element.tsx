import { observer } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDroppable from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';
import { renderChildren } from '../../../utility/renderchild';

export default observer((props: any) => {
  const cactiva = props._cactiva;

  return (
    <CactivaDroppable cactiva={cactiva} canDropOver={true}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva}>
          {renderChildren(
            { name: '--kind--', children: [cactiva.source.value] },
            cactiva.editor,
            cactiva.root
          )}
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDroppable>
  );
});
