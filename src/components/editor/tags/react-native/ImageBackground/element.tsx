import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDropChild from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';
import { parseProps } from '../../../utility/parser';
import { renderChildren } from '../../../utility/renderchild';
import { baseUrl } from '@src/store/editor';
import CactivaDropMarker from '@src/components/editor/CactivaDropMarker';
import _ from 'lodash';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const tagProps = parseProps(props);
  const meta = useObservable({ dropOver: false });
  const backgroundImage = `url(${baseUrl +
    '/assets/' +
    tagProps.source
      .replace("require('", '')
      .replace('@src/assets/images', '')
      .replace("')", '')})`;
  return (
    <CactivaDropChild
      cactiva={cactiva}
      onDropOver={(value: boolean) => (meta.dropOver = value)}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable
          cactiva={cactiva}
          style={{ ...tagProps.style, backgroundImage }}
        >
          <CactivaDropMarker
            hover={meta.dropOver}
            direction={_.get(tagProps.style, 'flexDirection', 'column')}
          />
          {renderChildren(cactiva.source, cactiva.editor, cactiva.root)}
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
