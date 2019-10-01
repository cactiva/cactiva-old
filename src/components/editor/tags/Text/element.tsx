import { observer } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../CactivaDraggable';
import CactivaDroppable from '../../CactivaDroppable';
import CactivaSelectable from '../../CactivaSelectable';
import { parseKind } from '../../utility/parser';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseKind(props.style);
  const children = parseKind(cactiva.source.children[0]);
  return (
    <CactivaDroppable cactiva={cactiva} canDropOver={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={style} className="rn-text">
          {children}
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDroppable>
  );
});
