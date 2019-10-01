import { Text } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { ICactivaTraitFieldProps } from '../CactivaTraitField';
import _ from 'lodash';
import { toJS } from 'mobx';

export default observer((trait: ICactivaTraitFieldProps) => {
  const value = _.get(trait.source, trait.path);
  console.log(toJS(trait.source));
  return (
    <Text>
      {JSON.stringify(trait.path)}
      {JSON.stringify(value)}
    </Text>
  );
});
