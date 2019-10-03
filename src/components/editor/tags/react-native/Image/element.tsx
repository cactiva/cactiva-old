import { observer } from 'mobx-react-lite';
import React from 'react';
import ErrorBoundary from 'react-error-boundary';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDropChild from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';
import { parseProps } from '../../../utility/parser';
import { baseUrl } from '@src/store/editor';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const tagProps = parseProps(props);
  tagProps.src =
    baseUrl +
    '/assets/' +
    tagProps.source
      .replace("require('", '')
      .replace('@src/assets/images/', '')
      .replace("')", '');
  return (
    <CactivaDropChild cactiva={cactiva} canDropOver={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={tagProps.style}>
          <img {...tagProps} />
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
