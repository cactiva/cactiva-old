import { observer } from 'mobx-react-lite';
import React from 'react';
import './editor.scss';
import { renderChildren } from './utility/renderchild';
import { findTag } from './utility/tagmatcher';

export default observer(({ source, editor }: any) => {
  return (
    <div className='cactiva-editor'>
      {renderChildren(findTag(source), editor)}
    </div>
  );
});
