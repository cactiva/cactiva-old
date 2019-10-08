import { renderChildren } from '@src/components/editor/utility/renderchild';
import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDroppable from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';
import { parseValue } from '../../../utility/parser/parser';
import CactivaDropMarker from '@src/components/editor/CactivaDropMarker';
import { SyntaxKind } from '@src/components/editor/utility/syntaxkinds';
import _ from 'lodash';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseValue(props.style);
  const meta = useObservable({
    dropOver: false,
    canDropOver: true
  });
  const children = cactiva.source.children;
  useEffect(() => {
    meta.canDropOver = children.length === 0;
  }, [children.length, meta.dropOver]);
  return (
    <CactivaDroppable
      cactiva={cactiva}
      onBeforeDropOver={(item: any, type: string) => {
        if (type === 'after') {
          return true;
        } else {
          if (item && item.name === 'JsxExpression') {
            meta.canDropOver = true;
            meta.dropOver = true;
            return true;
          }
        }
      }}
      onDropped={(item: any, type: string) => {
        if (type === 'child') {
          const child = children.filter(
            (e: any) => e.kind === SyntaxKind.JsxExpression
          );
          if (child.length > 0) cactiva.source.children = child;
          meta.dropOver = false;
          meta.canDropOver = false;
        }
      }}
      onDropOver={(value: boolean) => {
        meta.dropOver = value;
      }}
      canDropOver={meta.canDropOver}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable
          cactiva={cactiva}
          onDoubleClick={(e: any) => {
            e.preventDefault();
            const hasJsxExpression =
              _.get(children, '0.kind') === SyntaxKind.JsxExpression;

            if (!hasJsxExpression) {
              let text = prompt('Text:', _.get(children, '0.value'));
              if (text !== null) {
                children[0] = {
                  kind: SyntaxKind.JsxText,
                  value: text
                };
              }
            }
          }}
          style={style}
          className="cactiva-element rn-text"
        >
          {meta.canDropOver ? (
            <CactivaDropMarker
              hover={meta.dropOver}
              stretch={true}
              style={{ margin: '0px 5px' }}
            />
          ) : (
            renderChildren(
              cactiva.source,
              cactiva.editor,
              cactiva.root,
              () => ({
                canDropAfter: false
              })
            )
          )}
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDroppable>
  );
});
