import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
export default observer(({ editor, source, children }: any) => {
  const meta = useObservable({ hover: false });
  return (
    <div
      className={`cactiva-element ${meta.hover && 'hover'} ${editor.selected ===
        source.id && 'selected'}`}
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
        editor.selected = source.id;
      }}
    >
      {children}
    </div>
  );
});
