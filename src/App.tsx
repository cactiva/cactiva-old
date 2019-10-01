import '@src/App.scss';
import CactivaEditor from '@src/components/editor/CactivaEditor';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import Split from 'react-split';
import { useAsyncEffect } from 'use-async-effect';
import CactivaTraits from './components/traits/CactivaTraits';
import editor from './store/editor';
import hotkeys from 'hotkeys-js';

export default observer(() => {
  const current = editor.current;
  useAsyncEffect(async () => {
    hotkeys('ctrl+z,command+z', (event, handler) => {
      event.preventDefault();
      if (editor.current) editor.current.history.undo();
    });
    hotkeys(
      'ctrl+shift+z,command+shift+z, ctrl+y,command+y',
      (event, handler) => {
        event.preventDefault();
        if (editor.current) editor.current.history.redo();
      }
    );
    editor.load('/src/Main/Home.tsx');
  }, []);
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="cactiva-container">
        <div className="cactiva-menu"></div>
        <Split
          sizes={[15, 70, 15]}
          minSize={100}
          expandToMin={false}
          gutterSize={5}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          className="cactiva-main"
        >
          <div className="cactiva-pane"></div>
          <div className="cactiva-pane cactiva-editor-container">
            {current && current.source ? (
              <>
                <CactivaEditor source={current.source} editor={current} />
              </>
            ) : (
              <div>Please Choose A Component</div>
            )}
          </div>

          <div className="cactiva-pane">
            {current && current.source && (
              <CactivaTraits source={current.source} editor={current} />
            )}
          </div>
        </Split>
      </div>
    </DndProvider>
  );
});
