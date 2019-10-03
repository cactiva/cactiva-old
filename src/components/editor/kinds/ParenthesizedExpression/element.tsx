import { observer } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../CactivaDraggable';
import CactivaDropChild from '../../CactivaDroppable';
import CactivaSelectable from '../../CactivaSelectable';
import { renderChildren } from '../../utility/renderchild';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  return (
    <CactivaDropChild cactiva={cactiva} canDropAfter={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva}>
          {renderChildren(
            { name: '--kind--', children: [cactiva.source.value] },
            cactiva.editor,
            cactiva.root,
            () => ({
              canDropAfter: !!cactiva.source.value ? false : true
            })
          )}
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
