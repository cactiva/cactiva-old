import { observer } from 'mobx-react-lite';
import React from 'react';
import { ICactivaTraitFieldProps } from '../CactivaTraitField';
import './TrueKeyword.scss';
import { SyntaxKind } from '@src/components/editor/utility/kinds';
import { Checkbox } from 'evergreen-ui';

export default observer((trait: ICactivaTraitFieldProps) => {
  return (
    <Checkbox
      label={null}
      checked={true}
      margin={0}
      onChange={() => {
        trait.update(undefined, SyntaxKind.FalseKeyword);
      }}
    />
  );
});
