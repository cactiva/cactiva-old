import { observer } from 'mobx-react-lite';
import React from 'react';
import ErrorBoundary from 'react-error-boundary';
import CactivaDraggable from '../../CactivaDraggable';
import CactivaDroppable from '../../CactivaDroppable';
import CactivaSelectable from '../../CactivaSelectable';
import { parseProps } from '../../utility/parser';
import { renderChildren } from '../../utility/renderchild';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const tagProps = parseProps(props);
  return (
    <ErrorBoundary>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaDroppable cactiva={cactiva} canDropOver={false}>
          <CactivaSelectable cactiva={cactiva}>
            <div className="rn-text" {...tagProps}>
              {renderChildren(cactiva.source, cactiva.editor, cactiva.root)}
            </div>
          </CactivaSelectable>
        </CactivaDroppable>
      </CactivaDraggable>
    </ErrorBoundary>
  );
});
