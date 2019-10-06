import { Popover, Text } from 'evergreen-ui';
import { observer, useObservable } from 'mobx-react-lite';
import React, { useRef } from 'react';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDroppable from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';
import MonacoEditor from 'react-monaco-editor';
import api from '@src/libs/api';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const meta = useObservable({
    content: '',
    loading: false,
    drag: {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      sx: 0,
      sy: 0,
      drag: false
    }
  });
  const ref = useRef(null);
  return (
    <>
      <div
        style={{
          position: 'fixed',
          left: meta.drag.sx,
          top: meta.drag.sy,
          transform: `translate(${meta.drag.dx}px, ${meta.drag.dy}px)`,
          width: 10,
          height: 10
        }}
        ref={ref}
      ></div>
      <CactivaDroppable cactiva={cactiva} canDropOver={false}>
        <CactivaDraggable cactiva={cactiva}>
          <Popover
            onClose={() => {}}
            onOpen={async () => {
              meta.loading = true;
              const res = await api.post('morph/ast2text', cactiva.source);
              meta.content = res;
              meta.loading = false;
            }}
            content={
              <Text
                style={{
                  width: '650px',
                  height: '450px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  backgroundColor: '#202123',
                  color: 'white',
                  position: 'relative',
                  userSelect: 'none'
                }}
              >
                {meta.loading ? (
                  'Loading'
                ) : (
                  <>
                    <div
                      style={{
                        padding: '0px 10px',
                        display: 'flex',
                        alignSelf: 'stretch',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onMouseDownCapture={e => {
                        if (meta.drag.x === 0) meta.drag.x = e.screenX;
                        if (meta.drag.y === 0) meta.drag.y = e.screenY;
                        meta.drag.drag = true;
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <span>No error</span>
                      <span style={{ opacity: 0.5 }}></span>
                    </div>
                    <MonacoEditor
                      theme='vs-dark'
                      value={meta.content}
                      onChange={value => {
                        meta.content = value;
                      }}
                      options={{
                        minimap: {
                          enabled: false
                        }
                      }}
                      width='100%'
                      height='100%'
                      language='javascript'
                    />
                  </>
                )}
              </Text>
            }
          >
            {({ getRef, toggle, isShown }) => {
              if (ref.current) getRef(ref.current);
              return (
                <CactivaSelectable
                  cactiva={cactiva}
                  onDoubleClick={(e: any) => {
                    if (meta.drag.sx === 0) meta.drag.sx = e.clientX;
                    if (meta.drag.sy === 0) meta.drag.sy = e.clientY;
                    toggle();
                  }}
                >
                  {meta.content}
                </CactivaSelectable>
              );
            }}
          </Popover>
        </CactivaDraggable>
      </CactivaDroppable>
      {meta.drag.drag && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 101
          }}
          onMouseUpCapture={e => {
            meta.drag.drag = false;
          }}
          onMouseMoveCapture={e => {
            meta.drag.dx = e.screenX - meta.drag.x;
            meta.drag.dy = e.screenY - meta.drag.y;
          }}
        ></div>
      )}
    </>
  );
});
