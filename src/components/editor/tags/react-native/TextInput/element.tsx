import { observer } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDroppable from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';
import { parseProps } from '../../../utility/parser';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const tagProps = parseProps(props);
  return (
    <CactivaDroppable cactiva={cactiva} canDropOver={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={tagProps.style}>
          <input className="rn-text-input" {...tagProps} />
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDroppable>
  );
});
