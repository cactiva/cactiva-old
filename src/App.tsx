import '@src/App.scss';
import CactivaEditor from '@src/components/editor/CactivaEditor';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import Split from 'react-split';
import editor from './store/editor';
import { useAsyncEffect } from 'use-async-effect';
export default observer(() => {
  useAsyncEffect(async () => {
    editor.load('/src/Main/Home.tsx');
  }, []);
  const current = editor.current;
  return (
    <DndProvider backend={HTML5Backend}>
      <div className='cactiva-container'>
        <div className='cactiva-menu'></div>
        <Split
          sizes={[15, 70, 15]}
          minSize={100}
          expandToMin={false}
          gutterSize={5}
          gutterAlign='center'
          snapOffset={30}
          dragInterval={1}
          direction='horizontal'
          className='cactiva-main'
        >
          <div className='cactiva-pane'></div>
          <div className='cactiva-pane cactiva-editor-container'>
            {current && current.source ? (
              <>
                <CactivaEditor source={current.source} editor={current} />
              </>
            ) : (
              <div>Please Choose A Component</div>
            )}
          </div>
          <div className='cactiva-pane'>
            <div>{current && JSON.stringify(current.selected)}</div>
          </div>
        </Split>
      </div>
    </DndProvider>
  );
});
