import { Text } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { ICactivaTraitFieldProps } from '../CactivaTraitField';
import _ from 'lodash';
import { toJS } from 'mobx';

export default observer((trait: ICactivaTraitFieldProps) => {
  return (
    <input
      type='number'
      value={trait.value || ''}
      onChange={e => {
        const value = e.target.value;
        trait.update(value);
      }}
    />
  );
});
