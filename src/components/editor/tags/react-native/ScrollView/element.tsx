import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDropChild from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';
import { parseValue } from '../../../utility/parser/parser';
import { renderChildren } from '../../../utility/renderchild';
import CactivaDropMarker from '@src/components/editor/CactivaDropMarker';
import _ from 'lodash';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseValue(props.style);
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
