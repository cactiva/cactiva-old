import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
export default observer(({ editor, source, children }: any) => {
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
      }}
    >
      {children}
    </div>
  );
});
