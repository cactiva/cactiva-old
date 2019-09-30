import { observer } from 'mobx-react-lite';
import React from 'react';
export default observer(({ editor, source, children }: any) => {
  return (
    <div
      className='cactiva-element'
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        editor.selected = source;
      }}
    >
      {children}
    </div>
  );
});
