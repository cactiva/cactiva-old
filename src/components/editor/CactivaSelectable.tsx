import { Text } from 'evergreen-ui';
import _ from 'lodash';
import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
export default observer(({ cactiva, children, className = '', style }: any) => {
  const { editor, source } = cactiva;
  const meta = useObservable({ hover: false });
  const classes = {
    hover: meta.hover ? 'hover' : '',
    selected: editor.selectedId === source.id ? 'selected' : '',
    horizontal: _.get(style, 'flexDirection') === 'row' ? 'horizontal' : '',
    kind: cactiva.kind ? 'kind' : ''
  };
  const name = cactiva.kind ? cactiva.kind.kindName : cactiva.tag.tagName;
  return (
    <div
      style={style}
      className={`cactiva-element ${Object.values(classes).join(
        ' '
      )} ${className}`}
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
        console.log(cactiva); 
        editor.selectedId = source.id;
      }}
    >
      <div
        className={`cactiva-element-tag ${classes.hover} ${classes.selected}`}
      >
        <Text size={300} color={'white'}>
          {name}
        </Text>
      </div>
      {children}
    </div>
  );
});
