import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../CactivaDraggable';
import CactivaDroppable from '../../CactivaDroppable';
import CactivaSelectable from '../../CactivaSelectable';
import { parseStyle } from '../../utility/parser';
import { renderChildren } from '../../utility/renderchild';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseStyle(props.style);
  const meta = useObservable({ dropOver: false });
  return (
    <CactivaDraggable tag={cactiva.tag} id={cactiva.source.id}>
      <CactivaDroppable
        tag={cactiva.tag}
        root={cactiva.root}
        editor={cactiva.editor}
        id={cactiva.source.id}
        onDropOver={(value: boolean) => (meta.dropOver = value)}
      >
        <CactivaSelectable editor={cactiva.editor} source={cactiva.source}>
          <div style={style}>
            {cactiva.tag.tagName}
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
