import { observer } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDroppable from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';
import { parseKind } from '../../../utility/parser';
import { renderChildren } from '@src/components/editor/utility/renderchild';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseKind(props.style);
  return (
    <CactivaDroppable cactiva={cactiva} canDropOver={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={style} className="rn-text">
          {renderChildren(cactiva.source, cactiva.editor, cactiva.root)}
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDroppable>
  );
});
