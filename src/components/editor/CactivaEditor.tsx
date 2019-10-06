import { observer } from 'mobx-react-lite';
import React from 'react';
import './editor.scss';
import './tags/tags.scss';
import { renderChildren } from './utility/renderchild';
import CactivaBreadcrumb from './CactivaBreadcrumb';
import CactivaToolbar from './CactivaToolbar';
export default observer(({ source, editor }: any) => {
  const children = renderChildren(
    { name: '--root--', children: [source] },
    editor
  );
  return (
    <div className='cactiva-editor'>
      <div className='cactiva-wrapper'>
        <CactivaToolbar />
        <div className='cactiva-canvas'>{children}</div>
      </div>
      <CactivaBreadcrumb source={source} editor={editor} />
    </div>
  );
});
