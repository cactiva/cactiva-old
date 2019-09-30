import { observer } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../CactivaDraggable';
import CactivaDroppable from '../../CactivaDroppable';
import CactivaSelectable from '../../CactivaSelectable';
import { parseProp } from '../../utility/parser';
import { renderChildren } from '../../utility/renderchild';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseProp(props.style);
  return (
    <CactivaDraggable tag={cactiva.tag} id={cactiva.source.id}>
      <CactivaDroppable tag={cactiva.tag}>
        <CactivaSelectable editor={cactiva.editor} source={cactiva.source}>
          <div style={style}>
            {cactiva.source.id}
            {renderChildren(cactiva.source, cactiva.editor)}
          </div>
        </CactivaSelectable>
      </CactivaDroppable>
    </CactivaDraggable>
  );
});
