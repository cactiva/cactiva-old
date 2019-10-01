import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer(({ source, editor }: any) => {
  console.log();
  return <div>{editor.selectedId}</div>;
});
