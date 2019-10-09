import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDropChild from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';
import { parseProps } from '../../../utility/parser/parser';
import { renderChildren } from '../../../utility/renderchild';
import { baseUrl } from '@src/store/editor';
import CactivaDropMarker from '@src/components/editor/CactivaDropMarker';
import _ from 'lodash';
import ImageBrowse from '@src/components/traits/kinds/components/ImageBrowse';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const tagProps = parseProps(props);
  const meta = useObservable({
    dropOver: false,
    edited: false,
    source: ''
  });
  const backgroundImage = `url(${baseUrl +
    '/assets/' +
    tagProps.source
      .replace("require('", '')
      .replace('@src/assets/images/', '')
      .replace("')", '')}), url('images/sample.jpg')`;
  return (
    <>
      <CactivaDropChild
        cactiva={cactiva}
        onDropOver={(value: boolean) => (meta.dropOver = value)}
      >
        <CactivaDraggable cactiva={cactiva}>
          <CactivaSelectable
            cactiva={cactiva}
            style={{ ...tagProps.style, backgroundImage }}
            onDoubleClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
              meta.edited = true;
            }}
          >
            <CactivaDropMarker
              hover={meta.dropOver}
              direction={_.get(tagProps.style, 'flexDirection', 'column')}
            />
            {renderChildren(cactiva.source, cactiva.editor, cactiva.root)}
          </CactivaSelectable>
        </CactivaDraggable>
      </CactivaDropChild>

      <ImageBrowse
        value={meta.source}
        onChange={(v: any) => {
          props.source.value = meta.source = v;
        }}
        onDismiss={(e: any) => (meta.edited = e)}
        isShown={meta.edited}
      />
    </>
  );
});
