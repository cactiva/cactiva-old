import CactivaDropMarker from '@src/components/editor/CactivaDropMarker';
import { SyntaxKind } from '@src/components/editor/utility/kinds';
import { renderChildren } from '@src/components/editor/utility/renderchild';
import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDropChild from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';
import _ from 'lodash';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = {};
  const meta = useObservable({ dropOver: false });
  const direction = _.get(style, 'flexDirection', 'column');
  const hasNoChildren = _.get(cactiva.source, 'children.length', 0) === 0;
  return (
    <CactivaDropChild
      cactiva={cactiva}
      onDropOver={(value: boolean) => (meta.dropOver = value)}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={style}>
          <CactivaDropMarker
            hover={meta.dropOver}
            direction={direction}
            stretch={hasNoChildren}
          />
          {renderChildren(cactiva.source, cactiva.editor, cactiva.root, c => ({
            isLastChild: c.isLastChild,
            afterDirection: direction
          }))}
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
