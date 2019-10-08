import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import ErrorBoundary from 'react-error-boundary';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDropChild from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';
import { parseProps } from '../../../utility/parser/parser';
import { baseUrl } from '@src/store/editor';
import ImageBrowse from '@src/components/traits/kinds/components/ImageBrowse';
import { generateSource } from '@src/components/editor/utility/parser/generateSource';

export default observer((props: any) => {
  const meta = useObservable({
    edited: false,
    source: ''
  });
  const cactiva = props._cactiva;
  const tagProps = parseProps(props);
  tagProps.src = !!tagProps.source
    ? baseUrl +
      '/assets/' +
      tagProps.source
        .replace("require('", '')
        .replace('@src/assets/images/', '')
        .replace("')", '')
    : 'images/sample.jpg';
  useEffect(() => {
    meta.source = tagProps.source;
  }, [props]);
  return (
    <CactivaDropChild cactiva={cactiva} canDropOver={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable
          cactiva={cactiva}
          style={tagProps.style}
          onDoubleClick={(e: any) => {
            e.preventDefault();
            e.stopPropagation();
            meta.edited = true;
          }}
        >
          <img
            {...tagProps}
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = 'images/sample.jpg';
            }}
          />
          <ImageBrowse
            value={meta.source}
            onChange={(v: any) => {
              props.source.value = meta.source = v;
            }}
            onDismiss={(e: any) => (meta.edited = e)}
            isShown={meta.edited}
          />
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
