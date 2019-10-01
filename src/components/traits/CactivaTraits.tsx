import React from 'react';
import { observer } from 'mobx-react-lite';
import _ from 'lodash';

export default observer(({ source, editor }: any) => {
  const traits = _.get(editor, 'selected.tag.traits');

  if (!traits) {
    return null;
  }
  return <div>{JSON.stringify(traits)}</div>;
});
