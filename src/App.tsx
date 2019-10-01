import '@src/App.scss';
import CactivaEditor from '@src/components/editor/CactivaEditor';
import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import Split from 'react-split';
import { useAsyncEffect } from 'use-async-effect';
import CactivaTraits from './components/traits/CactivaTraits';
import editor from './store/editor';
import hotkeys from 'hotkeys-js';
import { Spinner, Text, Tab, Pane } from 'evergreen-ui';

export default observer(() => {
  const current = editor.current;
  const meta = useObservable({
    currentPane: 'props'
  });
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
      <div className='cactiva-container'>
        <div className='cactiva-menu'></div>
        <Split
          sizes={editor.status === 'loading' ? [15, 85] : [15, 70, 15]}
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
          {editor.status === 'loading' ? (
            <div className='cactiva-editor-loading'>
              <Spinner size={18} />
              <Text color='muted' size={300} style={{ marginLeft: 8 }}>
                Loading
              </Text>
            </div>
          ) : (
            <div className='cactiva-pane cactiva-editor-container'>
              {current && current.source ? (
                <>
                  <CactivaEditor source={current.source} editor={current} />
                </>
              ) : (
                <div>Please Choose A Component</div>
              )}
            </div>
          )}

          {editor.status !== 'loading' ? (
            <div className='cactiva-pane'>
              <div className='cactiva-pane-inner'>
                <div className='cactiva-pane-tab-header'>
                  <Tab
                    style={{ flex: 1 }}
                    isSelected={meta.currentPane === 'props'}
                    onSelect={() => (meta.currentPane = 'props')}
                  >
                    Props
                  </Tab>
                  <Tab
                    style={{ flex: 1 }}
                    isSelected={meta.currentPane === 'hooks'}
                    onSelect={() => (meta.currentPane = 'hooks')}
                  >
                    Hooks
                  </Tab>
                </div>
                {meta.currentPane === 'props' && (
                  <>
                    {current && current.source && current.selected ? (
                      <CactivaTraits source={current.source} editor={current} />
                    ) : (
                      <Pane
                        padding={10}
                        alignItems='center'
                        justifyContent='center'
                      >
                        <img
                          src='/images/reindeer.svg'
                          style={{ width: '50%', margin: 20, opacity: 0.4 }}
                        />
                        <Text size={300}>Please select a component</Text>
                      </Pane>
                    )}
                  </>
                )}
                {meta.currentPane === 'hooks' && (
                  <>
                    {current && current.source && current.selected && (
                      <Text>
                        {JSON.stringify(current.selected.source, null, 2)}
                      </Text>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div></div>
          )}
        </Split>
      </div>
    </DndProvider>
  );
});
