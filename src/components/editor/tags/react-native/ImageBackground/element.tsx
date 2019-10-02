import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDroppable from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';
import { parseProps } from '../../../utility/parser';
import { renderChildren } from '../../../utility/renderchild';
import { baseUrl } from '@src/store/editor';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const tagProps = parseProps(props);
  const meta = useObservable({ dropOver: false });
  tagProps.style.backgroundImage = `url(${baseUrl +
    '/assets/' +
    tagProps.source
      .replace("require('", '')
      .replace('@src/assets/images', '')
      .replace("')", '')})`;
  return (
    <CactivaDroppable
      cactiva={cactiva}
      onDropOver={(value: boolean) => (meta.dropOver = value)}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={tagProps.style}>
          <div
            className={`cactiva-drop-child  ${meta.dropOver ? 'hover' : ''}`}
          />
          {renderChildren(cactiva.source, cactiva.editor, cactiva.root)}
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDroppable>
  );
});
