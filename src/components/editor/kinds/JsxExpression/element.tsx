import CactivaDraggable from '../../CactivaDraggable';
import CactivaDroppable from '../../CactivaDroppable';
import CactivaSelectable from '../../CactivaSelectable';
import { parseProps } from '../../utility/parser';
import { renderChildren } from '../../utility/renderchild';
import { observer } from 'mobx-react-lite';
import React from 'react';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  console.log(cactiva);

  return (
    <CactivaDroppable cactiva={cactiva} canDropOver={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva}>
          <div className="kind-jsxexpression">{'>_'}</div>
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
