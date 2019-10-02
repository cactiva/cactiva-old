import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import { Text } from 'evergreen-ui';
import _ from 'lodash';
export default observer(({ cactiva, children, className, style }: any) => {
  const { editor, source } = cactiva;
  const meta = useObservable({ hover: false });
  const classes = {
    hover: meta.hover ? 'hover' : '',
    selected: editor.selectedId === source.id ? 'selected' : '',
    horizontal: _.get(style, 'flexDirection') === 'row' ? 'horizontal' : ''
  };
  return (
    <div
      style={style}
      className={`cactiva-element ${className} ${classes.hover} ${classes.selected} ${classes.horizontal}`}
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
