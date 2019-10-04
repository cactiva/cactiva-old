import { observer } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../CactivaDraggable';
import CactivaDropChild from '../../CactivaDroppable';
import CactivaSelectable from '../../CactivaSelectable';
import { renderChildren } from '../../utility/renderchild';

export default observer((props: any) => {
  const cactiva = props._cactiva;

  return (
    <CactivaDropChild cactiva={cactiva} canDropOver={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva}>
          <div className="cactiva-element kind-jsxexpression">{'fx Arrow Function'}</div>
          {renderChildren(
            { name: '--kind--', children: [cactiva.source.value] },
            cactiva.editor,
            cactiva.root
          )}
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});