import { observer } from 'mobx-react-lite';
import React from 'react';
import './editor.scss';
import './tags/tags.scss';
import { renderChildren } from './utility/renderchild';
import { isTag } from './utility/tagmatcher';
export default observer(({ source, editor }: any) => {
  return (
    <div className='cactiva-editor'>
      {renderChildren({ name: '--root--', children: [source] }, editor)}
    </div>
  );
});
