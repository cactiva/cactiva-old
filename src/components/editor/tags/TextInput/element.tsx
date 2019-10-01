import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import ErrorBoundary from 'react-error-boundary';
import CactivaDraggable from '../../CactivaDraggable';
import CactivaDroppable from '../../CactivaDroppable';
import CactivaSelectable from '../../CactivaSelectable';
import { parseProps } from '../../utility/parser';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const tagProps = parseProps(props);
  return (
    <ErrorBoundary>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaDroppable cactiva={cactiva} canDropOver={false}>
          <CactivaSelectable cactiva={cactiva}>
            <input className="rn-text-input" {...tagProps} />
          </CactivaSelectable>
        </CactivaDroppable>
      </CactivaDraggable>
    </ErrorBoundary>
  );
});
