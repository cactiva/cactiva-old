import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import { Text } from 'evergreen-ui';
export default observer(({ cactiva, children }: any) => {
  const { editor, source } = cactiva;
  const meta = useObservable({ hover: false });
  const classes = {
    hover: meta.hover ? 'hover' : '',
    selected: editor.selectedId === source.id ? 'selected' : ''
  };
  return (
    <div
      className={`cactiva-element ${classes.hover} ${classes.selected}`}
      onMouseOver={e => {
        e.stopPropagation();
        meta.hover = true;
      }}
      onMouseOut={e => {
        e.stopPropagation();
        meta.hover = false;
      }}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        editor.selectedId = source.id;
        editor.selected = cactiva;
      }}
    >
      <div
        className={`cactiva-element-tag ${classes.hover} ${classes.selected}`}
      >
        <Text size={300} color={'white'}>
          {cactiva.source.name}
        </Text>
      </div>
      {children}
    </div>
  );
});
