import { renderChildren } from '@src/components/editor/utility/renderchild';
import { observer } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDropChild from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';
import { parseValue } from '../../../utility/parser';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseValue(props.style);
  return (
    <CactivaDropChild cactiva={cactiva} canDropOver={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={style} className='rn-text'>
          {renderChildren(cactiva.source, cactiva.editor, cactiva.root)}
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
